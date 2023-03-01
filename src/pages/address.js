import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";

import { Flex } from "@chakra-ui/react";

import { decodeNaddr } from "../nostr";
import Relays from "../lib/Relays";
import Layout from "../lib/Layout";
import Article from "../lib/Article";

export default function AddressPage() {
  const { naddr } = useParams();
  const { relays, pubkey, d } = naddr ? decodeNaddr(naddr) : [];
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [naddr]);
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Habla</title>
      </Helmet>
      <Layout
        aside={
          <Flex flexDirection="column" as="aside" width={320} p={4} pr={12}>
            <Relays mb={6} />
          </Flex>
        }
      >
        <Article key={naddr} d={d} pubkey={pubkey} relays={relays} />
      </Layout>
    </>
  );
}
