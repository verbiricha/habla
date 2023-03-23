import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/index";
import Tag from "./pages/tag";
import Address from "./pages/address";
import Search from "./pages/search";
import Article from "./pages/article";
import Profile from "./pages/profile";
import NProfile from "./pages/nprofile";
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
    path: "/:p",
    element: <Profile />,
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
