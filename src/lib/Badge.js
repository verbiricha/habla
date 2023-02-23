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
            <Text fontSize="3rem" lineHeight="2rem">
              {d}
            </Text>
            <Text fontSize="2rem" lineHeight="1.2rem">
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
      <CardBody mt="-40px" ml="60px">
        {description}
      </CardBody>
    </Card>
  );
}
