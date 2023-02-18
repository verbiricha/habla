import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { NostrProvider } from "nostr-react-habla";
import { extendTheme, ChakraProvider, ColorModeScript } from "@chakra-ui/react";

import { store } from "./store";
import "./App.css";
import Home from "./pages/index";
import Tag from "./pages/tag";
import Article from "./pages/article";
import Profile from "./pages/profile";
import Write from "./pages/write";
import useRelays from "./lib/useRelays";

const config: ThemeConfig = {
  initialColorMode: "system",
  useSystemColorMode: true,
};

const theme = extendTheme({ config });

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/:p",
    element: <Profile />,
  },
  {
    path: "/:p/:d",
    element: <Article />,
  },
  {
    path: "/t/:t",
    element: <Tag />,
  },
  {
    path: "write",
    element: <Write />,
  },
]);

function NostrContext({ children }) {
  const { relays } = useRelays();

  useEffect(() => {
    window.sessionStorage.setItem("relays", JSON.stringify(relays));
  }, [relays]);

  return <NostrProvider relayUrls={relays}>{children}</NostrProvider>;
}

function App() {
  return (
    <Provider store={store}>
      <NostrContext>
        <ChakraProvider theme={theme}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <RouterProvider router={router} />
        </ChakraProvider>
      </NostrContext>
    </Provider>
  );
}

export default App;
