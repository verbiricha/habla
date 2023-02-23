import { useSelector, useDispatch } from "react-redux";

import { addRelay, removeRelay, setSelected } from "../relaysStore";

export default function useRelays() {
  const dispatch = useDispatch();
  const { relays, selectedRelays } = useSelector((s) => s.relay);

  function add(relay) {
    dispatch(addRelay(relay));
  }

  function remove(relay) {
    dispatch(removeRelay(relay));
  }

  function select(relay) {
    dispatch(setSelected(selectedRelays.concat([relay])));
  }

  function deselect(relay) {
    dispatch(setSelected(selectedRelays.filter((r) => r !== relay)));
  }

  function toggle(relay) {
    if (selectedRelays.includes(relay)) {
      deselect(relay);
    } else {
      select(relay);
    }
  }

  return {
    relays: relays.map(({ url }) => url),
    selectedRelays,
    add,
    remove,
    select,
    deselect,
    toggle,
  };
}
