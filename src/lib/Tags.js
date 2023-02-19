import { useMemo } from "react";

import { Heading, VStack } from "@chakra-ui/react";

import { getMetadata } from "../lib/nostr";
import Hashtag from "../lib/Hashtag";

export default function Tags({ events }) {
  const tags = useMemo(() => {
    const ts = events.map((e) => getMetadata(e)?.hashtags ?? []).flat();
    const counted = ts.reduce((acc, e) => {
      const count = acc[e] || 0;
      return { ...acc, [e]: count + 1 };
    }, {});
    const sorted = Object.entries(counted);
    sorted.sort((a, b) => b[1] - a[1]);
    return sorted.map((a) => a[0]);
  }, [events]);

  return (
    <>
      <Heading fontSize="2xl" as="h3">
        Tags
      </Heading>
      <VStack alignItems="flex-start" mt={2} spacing={2}>
        {tags.map((t) => (
          <Hashtag tag={t} />
        ))}
      </VStack>
    </>
  );
}
