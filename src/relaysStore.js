import { createSlice } from "@reduxjs/toolkit";

const defaultRelays = [
  "wss://relay.damus.io",
  "wss://eden.nostr.land",
  "wss://atlas.nostr.land",
  "wss://nos.lol",
  "wss://nostr.wine",
];

let cachedRelays = null;
try {
  const cached = window.sessionStorage.getItem("relays");
  if (cached?.length > 0) {
    cachedRelays = JSON.parse(cached);
  }
} catch (error) {
  console.error(error);
}

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
