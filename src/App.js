import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { extendTheme, ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import "@fontsource/inter/400.css";
import "@fontsource/ibm-plex-mono/400.css";

import "./App.css";
import { store } from "./store";
import NostrContext from "./NostrContext";
import Home from "./pages/index";
import Tag from "./pages/tag";
import Address from "./pages/address";
import Article from "./pages/article";
import Profile from "./pages/profile";
import Write from "./pages/write";

const styles = {
  global: {
    body: {
      color: "font",
      background: "background",
    },
  },
};

const theme = extendTheme({ styles });

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
    path: "/a/:naddr",
    element: <Address />,
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

function App() {
  return (
    <Provider store={store}>
      <NostrContext>
        <ChakraProvider theme={theme}>
          <RouterProvider router={router} />
        </ChakraProvider>
      </NostrContext>
    </Provider>
  );
}

export default App;
