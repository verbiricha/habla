import { useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Flex,
  Heading,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";

import ArrowDownIcon from "../icons/ArrowDown";
import Login from "./Login";
import { RelayFavicon } from "./Relays";
import useRelays from "./useRelays";
import useColors from "./useColors";

function RelayList() {
  const { select } = useRelays();
  const { bg } = useColors();
  const { relays } = useSelector((s) => s.relay);
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
            <MenuItem
              as="div"
              cursor="pointer"
              background={bg}
              key={url}
              onClick={() => select(url)}
            >
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
              </Flex>
            </MenuItem>
          );
        })}
      </MenuList>
    </Menu>
  );
}

function SelectedRelay({ url, ...rest }) {
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
        display={["none", "none", "inline"]}
        fontSize="sm"
      >
        {url}
      </Text>
    </Flex>
  );
}

function RelaySelector(props) {
  const { selectedRelay, relays } = useSelector((s) => s.relay);
  const { surface } = useColors();
  return (
    <Flex alignItems="center" flex="1 1 auto">
      <Flex borderColor={surface} {...props} ml="18px">
        <SelectedRelay key={selectedRelay} url={selectedRelay} mr={2} />
        <RelayList />
      </Flex>
      <Text
        ml="auto"
        mr="10px"
        color="secondary.500"
        fontFamily="var(--font-mono)"
        display={["none", "none", "block"]}
      >
        {relays.length} relays
      </Text>
    </Flex>
  );
}

export default function Header() {
  const loc = useLocation();
  const isHomePage = loc.pathname === "/" || loc.pathname === "";
  return (
    <Flex alignItems="center" justifyContent="space-between" as="header" p={4}>
      <Link to="/">
        <Heading as="h1" display={["block", "block", "none"]}>
          H
        </Heading>
        <Heading as="h1" display={["none", "none", "block"]}>
          Habla
        </Heading>
      </Link>
      {isHomePage && <RelaySelector ml={2} />}
      <Login />
    </Flex>
  );
}
