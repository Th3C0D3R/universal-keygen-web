// dsa-sign.js
// Pure JS DSA signing (SHA-1, ASN.1 DER (r,s)), browser-compatible.
// Usage example at bottom.

// Hilfsfunktionen
function base64ToBytes(b64) {
    return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

function bytesToBigInt(bytes) {
    let result = 0n;
    for (const byte of bytes) {
        result = (result << 8n) | BigInt(byte);
    }
    return result;
}

function bigIntToBytes(value, length) {
    const bytes = [];
    while (value > 0n) {
        bytes.unshift(Number(value & 0xFFn));
        value >>= 8n;
    }
    // Padding auf gewünschte Länge
    while (bytes.length < length) bytes.unshift(0);
    return new Uint8Array(bytes);
}

// Modular Exponentiation
function modPow(base, exp, mod) {
    let result = 1n;
    base = base % mod;
    while (exp > 0n) {
        if (exp % 2n === 1n) result = (result * base) % mod;
        exp >>= 1n;
        base = (base * base) % mod;
    }
    return result;
}

// Modular Inverse (erweiterter euklidischer Algorithmus)
function modInverse(a, m) {
    let [old_r, r] = [a, m];
    let [old_s, s] = [1n, 0n];
    while (r !== 0n) {
        const q = old_r / r;
        [old_r, r] = [r, old_r - q * r];
        [old_s, s] = [s, old_s - q * s];
    }
    return ((old_s % m) + m) % m;
}

// SHA-1 Hash (benötigt Web Crypto)
async function sha1(data) {
    const hash = await crypto.subtle.digest("SHA-1", data);
    return new Uint8Array(hash);
}

// XML Parser
function parseDSAKeyFromXML(xmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "application/xml");
    
    function get(name) {
        const el = doc.querySelector(name);
        return el ? el.textContent.trim() : null;
    }

    const p = bytesToBigInt(base64ToBytes(get("P")));
    const q = bytesToBigInt(base64ToBytes(get("Q")));
    const g = bytesToBigInt(base64ToBytes(get("G")));
    const y = bytesToBigInt(base64ToBytes(get("Y")));
    const x = bytesToBigInt(base64ToBytes(get("X")));

    return { p, q, g, y, x };
}

// DSA Signieren
async function dsaSign(data, key) {
    const { p, q, g, x } = key;

    // Hash der Daten
    const hashBytes = await sha1(data);
    const h = bytesToBigInt(hashBytes);

    // Zufälliges k generieren (1 < k < q)
    let k, r = 0n, s = 0n;
    while (r === 0n || s === 0n) {
        // k zufällig wählen
        const kBytes = crypto.getRandomValues(new Uint8Array(20));
        k = bytesToBigInt(kBytes) % (q - 1n) + 1n;

        // r = (g^k mod p) mod q
        r = modPow(g, k, p) % q;
        if (r === 0n) continue;

        // s = k^-1 * (h + x*r) mod q
        const kInv = modInverse(k, q);
        s = (kInv * ((h + x * r) % q)) % q;
    }

    // Signatur als Byte-Array (r und s je 20 bytes)
    const rBytes = bigIntToBytes(r, 20);
    const sBytes = bigIntToBytes(s, 20);

    return new Uint8Array([...rBytes, ...sBytes]);
}

// Hauptfunktion
async function generateSerial(username, expirationTime, keyxml) {
    const key = parseDSAKeyFromXML(keyxml);
    const bytesData = new TextEncoder().encode(username);

    const signature = await dsaSign(bytesData, key);

    const combined = new Uint8Array([...signature, ...expirationTime]);
    return btoa(String.fromCharCode(...combined));
}

//
// Export for usage in browser modules or attach to window
//
if (typeof window !== "undefined") {
  window.dsaSign = dsaSign;
  window.dsaParseXML = parseDSAKeyFromXML;
  window.generateSerialFromXML = generateSerial;
}
