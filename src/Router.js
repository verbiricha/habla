import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/index";
import Tag from "./pages/tag";
import Address from "./pages/address";
import Relay from "./pages/relay";
import Relays from "./pages/relays";
import Search from "./pages/search";
import Profile from "./pages/profile";
import NProfile from "./pages/nprofile";
import NPub from "./pages/npub";
import Write from "./pages/write";

export default createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "search",
    element: <Search />,
  },
  {
    path: "relays",
    element: <Relays />,
  },
  {
    path: "/r/:nrelay",
    element: <Relay />,
  },
  {
    path: "/a/:naddr",
    element: <Address />,
  },
  {
    path: "/u/:nprofile",
    element: <NProfile />,
  },
  {
    path: "/p/:npub",
    element: <NPub />,
  },
  {
    path: "/t/:t",
    element: <Tag />,
  },
  {
    path: "write",
    element: <Write />,
  },
  {
    path: ":p",
    element: <Profile />,
  },
]);
