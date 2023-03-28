import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Helmet } from "react-helmet";

import { Flex, Heading, Text } from "@chakra-ui/react";

import Layout from "../lib/Layout";
import ExternalLink from "../lib/ExternalLink";
import { RelayCard } from "../lib/Relays";
import { setCompatibleRelays } from "../relaysStore";

export default function Relays() {
  const dispatch = useDispatch();
  const { compatibleRelays } = useSelector((s) => s.relay);
  useEffect(() => {
    fetch("https://api.nostr.watch/v1/nip/33")
      .then((r) => {
        if (r.ok) {
          return r.json();
        }
      })
      .then((rs) => dispatch(setCompatibleRelays(rs)))
      .catch((error) => {
        console.error(error);
      });
  }, [dispatch]);

  return (
    <Layout singleColumn={true}>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Habla - Relay Explorer</title>
      </Helmet>
      <Heading fontWeight={500} as="h2" mb={2}>
        Relays
      </Heading>
      <Text color="secondary.500">
        <ExternalLink to={`https://nips.be/33`}>NIP-33</ExternalLink> compatible
        relay list provided by{" "}
        <ExternalLink to={`https://nostr.watch`}>nostr.watch</ExternalLink>
      </Text>
      <Flex mt={4} flexWrap="wrap" justifyContent="center">
        {compatibleRelays.map((url) => (
          <RelayCard mr={8} mb={8} url={url} />
        ))}
      </Flex>
    </Layout>
  );
}
