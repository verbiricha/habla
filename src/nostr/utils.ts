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
