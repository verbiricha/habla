import { Link } from "react-router-dom";

import { useColorMode, Flex, Button } from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

import User from "./User";
import useLoggedInUser from "./useLoggedInUser";

export default function Login() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logIn } = useLoggedInUser();

  const themeSelector = (
    <Button variant="unstyled" onClick={toggleColorMode}>
      {colorMode === "light" ? (
        <MoonIcon color="gray.300" />
      ) : (
        <SunIcon color="yellow.300" />
      )}
    </Button>
  );

  return user ? (
    <Flex alignItems="center">
      {themeSelector}
      <Link to="/write">
        <User linkToProfile={false} showUsername={false} pubkey={user} />
      </Link>
    </Flex>
  ) : (
    <Flex>
      {themeSelector}
      <Button size="md" onClick={logIn}>
        Login
      </Button>
    </Flex>
  );
}
