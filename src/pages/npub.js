import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import { nip19 } from "nostr-tools";

import Layout from "../lib/Layout";
import UserProfile from "../lib/Profile";

export default function Npub() {
  const { npub } = useParams();
  const pubkey = nip19.decode(npub)?.data;

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Habla</title>
      </Helmet>
      <Layout>
        <UserProfile pubkey={pubkey} />
      </Layout>
    </>
  );
}
