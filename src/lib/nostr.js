import { Buffer } from "buffer";
import { bech32 } from "bech32";

export function eventAddress(ev) {
  const d = findTag(ev.tags, "d");
  return `${ev.kind}:${ev.pubkey}:${d}`;
}

export function bech32ToHex(s) {
  const { words } = bech32.decode(s);
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
