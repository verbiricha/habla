import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Flex,
  Button,
  Heading,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";

import CloseIcon from "../icons/Close";
import ArrowDownIcon from "../icons/ArrowDown";
import Login from "./Login";
import { RelayFavicon } from "./Relays";
import useRelays from "./useRelays";
import useColors from "./useColors";

function RelayList() {
  const { toggle } = useRelays();
  const { selectedRelays, relays } = useSelector((s) => s.relay);
  const { fg, bg } = useColors();
  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Options"
        color="secondary.500"
        icon={<ArrowDownIcon />}
        variant="unstyled"
      />
      <MenuList background={bg}>
        {relays.map(({ url }) => {
          return (
            <MenuItem as="div" background={bg} key={url}>
              <Flex
                alignItems="center"
                justifyContent="space-between"
                padding="8px 9px"
                width="100%"
              >
                <Flex>
                  <RelayFavicon url={url} mr={2} />
                  <Text fontFamily="var(--font-mono)" fontSize="sm">
                    {url}
                  </Text>
                </Flex>
                <Box pl="120px">
                  <Button
                    variant="unstyled"
                    fontFamily="var(--font-mono)"
                    color={selectedRelays.includes(url) ? "secondary.500" : fg}
                    fontSize="sm"
                    onClick={() => toggle(url)}
                  >
                    {selectedRelays.includes(url) ? "- hide" : "+ show"}
                  </Button>
                </Box>
              </Flex>
            </MenuItem>
          );
        })}
      </MenuList>
    </Menu>
  );
}

function SelectedRelay({ url, ...rest }) {
  const { deselect } = useRelays();
  const { surface } = useColors();
  return (
    <Flex
      alignItems="center"
      padding="8px 9px"
      backgroundColor={surface}
      borderRadius="var(--border-radius)"
      {...rest}
    >
      <RelayFavicon url={url} mr={2} />
      <Text
        fontFamily="var(--font-mono)"
        display={["none", "none", "none", "inline"]}
        fontSize="sm"
      >
        {url}
      </Text>
      <Box cursor="pointer" ml={4} onClick={() => deselect(url)}>
        <CloseIcon />
      </Box>
    </Flex>
  );
}

function RelaySelector(props) {
  const { selectedRelays, relays } = useSelector((s) => s.relay);
  const { surface } = useColors();
  return (
    <>
      <Flex
        padding="6px 0px 6px 12px"
        alignItems="center"
        flex="1 1 auto"
        border="1px solid"
        borderColor={surface}
        {...props}
      >
        {selectedRelays.slice(0, 2).map((r) => (
          <SelectedRelay key={r} url={r} mr={2} />
        ))}
        {selectedRelays.length > 2 && <Text>+{selectedRelays.length - 2}</Text>}
        <Box ml="auto">
          <RelayList />
        </Box>
      </Flex>
      <Text
        ml="60px"
        mr="10px"
        color="secondary.500"
        fontFamily="var(--font-mono)"
        display={["none", "none", "none", "block"]}
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
        <Heading as="h1" display={["block", "block", "block", "none"]}>
          H
        </Heading>
        <Heading as="h1" display={["none", "none", "none", "block"]}>
          Habla
        </Heading>
      </Link>
      <RelaySelector ml={2} />
      <Login />
    </Flex>
  );
}
