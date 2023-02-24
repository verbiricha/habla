import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";

import { Flex } from "@chakra-ui/react";

import { decodeNaddr } from "../nostr";
import Relays from "../lib/Relays";
import Layout from "../lib/Layout";
import User from "../lib/User";
import Article from "../lib/Article";

export default function AddressPage() {
  const { naddr } = useParams();
  const [, pubkey, d] = naddr ? decodeNaddr(naddr) : [];
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Habla</title>
      </Helmet>
      <Layout
        aside={
          <Flex flexDirection="column" as="aside" width={320} p={4} pr={12}>
            <User showAbout={true} mb={6} pubkey={pubkey} />
            <Relays mb={6} />
          </Flex>
        }
      >
        <Article d={d} pubkey={pubkey} />
      </Layout>
    </>
  );
}
