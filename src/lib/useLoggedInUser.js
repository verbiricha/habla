import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import useRelays from "./useRelays";
import { setUser } from "../relaysStore";
import { setKey, removeKey } from "../storage";

export default function useLoggedInUser() {
  const dispatch = useDispatch();
  const { set } = useRelays();
  const { user } = useSelector((s) => s.relay);

  async function logIn() {
    if (window.nostr) {
      try {
        const pk = await window.nostr.getPublicKey();
        dispatch(setUser(pk));
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
    dispatch(setUser());
  }

  useEffect(() => {
    if (user) {
      setKey("login", user);
    }
  }, [user]);

  return { user, logIn, logOut };
}
