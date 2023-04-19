import { Flex, Text } from "@chakra-ui/react";
import { RelayList } from "./Relays";

export default function SeenIn({ relays }) {
  return (
    <Flex alignItems="flex-start" flexDirection="column" mt={2}>
      <Text fontSize="md" color="secondary.500" fontFamily="var(--font-mono)">
        seen in
      </Text>
      <RelayList my={1} linkToNrelay={true} relays={relays} />
    </Flex>
  );
}
