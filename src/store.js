import { configureStore } from "@reduxjs/toolkit";
import relayReducer from "./relaysStore";

export const store = configureStore({
  reducer: {
    relay: relayReducer,
  },
});
