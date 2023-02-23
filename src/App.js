import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { ColorModeScript, ChakraProvider } from "@chakra-ui/react";

import { store } from "./store";
import NostrContext from "./NostrContext";
import theme from "./theme";
import router from "./Router";

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
