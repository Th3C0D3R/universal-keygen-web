export const metadata = {
  id: "010editor",
  name: "010 Editor 16.0.4 Keygen",
  fields: [
    {
      name: "name",
      label: "Name",
      type: "text",
      placeholder: "Name for the Keygen",
      required: true,
    },
  ],
};

export function interfaced() {
  const [name] = Array.from(arguments);
  const value = generateKey(name);
  return `${value}`;
}


const tableHex =
  "b844cb39674f75231172015fda24bb3ec60717354b77f963887282172148e70f0f" +
  "675f5be85a314869775b7847157a2b9212d138321ba14244223335607b4377103b" +
  "ab1e00008153ae12021da877036f9230c0438e0a3c2dbf0c9562fa6ff030e010f" +
  "734fb17f428952f0d355a1d365a0b06cc15cc13fd0acf3b60286b067133e414c" +
  "d30673a5d17136ad66df909342d827b1e58996b527688518d5c7179852cc01ff" +
  "515110dcc685c5ef54964435e27bc0d1e2de37cee4c40585532082e2e115a06" +
  "786906149272e7784531b7215617bf1d7740d638c23f8a12314a6e03ad2dd669" +
  "a041920140256746dd004f1ffc6ace401057df66fe623e4bdb411f2382359a07" +
  "f6554406a71cd243161bc928723f7010145fab74143e6e254b44d95070534b09" +
  "420fe620d82f5e2e8b77026d1771697aea7f2846b55b716cba19993a7639cd54" +
  "8d17886e24017e531333172d8e2bbe103d2a8205d159db63a1379a48d630465c" +
  "216a767a1c0ee760c71f650cb879b459f42726739a798217ba505c6d112a1b6e" +
  "86633c0e923f903402558960b555d11f392cc235802f7a2bfd649a75e84cf004" +
  "8551a8019579ad2c5b3f6001e638d8417663422a3533192ca25151585c08ab17" +
  "2903c70a772bb377ac300719ec2bd0025203d333a90ff35d2561bf06ad227169" +
  "b858e50dca5f56640d70db73a956fd59b75ae20b0e33dd0d3c5b603c5d49a659" +
  "bd53916d5e4c8d31d94979503d10e342ce611d12d57eed60e114f24e2d21f033" +
  "0127965a43628b5ea71fbe2f096f490d004a701cae5777244e00727e1e563300" +
  "8c460224cc5dc67a5078c724af58342df60d08478a35111efb3c1c45712b9552" +
  "a77721078956f375ef0ff1240f12e70a990152449c338e5ba1276d27a70b7b1b" +
  "dc60827f4b4f0770db67d9574a4fe8521262fc2c53200603396a230480188a77" +
  "f319f01623463709ae565c67c243fd45ca65f24f600dcb22fd0b3b64fe3aa67f" +
  "f63b79356244f8314018974f17322a096a4c6102b55f74016501f14a6333f418" +
  "2d716971996efe7aab5de82e2b7cb475db6eb66f835fd66d2a3cc2052d29db44" +
  "22054f5f9a144065485dea151d332069454f9f693a48050f453b6c7c203bfe70" +
  "9d74f6617441f131b0627b5750273315132908388c585634ef1aec003c0f4247" +
  "a77d6c7a794b8732bb5eb8586578f24fed001e6969625f25a2247e1fc162cd7d" +
  "8a2ffe173b64b8188377fe603b25a363bb344f21035bf471155f9f6e311a0427" +
  "cf7a3868892877466118eb69f51bc95ea80b466bca6a2a42431e0e5f4d518c01" +
  "3e41e9267630fa1ded015a6ff4492b641b46f207707d57266513c50b166b4948" +
  "e0651c6e521fb651025a693fd72bcd7abf2d803ee6510f67f25c030acd216102" +
  "ff5c1e06ae335f34b63b754a815df45d7b255b2c5c0a2755a4164539f216";

