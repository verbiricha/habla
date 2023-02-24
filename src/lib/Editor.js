import { useState, useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import {
  Flex,
  Box,
  Button,
  Stack,
  FormLabel,
  Input,
  Textarea,
} from "@chakra-ui/react";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";

import { setJsonKey, getJsonKey } from "../storage";
import { getMetadata, sign, dateToUnix, useNostr } from "../nostr";
import EventPreview from "./EventPreview";
import { replaceMentions } from "./Markdown";

export default function MyEditor({ event, children }) {
  const { publish } = useNostr();
  const metadata = event && getMetadata(event);
  const [title, setTitle] = useState(metadata?.title ?? "");
  const [slug, setSlug] = useState(metadata?.d ?? "");
  const [summary, setSummary] = useState(metadata?.summary ?? "");
  const [image, setImage] = useState(metadata?.image ?? "");
  const [publishedAt] = useState(metadata?.publishedAt);
  const [content, setContent] = useState(
    event?.content ? replaceMentions(event.content, event.tags) : ""
  );
  const toast = useToast();

  useEffect(() => {
    const draft = getJsonKey(`draft:${title}`);
    if (draft) {
      try {
        setTitle(draft.title);
        setSlug(draft.slug);
        setImage(draft.image);
        setSummary(draft.summary);
        setContent(draft.content);
      } catch (error) {
        console.error(error);
      }
    }
  }, []);

  function onChange({ text }) {
    setContent(text);
  }

  async function onPublish() {
    const createdAt = dateToUnix();
    const tags = [
      ["d", slug],
      ["title", title],
      ["summary", summary],
      ["published_at", publishedAt ? String(publishedAt) : String(createdAt)],
    ];
    if (image?.length > 0) {
      tags.push(["image", image]);
    }
    const ev = {
      content,
      kind: 30023,
      created_at: createdAt,
      tags,
    };
    try {
      const signed = await sign(ev);
      publish(signed);
      toast({
        title: "Published",
        status: "success",
      });
    } catch (error) {
      toast({
        title: "Couldn't publish article, please try again",
        status: "error",
      });
    }
  }

  function onSave() {
    setJsonKey(`draft:${slug}`, {
      title,
      slug,
      summary,
      image,
      content,
    });
  }

  return (
    <Flex flexDirection="column" alignItems="center" px={4}>
      <Box minWidth={["100%", "100%", "786px"]} maxWidth="786px">
        <Box className="editor">
          <FormLabel>Title</FormLabel>
          <Input
            value={title}
            onChange={(ev) => setTitle(ev.target.value)}
            size="md"
          />
          <FormLabel>Image</FormLabel>
          <Input
            value={image}
            onChange={(ev) => setImage(ev.target.value)}
            size="md"
          />
          <FormLabel>Slug</FormLabel>
          <Input
            value={slug}
            onChange={(ev) => setSlug(ev.target.value)}
            size="md"
          />
          <FormLabel>Summary</FormLabel>
          <Textarea
            id="title"
            value={summary}
            onChange={(ev) => setSummary(ev.target.value)}
            size="md"
          />
          <FormLabel>Content</FormLabel>
          <Box height={400}>
            <MdEditor
              value={content}
              renderHTML={(text) => (
                <EventPreview event={{ tags: [], content: text }} />
              )}
              onChange={onChange}
            />
          </Box>
          <Stack mt={5} direction="row-reverse" spacing={4} align="center">
            <Button colorScheme="purple" onClick={() => onPublish()}>
              Publish
            </Button>
            <Button onClick={() => onSave()}>Save</Button>
          </Stack>
          {children}
        </Box>
      </Box>
    </Flex>
  );
}
