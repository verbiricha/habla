import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";

import { Flex } from "@chakra-ui/react";

import Relays from "../lib/Relays";
import Layout from "../lib/Layout";
import Article from "../lib/Article";
import useNip05 from "../lib/useNip05";

export default function ArticlePage() {
  const { d, p } = useParams();
  const pubkey = useNip05(p);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [d, p]);
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
        <Article d={d} pubkey={pubkey} />
      </Layout>
    </>
  );
}
