import { Event as NostrEvent } from "nostr-tools";

export function getEventId(event: NostrEvent): string {
  if (event.kind >= 30000 && event.kind <= 39999) {
    const d = event.tags.find((t) => t[0] === "d")?.at(1);
    return `${event.kind}:${event.pubkey}:${d}`;
  }
  return event.id;
}

export const uniqByFn = <T>(arr: T[], keyFn: any): T[] => {
  return Object.values(
    arr.reduce((map, item) => {
      const key = keyFn(item);
      return {
        ...map,
        [key]: item,
      };
    }, {})
  );
};

export const uniqBy = <T>(arr: T[], key: keyof T): T[] => {
  return Object.values(
    arr.reduce(
      (map, item) => ({
        ...map,
        [`${item[key]}`]: item,
      }),
      {}
    )
  );
};

export const uniqValues = (value: string, index: number, self: string[]) => {
  return self.indexOf(value) === index;
};

export const dateToUnix = (_date?: Date) => {
  const date = _date || new Date();

  return Math.floor(date.getTime() / 1000);
};

export function normalizeURL(url: string): string {
  let p = new URL(url);
  p.pathname = p.pathname.replace(/\/+/g, "/");
  if (p.pathname.endsWith("/")) p.pathname = p.pathname.slice(0, -1);
  if (
    (p.port === "80" && p.protocol === "ws:") ||
    (p.port === "443" && p.protocol === "wss:")
  )
    p.port = "";
  p.searchParams.sort();
  p.hash = "";
  return p.toString();
}

export function NIP27URLReplace(content: string) {
  // Replaces any website URL if they contain any NOSTR identifier (NIP-19) with a NOSTR text note reference (NIP-27)
  // Reference:
  //  * NIP-27 text note references: https://github.com/nostr-protocol/nips/blob/master/27.md
  //  * NIP-19 identifiers: https://github.com/nostr-protocol/nips/blob/master/19.md
  //  * NIP-19 identifiers size table: https://gist.github.com/LouisSaberhagen/f31c0f7869ab4b5c1844aff59873ef41

  const urlPattern = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/gi;
  
  const nPubPattern = /npub[0-9a-zA-Z]{32,}/g; // npub + 32 bytes
  const notePattern = /note[0-9a-zA-Z]{32,}/g; // note + 32 bytes
  const nProfilePattern = /nprofile[0-9a-zA-Z]{32,}/g; // nprofile + 34 bytes 
  const nEventPattern = /nevent[0-9a-zA-Z]{32,}/g; // nevent + 34 bytes
  const nRelayPattern = /nrelay[0-9a-zA-Z]{3,}/g; // nrelay + 3 bytes 
  const nAddrPattern = /naddr[0-9a-zA-Z]{42,}/g; // naddr + 42 bytes

  return content.replace(urlPattern, (url) => {
    const match = url.match(nPubPattern) ?? url.match(notePattern) ?? url.match(nProfilePattern) ?? url.match(nEventPattern) ?? url.match(nRelayPattern) ?? url.match(nAddrPattern);
    if (match) {
       return 'nostr:' + match[0];
    } else {
      return url;
    }
  });
}
