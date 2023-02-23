import { Link } from "react-router-dom";

import { Flex, Box, Avatar, Text } from "@chakra-ui/react";

import { useProfile } from "../nostr";
import Markdown from "./Markdown";
import useNip05 from "./useNip05";

export default function User({
  linkToProfile = true,
  showUsername = true,
  showNip = true,
  showAbout = false,
  size = "md",
  pubkey,
  ...rest
}) {
  const { data } = useProfile({ pubkey });
  const { name, picture, nip05, about } = data || {};
  const href = `/${pubkey}`;
  const shortPubkey = `${pubkey.slice(0, 6)}:${pubkey.slice(-6)}`;
  const nipPubkey = useNip05(nip05);
  const [username, domain] = nip05?.split("@") ?? [];

  const component = (
    <Flex flexDirection="column" {...rest}>
      <Flex alignItems="center">
        <Avatar size={size} src={picture} name={name || pubkey} />
        {showUsername && (
          <Flex flexDirection="column" ml="3">
            <Text as="span" fontWeight="bold">
              {name || shortPubkey}
            </Text>
            {showNip && nip05 && nipPubkey === pubkey && (
              <Text as="span" fontSize="sm">
                {username === "_" ? domain : nip05}
              </Text>
            )}
          </Flex>
        )}
      </Flex>
      {showAbout && (
        <Box mt={4} px={2}>
          <Text>
            <Markdown content={about} />
          </Text>
        </Box>
      )}
    </Flex>
  );
  return linkToProfile ? (
    <Link style={{ textDecoration: "none" }} to={href}>
      {component}
    </Link>
  ) : (
    component
  );
}
