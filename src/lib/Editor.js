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
  Checkbox,
  CheckboxGroup,
  Spinner,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";

import { setJsonKey, getJsonKey } from "../storage";
import { getMetadata, sign, dateToUnix, useNostr } from "../nostr";
import EventPreview from "./EventPreview";
import { replaceMentions } from "./Markdown";
import useRelays from "./useRelays";

export default function MyEditor({ event, children }) {
  const { pool } = useNostr();
  const { relays } = useRelays();
  const metadata = event && getMetadata(event);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishOn, setPublishOn] = useState(
    relays.reduce((acc, r) => {
      return { ...acc, [r]: true };
    }, {})
  );
  const [publishedOn, setPublishedOn] = useState({});
  const [title, setTitle] = useState(metadata?.title ?? "");
  const [slug, setSlug] = useState(metadata?.d ?? "");
  const [summary, setSummary] = useState(metadata?.summary ?? "");
  const [image, setImage] = useState(metadata?.image ?? "");
  const [publishedAt] = useState(metadata?.publishedAt);
  const [content, setContent] = useState(() => {
    try {
      return event?.content ? replaceMentions(event.content, event.tags) : "";
    } catch (error) {
      return event?.content;
    }
  });
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
  }, [title]);

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
      setIsPublishing(true);
      const relays = Object.entries(publishOn)
        .filter(([r, publish]) => publish)
        .map((r) => r.at(0));
      for (const r of relays) {
        await pool.ensureRelay(r);
      }
      const pub = pool.publish(relays, signed);
      pub.on("ok", (r) => {
        toast({
          title: `Published to ${r}`,
          status: "success",
        });
        setPublishedOn((po) => {
          return { ...po, [r]: "ok" };
        });
      });
      pub.on("failed", (r) => {
        setPublishedOn((po) => {
          return { ...po, [r]: "failed" };
        });
      });
    } catch (error) {
      console.error(error);
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
        </Box>
        <CheckboxGroup colorScheme="green" defaultValue={["naruto", "kakashi"]}>
          <Stack spacing={2} direction={"column"}>
            {relays.map((r) => (
              <Checkbox
                key={r}
                onChange={(e) =>
                  setPublishOn({ ...publishOn, [r]: e.target.checked })
                }
                isChecked={publishOn[r]}
              >
                {r}{" "}
                {isPublishing &&
                  publishOn[r] &&
                  !["ok", "failed"].includes(publishedOn[r]) && (
                    <Spinner size="sm" />
                  )}
                {publishedOn[r] === "ok" && (
                  <CheckIcon color="green.500" size="sm" />
                )}
                {publishedOn[r] === "failed" && (
                  <CloseIcon color="red.500" size="sm" />
                )}
              </Checkbox>
            ))}
          </Stack>
        </CheckboxGroup>
        {children}
      </Box>
    </Flex>
  );
}
