import { Link } from "react-router-dom";

import { Flex, Button } from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";

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
      <User size={["sm", "sm", "md"]} showUsername={false} pubkey={user} />
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
