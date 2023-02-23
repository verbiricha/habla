import { useState, useMemo } from "react";
import { useNostr } from "../nostr";

import {
  Box,
  Tooltip,
  Heading,
  Button,
  Avatar,
  AvatarBadge,
  Flex,
  Text,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { PhoneIcon, DeleteIcon } from "@chakra-ui/icons";

import useRelays from "./useRelays";

export function trimRelayUrl(url) {
  return url.replace("wss://", "");
}

export function RelayFavicon({ url, children, ...rest }) {
  const domain = url
    .replace("wss://relay.", "https://")
    .replace("wss://", "https://")
    .replace("ws://", "http://")
    .replace(/\/$/, "");
  return (
    <Tooltip label={url}>
      <Avatar
        size="xs"
        src={`${domain}/favicon.ico`}
        icon={<PhoneIcon />}
        {...rest}
      >
        {children}
      </Avatar>
    </Tooltip>
  );
}

function Relay({ url, isConnected }) {
  const { remove } = useRelays();
  return (
    <>
      <Flex alignItems="center" mb={2}>
        <RelayFavicon url={url}>
          {isConnected && <AvatarBadge boxSize="1.25em" bg="green.500" />}
        </RelayFavicon>
        <Text fontFamily="var(--font-mono)" fontSize="12px" ml={2}>
          {url}
        </Text>
        <DeleteIcon
          cursor="pointer"
          onClick={() => remove(url)}
          ml="auto"
          color="red.500"
          size="sm"
        />
      </Flex>
    </>
  );
}

export function RelayList({ relays, showUrl = false, ...props }) {
  const urls = useMemo(() => {
    if (!relays) {
      return [];
    }
    const sorted = Array.from(relays);
    sorted.sort();
    return sorted;
  }, [relays]);
  return (
    <Flex {...props}>
      {urls.map((url) => (
        <Flex alignItems="center" key={url}>
          <RelayFavicon url={url} mr={2} />
          {showUrl && (
            <Text margin={0} my={1} fontFamily="var(--font-mono)" fontSize="md">
              {url}
            </Text>
          )}
        </Flex>
      ))}
    </Flex>
  );
}

export default function Relays(props) {
  const { connectedRelays } = useNostr();
  const connected = connectedRelays.map(({ url }) => url);
  const { relays } = useRelays();
  const [relay, setRelay] = useState("");
  const isValidRelay = relay.startsWith("ws://") || relay.startsWith("wss://");
  const { add } = useRelays();
  const handleClick = () => {
    add(relay);
    setRelay("");
  };

  return (
    <Box>
      <Heading mb={4} fontSize="2xl" as="h3">
        Relays
      </Heading>
      <Flex flexDirection={"column"} {...props}>
        {relays.map((url) => (
          <Relay isConnected={connected.includes(url)} key={url} url={url} />
        ))}
      </Flex>
      <InputGroup size="md" mb={6} mt={3}>
        <Input
          pr="4.5rem"
          value={relay}
          onChange={(e) => setRelay(e.target.value)}
          placeholder="wss://relay.com"
        />
        <InputRightElement width="4.5rem">
          <Button
            isDisabled={!isValidRelay}
            h="1.75rem"
            size="sm"
            onClick={handleClick}
          >
            Add
          </Button>
        </InputRightElement>
      </InputGroup>
    </Box>
  );
}
