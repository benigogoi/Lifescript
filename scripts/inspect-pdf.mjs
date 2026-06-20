import { readFileSync } from "node:fs";

const buf = readFileSync(process.argv[2]);
const text = buf.toString("latin1");

const objRe = /(\d+)\s+0\s+obj\s*<<([\s\S]*?)>>\s*(stream)?/g;
let m;
const byType = new Map();
let totalStreamBytes = 0;

while ((m = objRe.exec(text))) {
  const [, , dict, hasStream] = m;
  if (!hasStream) continue;
  const streamStart = m.index + m[0].length;
  const endIdx = text.indexOf("endstream", streamStart);
  if (endIdx === -1) continue;
  const len = endIdx - streamStart;

  let type = "other";
  if (/\/Subtype\s*\/Image/.test(dict)) type = "image";
  else if (/\/FontFile[123]?\b/.test(dict) || /\/Type\s*\/Font/.test(dict)) type = "font";
  else if (/\/Type\s*\/XObject/.test(dict) && /\/Subtype\s*\/Form/.test(dict)) type = "form-xobject";
  else if (/\/Length1\b/.test(dict)) type = "font";
  else if (/\/Filter\s*\/FlateDecode/.test(dict) && /\/Length\b/.test(dict)) type = "flate-other";

  byType.set(type, (byType.get(type) || 0) + len);
  totalStreamBytes += len;
}

console.log("File size:", buf.length, "bytes");
console.log("Total stream bytes (approx):", totalStreamBytes);
console.log("By type:");
for (const [type, bytes] of [...byType.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${type.padEnd(15)} ${bytes.toString().padStart(10)} bytes`);
}

// Count image objects + their declared width/height
const imgRe = /\/Subtype\s*\/Image[^>]*?\/Width\s+(\d+)[^>]*?\/Height\s+(\d+)|\/Subtype\s*\/Image[^>]*?\/Height\s+(\d+)[^>]*?\/Width\s+(\d+)/g;
let im;
const images = [];
while ((im = imgRe.exec(text))) {
  images.push(im[1] ? [im[1], im[2]] : [im[4], im[3]]);
}
console.log("Image objects found:", images.length, images.slice(0, 20));

const fontNames = [...text.matchAll(/\/BaseFont\s*\/([A-Za-z0-9+\-,]+)/g)].map((x) => x[1]);
console.log("Fonts embedded:", [...new Set(fontNames)]);
