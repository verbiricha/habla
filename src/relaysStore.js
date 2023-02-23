import { createSlice } from "@reduxjs/toolkit";
import { getKey, getJsonKey } from "./storage";

const defaultRelays = [
  { url: "wss://relay.snort.social/", options: { read: true, write: true } },
  { url: "wss://relay.damus.io/", options: { read: true, write: true } },
  { url: "wss://nos.lol/", options: { read: true, write: true } },
  {
    url: "wss://relay.nostr.wirednet.jp/",
    options: { read: true, write: true },
  },
  { url: "wss://nostr.wine/", options: { read: true, write: true } },
];

const user = getKey("login");
const relays = getJsonKey(`relays:${user}`) ?? defaultRelays;
const follows = getJsonKey(`follows:${user}`) ?? [];
const selectedRelays = relays
  .map((r) => (r.options.read ? [r.url] : []))
  .flat();

const initialState = {
  user,
  relays,
  follows,
  selectedRelays,
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
    setSelected: (state, action) => {
      state.selectedRelays = action.payload;
    },
    setFollows: (state, action) => {
      state.follows = action.payload;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
  },
});

export const {
  setRelays,
  addRelay,
  removeRelay,
  setSelected,
  setUser,
  setFollows,
} = relaySlice.actions;

export default relaySlice.reducer;
