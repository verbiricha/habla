import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";

import { Flex, Heading } from "@chakra-ui/react";

import Relays from "../lib/Relays";
import Layout from "../lib/Layout";
import User from "../lib/User";
import Article from "../lib/Article";
import useNip05 from "../lib/useNip05";

export default function ArticlePage() {
  const { d, p } = useParams();
  const pubkey = useNip05(p);
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
            <Heading fontSize="2xl" as="h3">
              Relays
            </Heading>
            <Relays mb={6} />
          </Flex>
        }
      >
        <Article d={d} pubkey={pubkey} />
      </Layout>
    </>
  );
}
