import { useState } from "react";
import { Link } from "react-router-dom";
import { useNostr, normalizeURL, encodeNrelay } from "../nostr";

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

import User from "./User";
import useRelays from "./useRelays";
import useColors from "./useColors";
import useRelayInfo from "./useRelayMetadata";

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

export function RelayList({
  linkToNrelay = false,
  relays,
  showUrl = false,
  ...props
}) {
  const urls = relays ? sorted(relays) : [];
  return (
    <Flex {...props}>
      {urls.map((url) => {
        const content = (
          <Flex alignItems="center">
            <RelayFavicon url={url} mr={2} />
            {showUrl && (
              <Text
                margin={0}
                my={1}
                fontFamily="var(--font-mono)"
                fontSize="md"
                color="purple.500"
                style={{ textDecoration: "none" }}
              >
                {normalizeURL(url)}
              </Text>
            )}
          </Flex>
        );
        return linkToNrelay ? (
          <Link key={url} to={`/r/${encodeNrelay(url)}`}>
            {content}
          </Link>
        ) : (
          content
        );
      })}
    </Flex>
  );
}

function Nip({ n }) {
  const href = `https://nips.be/${n}`;
  return (
    <a target="_blank" rel="noopener noreferrer" href={href}>
      <Text>{n}</Text>
    </a>
  );
}

export function RelayCard({ url, ...rest }) {
  const { surface } = useColors();
  const info = useRelayInfo(url);
  return (
    <Flex
      flexDirection="column"
      padding="12px 21px"
      alignItems="flex-start"
      border="1px solid"
      borderColor={surface}
      borderRadius="var(--border-radius)"
      fontSize="14px"
      mb={2}
      {...rest}
    >
      <Flex
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        width="100%"
      >
        <RelayFavicon url={url} mb={2} size="md" />
        <Text
          textAlign="center"
          color="purple.500"
          fontFamily="var(--font-mono)"
        >
          {normalizeURL(url)}
        </Text>
      </Flex>
      {info?.name && (
        <Flex
          fontFamily="var(--font-mono)"
          flexDirection="column"
          width="230px"
          mt={4}
        >
          <Text fontWeight={500}>Name</Text>
          <Text>{info.name === "unset" ? "N/A" : info.name}</Text>
        </Flex>
      )}
      {info?.contact && (
        <Flex fontFamily="var(--font-mono)" flexDirection="column" mt={2}>
          <Text fontWeight={500}>Contact</Text>
          <Text>{info.contact === "unset" ? "N/A" : info.contact}</Text>
        </Flex>
      )}
      {info?.description && (
        <Flex
          flexDirection="column"
          fontFamily="var(--font-mono)"
          width="230px"
          mt={2}
        >
          <Text fontWeight={500} mb={2}>
            Description
          </Text>
          <Text>{info.description}</Text>
        </Flex>
      )}
      {info?.supported_nips && (
        <Flex
          flexDirection="column"
          fontFamily="var(--font-mono)"
          width="230px"
          mt={2}
        >
          <Text fontWeight={500} mb={2}>
            NIPs
          </Text>
          <Flex flexWrap="wrap">
            {info.supported_nips.map((n) => (
              <Box mr={2} key={n}>
                <Nip n={n} />
              </Box>
            ))}
          </Flex>
        </Flex>
      )}
      {info?.pubkey && info.pubkey !== "unset" && (
        <Flex width="100%" flexDirection="column" mt={2}>
          <Text fontWeight={500} mb={2}>
            Operator
          </Text>
          <User key={info?.pubkey} size="xs" pubkey={info.pubkey} />
        </Flex>
      )}
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
          <Relay
            isConnected={connectedRelays.includes(normalizeURL(url))}
            key={url}
            url={url}
          />
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
