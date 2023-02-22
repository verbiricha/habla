import { useState, useEffect } from "react";

import useRelays from "./useRelays";
import { getKey, setKey, removeKey } from "../storage";

export default function useLoggedInUser() {
  const { set } = useRelays();
  const [user, setUser] = useState(() => {
    return getKey("login");
  });

  async function logIn() {
    if (window.nostr) {
      try {
        const pk = await window.nostr.getPublicKey();
        setUser(pk);
        if (window.nostr.getRelays) {
          const rs = await window.nostr.getRelays();
          set(Object.keys(rs));
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  function logOut() {
    removeKey("login");
    setUser();
  }

  useEffect(() => {
    if (user) {
      setKey("login", user);
    }
  }, [user]);

  return { user, logIn, logOut };
}
