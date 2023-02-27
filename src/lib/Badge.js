import {
  Avatar,
  Flex,
  Text,
  Card,
  CardHeader,
  CardBody,
} from "@chakra-ui/react";

import { findTag } from "../nostr";

import User from "./User";
import useColors from "./useColors";
import useCached from "./useCached";

export default function Badge({ ev }) {
  const d = findTag(ev.tags, "d");
  useCached(`badge:${ev.pubkey}:${d}`);
  const { surface } = useColors();
  const name = findTag(ev.tags, "name");
  const description = findTag(ev.tags, "description");
  const image = findTag(ev.tags, "image");
  return (
    <Card background={surface}>
      <CardHeader>
        <Flex alignItems="center">
          <Avatar mr={4} src={image} name={name} />
          <Flex flexDirection="column">
            <Text as="span" fontSize={["1.5rem", "3rem"]}>
              {d}
            </Text>
            <Text as="span" fontSize={["1rem", "2rem"]}>
              {name}
            </Text>
          </Flex>
          <Flex ml="auto" alignSelf="flex-start" flexDirection="column">
            <Text color="secondary.300" fontSize="xs">
              issued by
            </Text>
            <User size="xs" pubkey={ev.pubkey} />
          </Flex>
        </Flex>
      </CardHeader>
      <CardBody mt="-20px" ml="60px">
        {description}
      </CardBody>
    </Card>
  );
}
