import { Link } from "react-router-dom";
import { Flex, Box, Text } from "@chakra-ui/react";

import { useProfile } from "../nostr";

import useColors from "./useColors";
import User from "./User";

export default function ProfileCard({ pubkey, ...rest }) {
  const { surface } = useColors();
  const { data } = useProfile({ pubkey });
  return (
    <Flex
      flexDirection="column"
      padding="12px 21px"
      alignItems="flex-start"
      border="1px solid"
      borderColor={surface}
      borderRadius="var(--border-radius)"
      fontSize="14px"
      {...rest}
    >
      <Box margin="0 auto" mb={2}>
        <User dir="vertical" key={pubkey} size="xl" pubkey={pubkey} />
      </Box>
      {data?.display_name && (
        <Flex
          flexDirection="column"
          fontFamily="var(--font-mono)"
          width="230px"
        >
          <Text fontWeight={500} mb={2}>
            Name
          </Text>
          <Text>{data.display_name}</Text>
        </Flex>
      )}
      {data?.about && (
        <Flex
          fontFamily="var(--font-mono)"
          flexDirection="column"
          mt={2}
          maxWidth="230px"
        >
          <Text fontWeight={500} mb={2}>
            Bio
          </Text>
          <Text>{data.about}</Text>
        </Flex>
      )}
      {data?.website && (
        <Flex
          fontFamily="var(--font-mono)"
          flexDirection="column"
          mt={2}
          maxWidth="230px"
        >
          <Text fontWeight={500} mb={2}>
            Website
          </Text>
          <Link to={data.website} target="_blank" rel="noopener noreferrer">
            <Text color="purple.500">{data.website}</Text>
          </Link>
        </Flex>
      )}
    </Flex>
  );
}
