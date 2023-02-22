import { createSlice } from "@reduxjs/toolkit";
import { getJsonKey } from "./storage";

const defaultRelays = [
  "wss://relay.snort.social",
  "wss://relay.damus.io",
  "wss://relay.nostr.wirednet.jp",
  "wss://nos.lol",
  "wss://nostr.wine",
];

let cachedRelays = null;
cachedRelays = getJsonKey("relays");

const initialState = {
  relays: cachedRelays ? cachedRelays : defaultRelays,
};

export const relaySlice = createSlice({
  name: "relays",
  initialState,
  reducers: {
    setRelays: (state, action) => {
      state.relays = action.payload;
    },
    addRelay: (state, action) => {
      state.relays = [...state.relays, action.payload];
    },
    removeRelay: (state, action) => {
      state.relays = state.relays.filter((r) => r !== action.payload);
    },
  },
});

export const { setRelays, addRelay, removeRelay } = relaySlice.actions;

export default relaySlice.reducer;
