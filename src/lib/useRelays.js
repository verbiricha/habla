import { useSelector, useDispatch } from "react-redux";

import { dateToUnix, signEvent, useNostr, normalizeURL } from "../nostr";
import { addRelay, removeRelay, setSelected } from "../relaysStore";

export default function useRelays() {
  const dispatch = useDispatch();
  const { publish, pool } = useNostr();
  const { relays, contacts, selectedRelays } = useSelector((s) => s.relay);

  async function add(relay) {
    pool.ensureRelay(relay);
    const newRelay = {
      url: relay,
      options: { read: true, write: true },
    };
    dispatch(addRelay(newRelay));
    // save relay to your profile
    const rs = relays.reduce(
      (acc, { url, options }) => {
        acc[url] = options;
        return acc;
      },
      { [normalizeURL(relay)]: { read: true, write: true } }
    );
    const ev = {
      kind: 3,
      tags: contacts,
      created_at: dateToUnix(),
      content: JSON.stringify(rs),
    };
    try {
      const signed = await signEvent(ev);
      publish(signed);
    } catch (error) {
      console.error(error);
    }
  }

  async function remove(relay) {
    dispatch(removeRelay(relay));
    dispatch(setSelected(selectedRelays.filter((r) => r !== relay)));
    pool.close([relay]);
    // save relay to your profile
    const rs = relays.reduce((acc, { url, options }) => {
      if (url === relay) {
        return acc;
      }
      acc[url] = options;
      return acc;
    }, {});
    const ev = {
      kind: 3,
      tags: contacts,
      created_at: dateToUnix(),
      content: JSON.stringify(rs),
    };
    try {
      const signed = await signEvent(ev);
      publish(signed);
    } catch (error) {
      console.error(error);
    }
  }

  async function select(relay) {
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
