import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import { decodeNprofile } from "../nostr";
import Layout from "../lib/Layout";
import UserProfile from "../lib/Profile";

export default function Nprofile() {
  const { nprofile } = useParams();
  const { pubkey, relays } = decodeNprofile(nprofile);

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Habla</title>
      </Helmet>
      <Layout>
        <UserProfile pubkey={pubkey} relays={relays} />
      </Layout>
    </>
  );
}
