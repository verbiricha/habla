import { useState } from "react";

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
    } else if (!s.includes("@")) {
      return s;
    } else {
      const cached = window.sessionStorage.getItem(s);
      if (cached) {
        return cached;
      }
      getPubkey(s).then((pk) => {
        if (pk) {
          setPubkey(pk);
          window.sessionStorage.setItem(s, pk);
        }
      });
    }
  });

  return pubkey;
}
