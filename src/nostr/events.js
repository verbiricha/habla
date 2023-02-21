import { bech32ToHex, decodeNprofile, decodeNaddr } from "./encoding";
import { findTag, findTags } from "./tags";

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
