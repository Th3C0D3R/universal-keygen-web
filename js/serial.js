// dsa-sign.js
// Pure JS DSA signing (SHA-1, ASN.1 DER (r,s)), browser-compatible.
// Usage example at bottom.

//
// Helpers
//

function base64ToBytes(b64) {
  const bin = atob(b64);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}

function bytesToBigInt(bytes) {
  let v = 0n;
  for (const b of bytes) {
    v = (v << 8n) + BigInt(b);
  }
  return v;
}

function bigIntToBytes(num) {
  if (num === 0n) return new Uint8Array([0]);
  const parts = [];
  let v = num;
  while (v > 0n) {
    parts.push(Number(v & 0xFFn));
    v >>= 8n;
  }
  parts.reverse();
  return new Uint8Array(parts);
}

// modular exponentiation (base^exp mod mod)
function modPow(base, exp, mod) {
  base = base % mod;
  let result = 1n;
  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % mod;
    base = (base * base) % mod;
    exp >>= 1n;
  }
  return result;
}

// Extended GCD -> returns [g, x, y] so that a*x + b*y = g
function egcd(a, b) {
  let old_r = a, r = b;
  let old_s = 1n, s = 0n;
  let old_t = 0n, t = 1n;
  while (r !== 0n) {
    const q = old_r / r;
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
    [old_t, t] = [t, old_t - q * t];
  }
  return [old_r, old_s, old_t];
}

// modular inverse of a modulo m
function modInv(a, m) {
  a = ((a % m) + m) % m;
  const [g, x] = (() => { const r = egcd(a, m); return [r[0], r[1]]; })();
  if (g !== 1n) throw new Error("modInv: inverse does not exist");
  return ((x % m) + m) % m;
}

// secure random BigInt in [1, maxExclusive-1]
function randomBigIntBelow(maxExclusive) {
  if (maxExclusive <= 1n) throw new Error("randomBigIntBelow: maxExclusive <= 1");
  const byteLen = Math.ceil(Number((maxExclusive.toString(2).length) / 8));
  const maxBytes = byteLen;
  const tmp = new Uint8Array(maxBytes);
  while (true) {
    crypto.getRandomValues(tmp); // secure RNG
    // mask high bits to be within bit length of maxExclusive
    let rnd = bytesToBigInt(tmp);
    // If rnd >= maxExclusive, reject and retry (rejection sampling)
    if (rnd >= 1n && rnd < maxExclusive) return rnd;
    // else loop
  }
}

// SHA-1 hash helper using SubtleCrypto returns Uint8Array
async function sha1(bytes) {
  const hash = await crypto.subtle.digest('SHA-1', bytes);
  return new Uint8Array(hash);
}

//
// ASN.1 DER encoding of INTEGER and SEQUENCE
//
function derEncodeInteger(bigint) {
  let bytes = bigIntToBytes(bigint);
  // If highest bit set, prefix 0x00 to indicate positive INTEGER
  if (bytes.length > 0 && (bytes[0] & 0x80) !== 0) {
    const newBytes = new Uint8Array(bytes.length + 1);
    newBytes[0] = 0x00;
    newBytes.set(bytes, 1);
    bytes = newBytes;
  }
  // INTEGER tag 0x02
  const len = bytes.length;
  const lenBytes = derEncodeLength(len);
  const out = new Uint8Array(1 + lenBytes.length + len);
  out[0] = 0x02;
  out.set(lenBytes, 1);
  out.set(bytes, 1 + lenBytes.length);
  return out;
}

function derEncodeLength(len) {
  if (len < 0x80) {
    return new Uint8Array([len]);
  } else {
    // long form
    const tmp = [];
    let v = len;
    while (v > 0) {
      tmp.push(v & 0xFF);
      v >>= 8;
    }
    tmp.reverse();
    return new Uint8Array([0x80 | tmp.length, ...tmp]);
  }
}

