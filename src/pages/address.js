import { useEffect, useMemo } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";

import { Flex } from "@chakra-ui/react";

import { decodeNaddr, useNostrEvents, findTag } from "../nostr";
import ProfileCard from "../lib/ProfileCard";
import Layout from "../lib/Layout";
import Article from "../lib/Article";
import Articles from "../lib/Articles";

export default function AddressPage() {
  const { naddr } = useParams();
  const { relays, pubkey, d } = naddr ? decodeNaddr(naddr) : {};
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [naddr]);
  const filter = {
    kinds: [30023],
    limit: 5,
    authors: [pubkey],
  };
  const feed = useNostrEvents(
    relays?.length > 0
      ? {
          filter,
          relays,
        }
      : { filter }
  );
  const events = useMemo(() => {
    return feed.events.filter((ev) => {
      return findTag(ev.tags, "d") !== d;
    });
  }, [feed.events, d]);
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Habla</title>
      </Helmet>
      <Layout
        aside={
          <Flex flexDirection="column" as="aside" width={320} p={4} pr={12}>
            <ProfileCard pubkey={pubkey} />
            {events.length > 0 && (
              <Articles title="Other articles" events={events} />
            )}
          </Flex>
        }
      >
        <Article key={naddr} d={d} pubkey={pubkey} relays={relays} />
      </Layout>
    </>
  );
}
