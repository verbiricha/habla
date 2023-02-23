import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { setUser } from "../relaysStore";
import { setKey, removeKey } from "../storage";

export default function useLoggedInUser() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.relay);

  async function logIn() {
    if (window.nostr) {
      try {
        const pk = await window.nostr.getPublicKey();
        dispatch(setUser(pk));
      } catch (error) {
        console.error(error);
      }
    }
  }

  function logOut() {
    removeKey("p");
    dispatch(setUser());
  }

  useEffect(() => {
    if (user) {
      setKey("p", user);
    }
  }, [user]);

  return { user, logIn, logOut };
}
