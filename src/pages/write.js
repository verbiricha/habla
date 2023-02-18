import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { Button } from "@chakra-ui/react";

import Layout from "../lib/Layout";
import Editor from "../lib/Editor";
import useLoggedInUser from "../lib/useLoggedInUser";

export default function Write() {
  const navigate = useNavigate();
  const { user, logOut } = useLoggedInUser();
  const handleLogout = () => {
    logOut();
    navigate("/");
  };
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Habla</title>
      </Helmet>
      <Layout>
        <Editor />
        {user && <Button onClick={handleLogout}>Log out</Button>}
      </Layout>
    </>
  );
}
