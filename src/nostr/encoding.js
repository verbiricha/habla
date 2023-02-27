import { Buffer } from "buffer";
import { bech32 } from "bech32";
import * as secp from "@noble/secp256k1";
import { findTag } from "./tags";

export function encodeTLV(hex, prefix, relays, author, kind) {
  const enc = new TextEncoder();

  let buf;
  if (prefix === "naddr") {
    buf = enc.encode(hex);
  } else {
    buf = secp.utils.hexToBytes(hex);
  }
  const tl0 = [0, buf.length, ...buf];

  const enc2 = new TextEncoder();
  const tl1 =
    relays
      ?.map((a) => {
        const data = enc2.encode(a);
        return [1, data.length, ...data];
      })
      .flat() ?? [];

  let tl2 = [];
  if (author) {
    const authorBuff = secp.utils.hexToBytes(author);
    tl2 = [2, authorBuff.length, ...authorBuff];
  }

  let tl3 = [];
  if (kind) {
    const kindBuff = new Buffer(4);
    kindBuff.writeUInt32BE(kind);
    tl3 = [3, kindBuff.length, ...kindBuff];
  }

  return bech32.encode(
    prefix,
    bech32.toWords([...tl0, ...tl1, ...tl2, ...tl3]),
    420
  );
}

export function decodeTLV(str) {
  const decoded = bech32.decode(str, 420);
  const data = bech32.fromWords(decoded.words);

  const entries = [];
  let x = 0;
  while (x < data.length) {
    const t = data[x];
    const l = data[x + 1];
    const v = data.slice(x + 2, x + 2 + l);
    entries.push({
      type: t,
      length: l,
      value: secp.utils.bytesToHex(new Uint8Array(v)),
    });
    x += 2 + l;
  }
  return entries;
}

export function encodeNaddr(ev, relays = []) {
  const d = ev.tags.find((t) => t[0] === "d")?.at(1);
  return encodeTLV(d, "naddr", relays, ev.pubkey, ev.kind);
}

function hexToString(value: string) {
  return Buffer.from(value, "hex").toString();
}

export function decodeNaddr(naddr) {
  const decoded = decodeTLV(naddr);
  const rawD = decoded.find(({ type }) => type === 0);
  const d = hexToString(rawD.value);
  const relays = decoded
    .filter(({ type }) => type === 1)
    .map(({ value }) => hexToString(value));
  const rawK = decoded.find(({ type }) => type === 3);
  const k = Buffer.from(rawK.value, "hex").readUInt32BE();
  const rawP = decoded.find(({ type }) => type === 2);
  const pubkey = rawP.value;
  const address = { d, k, pubkey, relays };
  return address;
}

export function decodeNprofile(nprofile) {
  const decoded = decodeTLV(nprofile);
  const dec = new TextDecoder();
  return {
    pubkey: decoded.find((r) => r.type === 0)?.value,
    relays: decoded
      .filter((r) => r.type === 1)
      .map((r) => dec.decode(Buffer.from(r.value, "hex"))),
  };
}

export function encodeNprofile(p, relays = []) {
  return encodeTLV(p, "nprofile", relays);
}

export function eventAddress(ev) {
  const d = findTag(ev.tags, "d");
  return `${ev.kind}:${ev.pubkey}:${d}`;
}

export function hexToBech32(hex, prefix) {
  const buf = secp.utils.hexToBytes(hex);
  return bech32.encode(prefix, bech32.toWords(buf));
}

export function bech32ToHex(s) {
  const { words } = bech32.decode(s, 420);
  const bytes = Buffer.from(bech32.fromWords(words));
  return bytes.toString("hex");
}

export function bech32ToText(str: string) {
  const decoded = bech32.decode(str, 1000);
  const buf = bech32.fromWords(decoded.words);
  return new TextDecoder().decode(Uint8Array.from(buf));
}
