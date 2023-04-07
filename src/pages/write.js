import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";

import Layout from "../lib/Layout";
import Editor from "../lib/Editor";
import useLoggedInUser from "../lib/useLoggedInUser";

export default function Write() {
  useNavigate();
  useLoggedInUser();
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Habla</title>
      </Helmet>
      <Layout>
        <Editor />
      </Layout>
    </>
  );
}
