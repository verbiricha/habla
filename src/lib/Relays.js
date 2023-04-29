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

import ExternalLink from "./ExternalLink";
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
      <Flex alignItems="center" mb={2} key={url} wordBreak="breakWord">
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
    <Flex flexWrap="wrap" {...props}>
      {urls.map((url) => {
        const content = (
          <Flex alignItems="center">
            <RelayFavicon url={url} mr={2} mb={2} />
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
    <ExternalLink to={href}>
      {n < 10 && "0"}
      {n}
    </ExternalLink>
  );
}

export function RelayCard({ url, ...rest }) {
  const width = "320px";
  const { surface } = useColors();
  const info = useRelayInfo(url);
  return info ? (
    <Flex
      flexDirection="column"
      padding="12px 21px"
      border="1px solid"
      borderColor={surface}
      borderRadius="var(--border-radius)"
      fontSize="14px"
      mb={2}
      width={width}
      {...rest}
    >
      {info?.name && (
        <Heading
          fontFamily="var(--font-mono)"
          fontWeight={500}
          as="h3"
          fontSize="xl"
        >
          {info.name === "unset" ? "N/A" : info.name}
        </Heading>
      )}
      <Flex fontFamily="var(--font-mono)" flexDirection="column" mt={4}>
        <Text fontWeight={500}>URL</Text>
        <Flex>
          <Link to={`/r/${encodeNrelay(url)}`}>
            <RelayFavicon url={url} mr={2} />
            <Text as="span" color="purple.500">
              {normalizeURL(url)}
            </Text>
          </Link>
        </Flex>
      </Flex>
      {info?.description && (
        <Flex flexDirection="column" fontFamily="var(--font-mono)" mt={2}>
          <Text fontWeight={500} mb={2}>
            Description
          </Text>
          <Text>{info.description}</Text>
        </Flex>
      )}
      {info?.supported_nips && (
        <Flex flexDirection="column" fontFamily="var(--font-mono)" mt={2}>
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
      {info?.pubkey && info.pubkey !== "unset" && info.pubkey.length === 64 && (
        <Flex width="260px" flexDirection="column" mt={2}>
          <Text fontWeight={500} mb={2}>
            Operator
          </Text>
          <User key={info?.pubkey} size="xs" pubkey={info.pubkey} />
        </Flex>
      )}
    </Flex>
  ) : null;
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
    <>
      <Box>
        <Heading mb={4} fontSize="2xl" as="h3">
          Relays
        </Heading>
        <Flex flexDirection="column" {...props}>
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
        <Text fontSize="sm" color="secondary.500">
          Find compatible relays in the{" "}
          <Text as="span" color="purple.500" fontWeight={500}>
            <Link to="/relays">relays</Link>
          </Text>{" "}
          page.
        </Text>
      </Box>
    </>
  );
}
