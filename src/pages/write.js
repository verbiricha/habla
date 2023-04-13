import { useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { Flex, Box, Text, Button, Heading } from "@chakra-ui/react";

import {
  LONG_FORM_NOTE,
  LONG_FORM_NOTE_DRAFT,
  useNostrEvents,
  getMetadata,
} from "../nostr";
import Layout from "../lib/Layout";
import Editor from "../lib/Editor";
import { Hashtags } from "../lib/Hashtag";
import useLoggedInUser from "../lib/useLoggedInUser";

function DraftPreview({ ev, onClick }) {
  const meta = getMetadata(ev);
  const tags = meta?.hashtags ?? [];
  return (
    <Box key={ev.id} mb={2} onClick={onClick}>
      <Flex flexDirection="column">
        <Text fontSize="xl" fontWeight="500">
          {meta?.title}
        </Text>
        <Text fontSize="xs" color="secondary.500">
          {meta?.summary}
        </Text>
        <Hashtags hashtags={tags} />
      </Flex>
    </Box>
  );
}

export default function Write() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState();
  const { user } = useLoggedInUser();
  const { events } = useNostrEvents({
    filter: {
      kinds: [LONG_FORM_NOTE, LONG_FORM_NOTE_DRAFT],
      authors: [user],
    },
  });
  const articles = useMemo(
    () => events.filter((ev) => ev.kind === LONG_FORM_NOTE),
    [events]
  );
  const published = useMemo(
    () => articles.map((ev) => getMetadata(ev)?.d),
    [articles]
  );
  const drafts = useMemo(
    () =>
      events.filter(
        (ev) =>
          ev.kind === LONG_FORM_NOTE_DRAFT &&
          !published.includes(getMetadata(ev)?.d)
      ),
    [published, events]
  );

  function loadEvent(ev) {
    setDraft(ev);
  }

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Habla</title>
      </Helmet>
      <Layout
        aside={
          <Flex flexDirection="column" as="aside" width={320} p={4} pr={12}>
            {drafts.length > 0 && (
              <>
                <Heading mt={4} fontSize="2xl" as="h3" mb={2}>
                  Drafts
                </Heading>
                {drafts.map((ev) => (
                  <DraftPreview
                    key={ev.id}
                    ev={ev}
                    onClick={() => loadEvent(ev)}
                  />
                ))}
              </>
            )}
            {articles.length > 0 && (
              <>
                <Heading mt={4} fontSize="2xl" as="h3" mb={2}>
                  Articles
                </Heading>
                {articles.map((ev) => (
                  <DraftPreview
                    key={ev.id}
                    ev={ev}
                    onClick={() => loadEvent(ev)}
                  />
                ))}
              </>
            )}
          </Flex>
        }
      >
        {draft ? <Editor key={draft.id} event={draft} /> : <Editor />}
      </Layout>
    </>
  );
}
