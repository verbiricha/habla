import { Link } from "react-router-dom";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";

import CloseIcon from "../icons/Close";
import Login from "./Login";
import { RelayFavicon } from "./Relays";
import useRelays from "./useRelays";

function SelectedRelay({ url, ...rest }) {
  const { deselect } = useRelays();
  return (
    <Flex
      alignItems="center"
      padding="8px 9px"
      background="var(--surface)"
      borderRadius="var(--border-radius)"
      {...rest}
    >
      <RelayFavicon url={url} mr={2} />
      <Text fontFamily="var(--font-mono)" fontSize="sm">
        {url}
      </Text>
      <Box cursor="pointer" ml={4} onClick={() => deselect(url)}>
        <CloseIcon />
      </Box>
    </Flex>
  );
}

function RelaySelector(props) {
  const { selectedRelays, relays } = useRelays();
  return (
    <>
      <Flex
        padding="6px 12px"
        alignItems="center"
        flex="1 1 auto"
        border="1px solid var(--surface)"
        {...props}
      >
        {selectedRelays.slice(0, 2).map((r) => (
          <SelectedRelay url={r} mr={2} />
        ))}
        {selectedRelays.length > 2 && <Text>+{selectedRelays.length - 2}</Text>}
      </Flex>
      <Text
        ml="60px"
        mr="10px"
        color="var(--secondary-font)"
        fontFamily="var(--font-mono)"
      >
        {selectedRelays.length}/{relays.length} relays
      </Text>
    </>
  );
}

export default function Header() {
  return (
    <Flex alignItems="center" justifyContent="space-between" as="header" p={4}>
      <Link to="/">
        <Heading as="h1">Habla</Heading>
      </Link>
      <RelaySelector ml={2} />
      <Login />
    </Flex>
  );
}
