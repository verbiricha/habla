import { useState } from "react";
import { useNostr, normalizeURL } from "../nostr";

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

export function RelayFavicon({ url, children, ...rest }) {
  const domain = url
    .replace("wss://relay.", "https://")
    .replace("wss://", "https://")
    .replace("ws://", "http://")
    .replace(/\/$/, "");
  return (
    <Tooltip label={normalizeURL(url)}>
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
  const { selectedRelay, remove } = useRelays();
  return (
    <>
      <Flex alignItems="center" mb={2} key={url}>
        <RelayFavicon url={url}>
          {isConnected && <AvatarBadge boxSize="1.25em" bg="green.500" />}
        </RelayFavicon>
        <Text fontFamily="var(--font-mono)" fontSize="12px" ml={2}>
          {normalizeURL(url)}
        </Text>
        {url !== selectedRelay && (
          <DeleteIcon
            cursor="pointer"
            onClick={() => remove(url)}
            ml="auto"
            color="red.500"
            size="sm"
          />
        )}
      </Flex>
    </>
  );
}

function sorted(s: Set<any>) {
  const sorted = Array.from(s);
  sorted.sort();
  return sorted;
}

export function RelayList({ relays, showUrl = false, ...props }) {
  const urls = relays ? sorted(relays) : [];
  return (
    <Flex {...props}>
      {urls.map((url) => (
        <Flex alignItems="center" key={url}>
          <RelayFavicon url={url} mr={2} />
          {showUrl && (
            <Text margin={0} my={1} fontFamily="var(--font-mono)" fontSize="md">
              {normalizeURL(url)}
            </Text>
          )}
        </Flex>
      ))}
    </Flex>
  );
}

export default function Relays(props) {
  const { pool, connectedRelays } = useNostr();
  const { relays } = useRelays();
  const [relay, setRelay] = useState("");
  const isValidRelay = relay.startsWith("ws://") || relay.startsWith("wss://");
  const { add } = useRelays();
  const handleClick = () => {
    add(relay);
    pool.ensureRelay(relay);
    setRelay("");
  };

  return (
    <Box>
      <Heading mb={4} fontSize="2xl" as="h3">
        Relays
      </Heading>
      <Flex flexDirection={"column"} {...props}>
        {relays.map((url) => (
          <>
            <Relay
              isConnected={connectedRelays.includes(normalizeURL(url))}
              key={url}
              url={url}
            />
          </>
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
