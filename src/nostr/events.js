import { decode } from "light-bolt11-decoder";
import { bech32ToHex, decodeNaddr } from "./encoding";
import { findTag, findTags } from "./tags";

function processContent(ev, replaceTags) {
  const replaceNpub = (match: string) => {
    try {
      const hex = bech32ToHex(match);
      const tag = ["p", hex];
      const hasTag = ev.tags.find((t) => t[0] === "p" && t[1] === hex);
      if (!hasTag) {
        ev.tags.push(tag);
      }
      return match;
    } catch (error) {
      return match;
    }
  };
  const replaceNaddr = (match: string) => {
    try {
      const { k, pubkey, d } = decodeNaddr(match);
      const addr = `${k}:${pubkey}:${d}`;
      const hasTag = ev.tags.find((t) => t[0] === "a" && t[1] === addr);
      if (!hasTag) {
        ev.tags.push(["a", addr]);
      }
      return match;
    } catch (error) {
      return match;
    }
  };
  const replaceNoteId = (match: string) => {
    try {
      const hex = bech32ToHex(match);
      const hasTag = ev.tags.find((t) => t[0] === "e" && t[1] === hex);
      if (!hasTag) {
        ev.tags.push(["e", hex]);
      }
      return match;
    } catch (error) {
      return match;
    }
  };
  const replaceHashtag = (match: string) => {
    const tag = match.slice(1);
    const hasTag = ev.tags.find((t) => t[0] === "t" && t[1] === tag);
    if (!hasTag) {
      ev.tags.push(["t", tag]);
    }
    return match;
  };
  const replaced = ev.content
    .replace(/\bnpub1[a-z0-9]+\b(?=(?:[^`]*`[^`]*`)*[^`]*$)/g, replaceNpub)
    .replace(/\bnote1[a-z0-9]+\b(?=(?:[^`]*`[^`]*`)*[^`]*$)/g, replaceNoteId)
    .replace(/\bnaddr1[a-z0-9]+\b(?=(?:[^`]*`[^`]*`)*[^`]*$)/g, replaceNaddr);
  ev.content = replaceTags
    ? replaced.replace(
        /(#[^\s!@#$%^&*()=+.\/,\[{\]};:'"?><]+)/g,
        replaceHashtag
      )
    : replaced;
}

export async function sign(ev, replaceTags = true) {
  processContent(ev, replaceTags);
  return await window.nostr.signEvent(ev);
}

export async function signEvent(ev) {
  return await window.nostr.signEvent(ev);
}

export function getMetadata(ev) {
  const warning = findTag(ev.tags, "content-warning");
  const reward = findTag(ev.tags, "reward");
  return {
    title: findTag(ev.tags, "title")?.replace("\n", " "),
    d: findTag(ev.tags, "d"),
    image: findTag(ev.tags, "image"),
    summary: findTag(ev.tags, "summary"),
    publishedAt: findTag(ev.tags, "published_at"),
    hashtags: findTags(ev.tags, "t"),
    sensitive: Boolean(warning),
    warning: warning,
    reward: /^\d+$/.test(reward) ? Number(reward) : null,
  };
}

export function getZapRequest(zap) {
  let zapRequest = findTag(zap.tags, "description");
  if (zapRequest) {
    try {
      if (zapRequest.startsWith("%")) {
        zapRequest = decodeURIComponent(zapRequest);
      }
      return JSON.parse(zapRequest);
    } catch (e) {
      console.warn("Invalid zap", zapRequest);
    }
  }
}

export function getZapAmount(zap) {
  try {
    const invoice = findTag(zap.tags, "bolt11");
    if (invoice) {
      const decoded = decode(invoice);
      const amount = decoded.sections.find(({ name }) => name === "amount");
      return Number(amount.value) / 1000;
    }
    return 0;
  } catch (error) {
    return 0;
  }
}
