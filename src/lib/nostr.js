import { Buffer } from "buffer";
import { bech32 } from "bech32";
import * as secp from "@noble/secp256k1";

function encodeTLV(hex, prefix, relays, author, kind) {
  const enc = new TextEncoder();

  const buf = enc.encode(hex);
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

function processContent(ev) {
  const replaceNpub = (match: string) => {
    try {
      const hex = bech32ToHex(match);
      const idx = ev.tags.length;
      ev.tags.push(["p", hex, idx]);
      return `#[${idx}]`;
    } catch (error) {
      return match;
    }
  };
  const replaceNprofile = (match: string) => {
    try {
      const p = decodeNprofile(match);
      const idx = ev.tags.length;
      ev.tags.push(["p", p, idx]);
      return `#[${idx}]`;
    } catch (error) {
      return match;
    }
  };
  const replaceNaddr = (match: string) => {
    try {
      const [k, p, d] = decodeNaddr(match);
      const idx = ev.tags.length;
      ev.tags.push(["a", `${k}:${p}:${d}`, idx]);
      return `#[${idx}]`;
    } catch (error) {
      return match;
    }
  };
  const replaceNoteId = (match: string) => {
    try {
      const hex = bech32ToHex(match);
      const idx = ev.tags.length;
      ev.tags.push(["e", hex, idx]);
      return `#[${idx}]`;
    } catch (error) {
      return match;
    }
  };
  const replaceHashtag = (match: string) => {
    const tag = match.slice(1);
    const idx = ev.tags.length;
    ev.tags.push(["t", tag.toLowerCase(), idx]);
    return `#[${idx}]`;
  };
  const replaced = ev.content
    .replace(
      /\bnprofile1[a-z0-9]+\b(?=(?:[^`]*`[^`]*`)*[^`]*$)/g,
      replaceNprofile
    )
    .replace(/\bnpub1[a-z0-9]+\b(?=(?:[^`]*`[^`]*`)*[^`]*$)/g, replaceNpub)
    .replace(/\bnote1[a-z0-9]+\b(?=(?:[^`]*`[^`]*`)*[^`]*$)/g, replaceNoteId)
    .replace(/\bnaddr1[a-z0-9]+\b(?=(?:[^`]*`[^`]*`)*[^`]*$)/g, replaceNaddr)
    // eslint-disable-next-line no-useless-escape
    .replace(/(#[^\s!@#$%^&*()=+.\/,\[{\]};:'"?><]+)/g, replaceHashtag);
  ev.content = replaced;
}

export async function sign(ev) {
  processContent(ev);
  return await window.nostr.signEvent(ev);
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

export function encodeNaddr(ev) {
  const d = getMetadata(ev).d;
  return encodeTLV(d, "naddr", [], ev.pubkey, ev.kind);
}

export function decodeNaddr(naddr) {
  const [rawD, rawP, rawK] = decodeTLV(naddr);
  const d = Buffer.from(rawD.value, "hex").toString();
  const k = Buffer.from(rawK.value, "hex").readUInt32BE();
  const p = rawP.value;
  return [k, p, d];
}

export function decodeNprofile(nprofile) {
  const [rawP] = decodeTLV(nprofile);
  return rawP.value;
}

export function eventAddress(ev) {
  const d = findTag(ev.tags, "d");
  return `${ev.kind}:${ev.pubkey}:${d}`;
}

export function bech32ToHex(s) {
  const { words } = bech32.decode(s, 420);
  const bytes = Buffer.from(bech32.fromWords(words));
  return bytes.toString("hex");
}

export function findTags(tags, tag) {
  return tags.filter((t) => t[0] === tag).map((t) => t[1]);
}

export function findTag(tags, tag) {
  return tags.find((t) => t[0] === tag)?.at(1);
}

export function getMetadata(ev) {
  return {
    title: findTag(ev.tags, "title")?.replace("\n", " "),
    d: findTag(ev.tags, "d"),
    image: findTag(ev.tags, "image"),
    summary: findTag(ev.tags, "summary"),
    publishedAt: findTag(ev.tags, "published_at"),
    hashtags: findTags(ev.tags, "t"),
  };
}
