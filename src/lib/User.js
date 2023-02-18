import { Link } from "react-router-dom";
import { useProfile } from "nostr-react-habla";

import { Flex, Box, Avatar, Text } from "@chakra-ui/react";

import Markdown from "./Markdown";
import useNip05 from "./useNip05";

export default function User({
  linkToProfile = true,
  showUsername = true,
  showAbout = false,
  pubkey,
  ...rest
}) {
  const { data } = useProfile({ pubkey });
  const { name, picture, nip05, about } = data || {};
  const href = `/${pubkey}`;
  const shortPubkey = `${pubkey.slice(0, 6)}:${pubkey.slice(-6)}`;
  const nipPubkey = useNip05(nip05);

  const component = (
    <Flex flexDirection="column" {...rest}>
      <Flex alignItems="center">
        <Avatar src={picture} name={name || pubkey} />
        {showUsername && (
          <Box ml="3">
            <Text fontWeight="bold">{name || shortPubkey}</Text>
            {nip05 && nipPubkey === pubkey && (
              <Text fontSize="sm">{nip05}</Text>
            )}
          </Box>
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
  return linkToProfile ? <Link to={href}>{component}</Link> : component;
}
