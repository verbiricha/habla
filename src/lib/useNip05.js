import { useState } from "react";
import { getKey, setKey } from "../storage";

export async function getPubkey(nip05) {
  const [username, domain] = nip05.split("@");
  try {
    const { names } = await fetch(
      `https://${domain}/.well-known/nostr.json?name=${encodeURIComponent(
        username
      )}`
    ).then((r) => r.json());
    if (names) {
      return names[username.toLowerCase()];
    }
  } catch (error) {
    console.error(error);
  }
}

export default function useNip05(s) {
  const [pubkey, setPubkey] = useState(() => {
    if (!s) {
      return;
    } else if (!s.includes("@") && s.match(/[0-9A-Fa-f]{64}/g)) {
      return s;
    } else {
      const key = !s.includes("@") ? `_@${s}` : s;
      const cached = getKey(key);
      if (cached) {
        return cached;
      }
      getPubkey(key).then((pk) => {
        if (pk) {
          setPubkey(pk);
          setKey(key, pk);
        }
      });
    }
  });

  return pubkey;
}
