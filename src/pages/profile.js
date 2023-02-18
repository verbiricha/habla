import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import Layout from "../lib/Layout";
import UserProfile from "../lib/Profile";

export default function Profile() {
  const { p } = useParams();

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Habla</title>
      </Helmet>
      <Layout>
        <UserProfile pubkey={p} />
      </Layout>
    </>
  );
}
