import { Flex, Box } from "@chakra-ui/react";

import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children, aside, singleColumn = false }) {
  return (
    <Flex flexDirection="column" maxWidth={1420} margin="0 auto">
      <Header />
      <Flex flexDirection={["column", "column", "column", "row"]}>
        <Box as="main" flex="1 1 auto">
          <Flex flexDirection="column" alignItems="center" px={4}>
            {singleColumn ? (
              <Box width="100%" maxWidth="1090px">
                {children}
              </Box>
            ) : (
              <Box minWidth={["100%", "100%", "768px"]} maxWidth="768px">
                {children}
              </Box>
            )}
          </Flex>
        </Box>
        <Flex justifyContent="center">{aside}</Flex>
      </Flex>
      <Footer />
    </Flex>
  );
}
