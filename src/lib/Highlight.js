import {
  Flex,
  Text,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from "@chakra-ui/react";

import { findTag } from "../nostr";
import User from "./User";
import Reactions from "./Reactions";
import Markdown from "./Markdown";
import NostrLink from "./NostrLink";
import useColors from "./useColors";
import useCached from "./useCached";

export default function Highlight({ highlight, reactions, ...rest }) {
  const { surface } = useColors();
  return (
    <Card {...rest}>
      <CardHeader style={{ paddingBottom: 4 }}>
        <Flex alignItems="center">
          <User size="sm" pubkey={highlight.pubkey} />
        </Flex>
      </CardHeader>
      <CardBody sx={{ paddingTop: 0, paddingBottom: 0 }}>
        {highlight.content}
      </CardBody>
      <CardFooter sx={{ paddingTop: 0 }}>
        <Reactions
          event={highlight}
          showHighlights={false}
          showMentions={false}
          events={reactions}
        />
      </CardFooter>
    </Card>
  );
}
