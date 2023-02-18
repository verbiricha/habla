import { Link } from "react-router-dom";
import { Flex, Heading } from "@chakra-ui/react";
import Login from "./Login";

export default function Header() {
  return (
    <Flex as="header" px={4}>
      <Link to="/">
        <Heading as="h1">Habla</Heading>
      </Link>

      <Login />
    </Flex>
  );
}
