import { useNavigate, Link } from "react-router-dom";

import { useColorMode, Flex, Button } from "@chakra-ui/react";
import { MoonIcon, SunIcon, SearchIcon, EditIcon } from "@chakra-ui/icons";

import User from "./User";
import useLoggedInUser from "./useLoggedInUser";

export default function Login() {
  const navigate = useNavigate();
  const { user, logIn, logOut } = useLoggedInUser();
  const { colorMode, toggleColorMode } = useColorMode();

  const handleLogout = () => {
    logOut();
    navigate("/");
  };

  const themeSelector = (
    <Button variant="unstyled" onClick={toggleColorMode}>
      {colorMode === "light" ? (
        <MoonIcon color="secondary.500" />
      ) : (
        <SunIcon color="warning.500" />
      )}
    </Button>
  );

  return user ? (
    <Flex alignItems="center">
      <Button onClick={handleLogout}>Log out</Button>
      <Link to="/search">
        <Button color="secondary.500" variant="unstyled">
          <SearchIcon />
        </Button>
      </Link>
      <Link to="/write">
        <Button color="secondary.500" variant="unstyled">
          <EditIcon />
        </Button>
      </Link>
      {themeSelector}
      <User size={["sm", "sm", "md"]} showUsername={false} pubkey={user} />
    </Flex>
  ) : (
    <Flex>
      <Link to="/search">
        <Button color="secondary.500" variant="unstyled">
          <SearchIcon />
        </Button>
      </Link>
      {themeSelector}
      {window.nostr && (
        <Button size="md" onClick={logIn}>
          Login
        </Button>
      )}
    </Flex>
  );
}
