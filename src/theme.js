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

const config = {
  initialColorMode: "dark",
  useSystemColorMode: true,
};

const colors = {
  purple: {
    500: "#A966FF",
  },
  primary: {
    400: "#141414",
  },
  secondary: {
    500: "#585858",
    300: "#B7B7B7",
  },
  green: {
    500: "#00FF75",
  },
  red: {
    500: "#F72119",
  },
  warning: {
    500: "#FFDD60",
  },
};

const styles = {
  global: (props) => ({
    body: {
      color: "foreground",
      bg: "background",
    },
  }),
};

export default extendTheme({ config, styles, colors });
