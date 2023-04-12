import { createSlice } from "@reduxjs/toolkit";
import { getKey, getJsonKey } from "./storage";

const rw = { read: true, write: true };
const defaultRelays = [
  { url: "wss://nostr.wine/", options: rw },
  { url: "wss://nostr-pub.wellorder.net", options: rw },
  { url: "wss://nostr-relay.nokotaro.com/", options: rw },
  { url: "wss://relay.nostr.band/", options: rw },
  { url: "wss://relay.damus.io/", options: rw },
  { url: "wss://nos.lol/", options: rw },
  { url: "wss://offchain.pub/", options: rw },
  { url: "wss://relay.nostr.wirednet.jp/", options: rw },
];

const user = getKey("p");
const relays = getJsonKey(`r:${user}`) ?? defaultRelays;
const follows = getJsonKey(`f:${user}`) ?? [];
const contacts = getJsonKey(`c:${user}`) ?? [];
const selectedRelay =
  getKey(`sel:${user}`) ?? relays.find((r) => r.options.read)?.url;

const initialState = {
  user,
  relays,
  follows,
  contacts,
  selectedRelay,
  compatibleRelays: [],
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
      state.relays = state.relays.filter((r) => r.url !== action.payload);
    },
    setRelay: (state, action) => {
      state.selectedRelay = action.payload;
    },
    setFollows: (state, action) => {
      state.follows = action.payload;
    },
    setContacts: (state, action) => {
      state.contacts = action.payload;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    setCompatibleRelays(state, action) {
      state.compatibleRelays = action.payload;
    },
  },
});

export const {
  setRelays,
  addRelay,
  removeRelay,
  setRelay,
  setUser,
  setFollows,
  setContacts,
  setCompatibleRelays,
} = relaySlice.actions;

export default relaySlice.reducer;
