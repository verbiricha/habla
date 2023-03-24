import {
  Avatar,
  Flex,
  Text,
  Card,
  CardHeader,
  CardBody,
} from "@chakra-ui/react";

import { findTag, encodeNaddr } from "../nostr";

import User from "./User";
import NostrLink from "./NostrLink";
import useColors from "./useColors";
import useCached from "./useCached";

export default function Badge({ ev }) {
  const d = findTag(ev.tags, "d");
  useCached(`badge:${ev.pubkey}:${d}`);
  const naddr = encodeNaddr(ev);
  const { surface } = useColors();
  const name = findTag(ev.tags, "name");
  const description = findTag(ev.tags, "description");
  const image = findTag(ev.tags, "image");
  return (
    <NostrLink link={naddr}>
      <Card background={surface}>
        <CardHeader>
          <Flex>
            <Avatar mr={4} src={image} name={name} />
            <Flex flexDirection="column">
              <Text as="span" fontSize={["1rem", "2rem"]}>
                {name}
              </Text>
              <Flex alignItems="center">
                <Text fontSize="xs" color="secondary.500">
                  issued by{" "}
                </Text>
                <User ml={2} size="xs" pubkey={ev.pubkey} />
              </Flex>
            </Flex>
          </Flex>
        </CardHeader>
        <CardBody mt="-20px" ml="60px">
          {description}
        </CardBody>
      </Card>
    </NostrLink>
  );
}
