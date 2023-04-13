import { useMemo } from "react";
import { Flex, Box, Text, Heading } from "@chakra-ui/react";

import { encodeTLV } from "../nostr";

import Naddr from "./Naddr";
import Note from "./Note";
import User from "./User";
import HashtagLink from "./HashtagLink";

function Tag({ tag }) {
  const [t, value] = tag;
  if (t === "p") {
    return <User pubkey={value} />;
  } else if (t === "e") {
    return <Note id={value} />;
  } else if (t === "a") {
    const [k, p, d] = value.split(":");
    const naddr = encodeTLV(d, "naddr", [], p, Number(k));
    <Naddr naddr={naddr} kind={Number(k)} d={d} pubkey={p} />;
  } else if (t === "t") {
    return <HashtagLink tag={t} />;
  }
}

export default function List({ ev }) {
  const title = ev.tags.find((t) => t[0] === "d")?.at(1);
  const tags = ev.tags.filter((t) => ["e", "a", "t", "p"].includes(t[0]));
  const groupedTags = useMemo(() => {
    return tags.reduce((acc, [tag, value]) => {
      const soFar = acc[tag] || [];
      soFar.push([tag, value]);
      return { ...acc, [tag]: soFar };
    }, {});
  }, [tags]);
  return (
    <Flex
      flexDirection="column"
      py={2}
      px={2}
      border="1px solid"
      borderColor="secondary.500"
      borderRadius="12px"
    >
      {ev.kind === 10000 && <Heading>Muted</Heading>}
      {ev.kind === 10001 && <Heading>Pinned</Heading>}
      {ev.kind === 30000 && <Heading>{title}</Heading>}
      {ev.kind === 30001 && <Heading>{title}</Heading>}
      <Flex alignItems="center">
        <Text mr={2}>list by</Text>
        <User size="xs" pubkey={ev.pubkey} />
      </Flex>
      {groupedTags["p"] && (
        <>
          <Heading fontSize="xl">Pubkeys</Heading>
          {groupedTags["p"].map((t) => (
            <Box my={2}>
              <Tag tag={t} />
            </Box>
          ))}
        </>
      )}
      {groupedTags["e"] && (
        <>
          <Heading fontSize="xl">Notes</Heading>
          {groupedTags["e"].map((t) => (
            <Box my={2}>
              <Tag tag={t} />
            </Box>
          ))}
        </>
      )}
      {groupedTags["t"] && (
        <>
          <Heading fontSize="xl">Tags</Heading>
          {groupedTags["t"].map((t) => (
            <Box my={2}>
              <Tag tag={t} />
            </Box>
          ))}
        </>
      )}
      {groupedTags["a"] && (
        <>
          <Heading fontSize="xl">Addresses</Heading>
          {groupedTags["a"].map((t) => (
            <Box my={2}>
              <Tag tag={t} />
            </Box>
          ))}
        </>
      )}
    </Flex>
  );
}
