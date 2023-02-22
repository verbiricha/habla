import { Link } from "react-router-dom";

import { useColorMode, Flex, Button } from "@chakra-ui/react";
import { MoonIcon, SunIcon, EditIcon } from "@chakra-ui/icons";

import User from "./User";
import useLoggedInUser from "./useLoggedInUser";

export default function Login() {
  const { user, logIn } = useLoggedInUser();

  return user ? (
    <Flex alignItems="center">
      <Link to="/write">
        <Button variant="unstyled">
          <EditIcon />
        </Button>
      </Link>
      <User showUsername={false} pubkey={user} />
    </Flex>
  ) : (
    <Flex>
      {window.nostr && (
        <Button size="md" onClick={logIn}>
          Login
        </Button>
      )}
    </Flex>
  );
}
