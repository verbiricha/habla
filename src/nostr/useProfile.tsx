import { useEffect, useState } from "react";
import { atom, useAtom } from "jotai";
import { Event as NostrEvent } from "nostr-tools";

import { useNostrEvents } from "./core";
import { uniqValues } from "./utils";

export interface Metadata {
  name?: string;
  username?: string;
  display_name?: string;
  picture?: string;
  banner?: string;
  about?: string;
  website?: string;
  lud06?: string;
  lud16?: string;
  nip05?: string;
}

const QUEUE_DEBOUNCE_DURATION = 100;

let timer: NodeJS.Timeout | undefined = undefined;

const queuedPubkeysAtom = atom<string[]>([]);
const requestedPubkeysAtom = atom<string[]>([]);
const fetchedProfilesAtom = atom<Record<string, Metadata>>({});

function useProfileQueue({ pubkey }: { pubkey: string }) {
  const [isReadyToFetch, setIsReadyToFetch] = useState(false);

  const [queuedPubkeys, setQueuedPubkeys] = useAtom(queuedPubkeysAtom);

  const [requestedPubkeys] = useAtom(requestedPubkeysAtom);
  const alreadyRequested = !!requestedPubkeys.includes(pubkey);

  useEffect(() => {
    if (alreadyRequested) {
      return;
    }

    clearTimeout(timer);

    timer = setTimeout(() => {
      setIsReadyToFetch(true);
    }, QUEUE_DEBOUNCE_DURATION);

    setQueuedPubkeys((_pubkeys: string[]) => {
      // Unique values only:
      const arr = [..._pubkeys, pubkey].filter(uniqValues).filter((_pubkey) => {
        return !requestedPubkeys.includes(_pubkey);
      });

      return arr;
    });
  }, [pubkey, setQueuedPubkeys, alreadyRequested, requestedPubkeys]);

  return {
    pubkeysToFetch: isReadyToFetch ? queuedPubkeys : [],
  };
}

function getCached(pubkey: string) {
  const cached = window.sessionStorage.getItem(`profile:${pubkey}`);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (error) {
      console.error(error);
      window.sessionStorage.removeItem(`profile:${pubkey}`);
    }
  }
}

function setCached(pubkey: string, rawMetadata: NostrEvent) {
  window.sessionStorage.setItem(`profile:${pubkey}`, rawMetadata.content);
}

export function useProfile({
  pubkey,
  enabled: _enabled = true,
}: {
  pubkey: string;
  enabled?: boolean;
}) {
  const [, setRequestedPubkeys] = useAtom(requestedPubkeysAtom);
  const { pubkeysToFetch } = useProfileQueue({ pubkey });
  const enabled = _enabled && !!pubkeysToFetch.length;

  const [fetchedProfiles, setFetchedProfiles] = useAtom(fetchedProfilesAtom);

  const { onEvent, onSubscribe, isLoading, onDone } = useNostrEvents({
    filter: {
      kinds: [0],
      authors: pubkeysToFetch,
    },
    enabled,
  });

  useEffect(() => {
    const cached = getCached(pubkey);
    if (cached) {
      setFetchedProfiles((_profiles: Record<string, Metadata>) => {
        return {
          ..._profiles,
          [pubkey]: cached,
        };
      });
    }
  }, [pubkey]);

  onSubscribe(() => {
    // Reset list
    // (We've already opened a subscription to these pubkeys now)
    setRequestedPubkeys((_pubkeys) => {
      return [..._pubkeys, ...pubkeysToFetch].filter(uniqValues);
    });
  });

  onEvent((rawMetadata) => {
    try {
      window.sessionStorage.setItem(`profile:${pubkey}`, rawMetadata.content);
      const metadata: Metadata = JSON.parse(rawMetadata.content);
      const metaPubkey = rawMetadata.pubkey;

      if (metadata) {
        setCached(metaPubkey, rawMetadata);
        setFetchedProfiles((_profiles: Record<string, Metadata>) => {
          return {
            ..._profiles,
            [metaPubkey]: metadata,
          };
        });
      }
    } catch (err) {
      console.error(err, rawMetadata);
    }
  });

  const data = fetchedProfiles[pubkey];

  return {
    isLoading,
    onDone,
    data,
  };
}