function derEncodeSequence(elements) {
  // elements: array of Uint8Array
  let totalLen = 0;
  for (const e of elements) totalLen += e.length;
  const lenBytes = derEncodeLength(totalLen);
  const out = new Uint8Array(1 + lenBytes.length + totalLen);
  out[0] = 0x30; // SEQUENCE
  out.set(lenBytes, 1);
  let offset = 1 + lenBytes.length;
  for (const e of elements) {
    out.set(e, offset);
    offset += e.length;
  }
  return out;
}

//
// Main: DSA sign function
//
// params: object with BigInt values {p, q, g, x} (private key x required)
// data: Uint8Array (data to sign) -- like SignData() we will hash with SHA-1
//
async function dsaSign(params, data) {
  // params.p, params.q, params.g, params.x are BigInt
  const { p, q, g, x } = params;
  if (!p || !q || !g || !x) throw new Error("Missing DSA parameters (need p,q,g,x)");
  // 1) Hash data with SHA-1
  const Hbytes = await sha1(data);
  // DSA uses SHA-1 (160-bit) — interpret hash as integer H
  let H = bytesToBigInt(Hbytes);
  // 2) generate k in [1, q-1]
  let k;
  do {
    k = randomBigIntBelow(q); // random in [1, q-1]
  } while (k === 0n);
  // 3) r = (g^k mod p) mod q
  const r = modPow(g, k, p) % q;
  if (r === 0n) return dsaSign(params, data); // per spec, retry if r==0
  // 4) s = k^{-1} * (H + x*r) mod q
  const kinv = modInv(k, q);
  const s = (kinv * ((H + (x * r)) % q)) % q;
  if (s === 0n) return dsaSign(params, data); // retry if s==0
  // 5) DER encode sequence (r,s)
  const rEnc = derEncodeInteger(r);
  const sEnc = derEncodeInteger(s);
  const seq = derEncodeSequence([rEnc, sEnc]);
  return seq; // Uint8Array
}

//
// Utility: parse DSA XML (string) into BigInt params {p,q,g,y,x}
// Accepts <DSAKeyValue> xml with Base64 nodes.
// If X (private) present, includes x as BigInt.
//
function parseDSAKeyFromXML(xmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "application/xml");
  function get(name) {
    const el = doc.querySelector(name);
    if (!el) return null;
    return el.textContent.trim();
  }
  const pB = get("P"), qB = get("Q"), gB = get("G"), yB = get("Y"), xB = get("X");
  if (!pB || !qB || !gB) throw new Error("XML missing P/Q/G");
  const p = bytesToBigInt(base64ToBytes(pB));
  const q = bytesToBigInt(base64ToBytes(qB));
  const g = bytesToBigInt(base64ToBytes(gB));
  const y = yB ? bytesToBigInt(base64ToBytes(yB)) : null;
  const x = xB ? bytesToBigInt(base64ToBytes(xB)) : null;
  return { p, q, g, y, x };
}

//
// Example wrapper to create the final serial like your C#:
// generateSerial(username, xmlPrivateKey, expirationBytesArray)
// returns base64 string of (DER(signature) || expirationBytes)
//
async function generateSerialFromXML(username, xmlPrivateKey, expirationBytes) {
  const params = parseDSAKeyFromXML(xmlPrivateKey);
  if (!params.x) throw new Error("Private key X not found in XML (need X to sign)");
  const encoder = new TextEncoder();
  const data = encoder.encode(username);
  const sig = await dsaSign(params, data); // Uint8Array
  // Append expiration bytes
  const final = new Uint8Array(sig.length + expirationBytes.length);
  final.set(sig, 0);
  final.set(new Uint8Array(expirationBytes), sig.length);
  // Base64
  let str = "";
  for (let i = 0; i < final.length; i++) str += String.fromCharCode(final[i]);
  return btoa(str);
}

//
// Export for usage in browser modules or attach to window
//
if (typeof window !== "undefined") {
  window.dsaSign = dsaSign;
  window.dsaParseXML = parseDSAKeyFromXML;
  window.generateSerialFromXML = generateSerialFromXML;
}