const dataTable = new Uint32Array(256);
for (let i = 0; i < dataTable.length; i++) {
  const offset = i * 8;
  dataTable[i] =
    parseInt(tableHex.slice(offset + 6, offset + 8), 16) * 0x1000000 +
    parseInt(tableHex.slice(offset + 4, offset + 6), 16) * 0x10000 +
    parseInt(tableHex.slice(offset + 2, offset + 4), 16) * 0x100 +
    parseInt(tableHex.slice(offset, offset + 2), 16);
}

function checksum(name, param3, param4) {
  let result = 0;
  let factor4 = Math.imul(param4, 0x0f) >>> 0;
  let factor3 = Math.imul(param3, 0x11) >>> 0;
  let offset12 = 0;
  let offset13 = 0;

  for (let i = 0; i < name.length; i++) {
    const code = name.charAt(i).toUpperCase().charCodeAt(0);
    const index4 = factor3 & 0xff;
    const index5 = factor4 & 0xff;
    const tableIndex = (code + 0x0d) & 0xff;
    const addIndex = offset12 & 0xff;

    factor3 = (factor3 + 9) >>> 0;
    factor4 = (factor4 + 0x0d) >>> 0;
    offset12 = (offset12 + 0x13) >>> 0;
    offset13 = (offset13 + 7) >>> 0;

    let value = (dataTable[code] + result) >>> 0;
    value = (value ^ dataTable[tableIndex]) >>> 0;
    value = Math.imul(value, dataTable[(code + 0x2f) & 0xff]) >>> 0;
    value = (value + dataTable[addIndex]) >>> 0;
    value = (value + dataTable[index4]) >>> 0;
    result = (value + dataTable[index5]) >>> 0;
  }

  return result;
}

function funcC060(value) {
  return ((((value ^ 0x18) + 0x3d) ^ 0xa7) >>> 0);
}

function funcBfd0(value) {
  const transformed = ((((value ^ 0x7892) + 0x4d30) & 0xffff) ^ 0x3421) >>> 0;
  return transformed % 11 === 0 ? transformed / 11 : 0;
}

function generateKey(name, userLimit = 17) {
  if (typeof name !== "string" || name.length === 0) {
    throw new TypeError("Name is required.");
  }
  if (name === "999" || name === "AnyOne") {
    throw new TypeError("Name is blacklisted and cannot be licensed.");
  }
  if (!Number.isInteger(userLimit) || userLimit < 0 || userLimit > 0xffffffff) {
    throw new RangeError("userLimit must be an unsigned 32-bit integer.");
  }

  const minBVar5 = userLimit === 0 ? 1 : userLimit;
  for (let bVar5 = minBVar5; bVar5 <= 0xff; bVar5++) {
    const param3 = bVar5 < 2 ? bVar5 : 0;

    for (let field70 = 0; field70 <= 1000; field70++) {
      if (field70 === 0) continue;

      const checksumValue = checksum(name, param3, field70);
      const c0 = checksumValue & 0xff;
      const c1 = (checksumValue >>> 8) & 0xff;
      const c2 = (checksumValue >>> 16) & 0xff;
      const c3 = (checksumValue >>> 24) & 0xff;

      const x = ((((bVar5 ^ 0xa7) - 0x3d) & 0xff) ^ 0x18) & 0xff;
      const l0 = x ^ c2;
      const encodedValue = field70 * 11;
      const v = ((((encodedValue ^ 0x3421) - 0x4d30) & 0xffff) ^ 0x7892) & 0xffff;
      const l1 = ((v >>> 8) ^ c3) & 0xff;
      const l2 = ((v & 0xff) ^ c1) & 0xff;

      if ((funcC060(l0 ^ c2) & 0xff) !== bVar5) continue;
      if (funcBfd0(((l1 ^ c3) << 8) | (l2 ^ c1)) !== field70) continue;

      const bytes = [l0, l1, l2, 0x9c, c0, c1, c2, c3];
      return [0, 2, 4, 6]
        .map((i) => bytes.slice(i, i + 2).map((byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase())
        .join("-");
    }
  }

  throw new Error(`Could not generate a valid key for name '${name}'.`);
}
