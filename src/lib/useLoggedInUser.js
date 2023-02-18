import { useState, useEffect } from "react";

import useRelays from "./useRelays";

export default function useLoggedInUser() {
  const { set } = useRelays();
  const [user, setUser] = useState(() => {
    return window.sessionStorage.getItem("login");
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
    window.sessionStorage.removeItem("login");
    setUser();
  }

  useEffect(() => {
    if (user) {
      window.sessionStorage.setItem("login", user);
    }
  }, [user]);

  return { user, logIn, logOut };
}
