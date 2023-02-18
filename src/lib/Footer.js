import { Flex, Text, Link } from "@chakra-ui/react";

export default function Footer() {
  return (
    <Flex padding={4} justifyContent="center" as="footer">
      <Text textAlign="center" fontSize="sm">
        Made with 💜 by{" "}
        <Link
          href="nostr:npub107jk7htfv243u0x5ynn43scq9wrxtaasmrwwa8lfu2ydwag6cx2quqncxg"
          isExternal
        >
          verbiricha
        </Link>
      </Text>
    </Flex>
  );
}
