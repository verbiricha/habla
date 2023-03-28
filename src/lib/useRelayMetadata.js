import { useEffect, useState } from "react";
import { getJsonKey, setJsonKey } from "../storage";

export async function getRelayInfo(relay) {
  try {
    const url = new URL(relay);
    const isSecure = relay.startsWith("wss://");
    const relayInfoUrl = `${isSecure ? "https" : "http"}://${url.host}`;
    const data = await fetch(relayInfoUrl, {
      headers: {
        accept: "application/nostr+json",
      },
    }).then((r) => {
      if (r.ok) {
        return r.json();
      }
    });
    return data;
  } catch (error) {
    console.error(error);
  }
}

export default function useRelayInfo(relay) {
  const [info, setInfo] = useState();

  useEffect(() => {
    const key = `nip11:${relay}`;
    const cached = getJsonKey(key);
    if (!cached) {
      getRelayInfo(relay).then((i) => {
        if (i) {
          setInfo(i);
          setJsonKey(key, i);
        } else {
          setInfo();
        }
      });
    } else {
      setInfo(cached);
    }
  }, [relay]);

  return info;
}
