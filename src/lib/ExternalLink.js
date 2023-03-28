import { Link } from "react-router-dom";
import { Text } from "@chakra-ui/react";

export default function ExternalLink({ children, ...rest }) {
  return (
    <Link {...rest} target="_blank" rel="noopener noreferrer">
      <Text as="span" color="purple.500">
        {children}
      </Text>
    </Link>
  );
}
