import "@fontsource/inter/400.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/900.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/lato/400.css";
import "@fontsource/lato/700.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/playfair-display/900.css";

import "./App.css";

import { extendTheme } from "@chakra-ui/react";

const styles = {
  global: {
    body: {
      color: "font",
      background: "background",
    },
  },
};

export default extendTheme({ styles });
