import { useSelector, useDispatch } from "react-redux";

import { addRelay, removeRelay } from "../relaysStore";

export default function useRelays() {
  const dispatch = useDispatch();
  const { relays } = useSelector((s) => s.relay);

  function add(relay) {
    dispatch(addRelay(relay));
  }

  function remove(relay) {
    dispatch(removeRelay(relay));
  }

  return { relays, add, remove };
}
