import { Link } from "react-router-dom";

import { Flex, Box, Avatar, Text } from "@chakra-ui/react";

import { useProfile, encodeNprofile } from "../nostr";
import { nip19 } from "nostr-tools";
import Markdown from "./Markdown";
import Nip05 from "./nip05";
import useColors from "./useColors";

export default function User({
  linkToProfile = true,
  showUsername = true,
  showNip = true,
  showAbout = false,
  size = "md",
  dir = "horizontal",
  relays,
  pubkey,
  ...rest
}) {
  const { fg } = useColors();
  const { data } = useProfile({ pubkey, relays });
  const { name, picture, nip05, about } = data || {};
  const href =
    relays?.length > 0
      ? `/u/${encodeNprofile(pubkey, relays)}`
      : `/p/${nip19.npubEncode(pubkey)}`;
  const shortPubkey = pubkey && `${pubkey.slice(0, 6)}:${pubkey.slice(-6)}`;

  const component = (
    <Flex
      flexDirection="column"
      textAlign={dir === "vertical" && "center"}
      {...rest}
    >
      <Flex
        alignItems="center"
        flexDirection={dir === "horizontal" ? "row" : "column"}
      >
        <Avatar size={size} src={picture} name={name || pubkey} />
        {showUsername && (
          <Flex
            flexDirection="column"
            ml={dir === "horizontal" ? 3 : 0}
            overflow="hidden"
          >
            <Text as="span" fontWeight="bold">
              {name || shortPubkey}
            </Text>
            {showNip && nip05 && <Nip05 pubkey={pubkey} nip05={nip05} />}
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
    <Link style={{ textDecoration: "none", color: fg }} to={href}>
      {component}
    </Link>
  ) : (
    component
  );
}
