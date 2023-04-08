import { useState, useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import {
  Flex,
  Box,
  Button,
  Stack,
  FormLabel,
  Input,
  Text,
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
import Event from "./Event";
import { replaceMentions } from "./Markdown";
import useRelays from "./useRelays";

export default function MyEditor({ event }) {
  const { pool } = useNostr();
  const { relays } = useRelays();
  const metadata = event && getMetadata(event);
  const [showPreview, setShowPreview] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishOn, setPublishOn] = useState(
    relays.reduce((acc, r) => {
      return { ...acc, [r]: true };
    }, {})
  );
  const [publishedOn, setPublishedOn] = useState({});
  const [title, setTitle] = useState(metadata?.title ?? "");
  const [slug, setSlug] = useState(metadata?.d ?? String(Date.now()));
  const [summary, setSummary] = useState(metadata?.summary ?? "");
  const [image, setImage] = useState(metadata?.image ?? "");
  const [publishedAt] = useState(metadata?.publishedAt);
  const [sensitive, setIsSensitive] = useState(metadata?.sensitive ?? false);
  const [warning, setWarning] = useState(metadata?.warning ?? "");
  const [hashtags, setHashtags] = useState(
    metadata?.hashtags?.join(", ") ?? ""
  );
  const [content, setContent] = useState(() => {
    try {
      return event?.content ? replaceMentions(event.content, event.tags) : "";
    } catch (error) {
      return event?.content;
    }
  });
  const toast = useToast();
  const htags = hashtags
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((t) => ["t", t]);
  const previewTags = [
    ["d", slug],
    ["image", image],
    ["title", title],
    ["summary", summary],
    ...htags,
  ];

  useEffect(() => {
    const draft = getJsonKey(`draft:${title}`);
    if (draft) {
      try {
        setTitle(draft.title);
        setSlug(draft.slug);
        setImage(draft.image);
        setSummary(draft.summary);
        setContent(draft.content);
        setHashtags(draft.hashtags);
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
    const htags = hashtags
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((t) => ["t", t]);
    const tags = [
      ["d", slug],
      ["title", title],
      ["summary", summary],
      ["published_at", publishedAt ? String(publishedAt) : String(createdAt)],
      ...htags,
    ];
    if (image?.length > 0) {
      tags.push(["image", image]);
    }
    if (sensitive) {
      if (warning?.length > 0) {
        tags.push(["content-warning", warning]);
      } else {
        tags.push(["content-warning"]);
      }
    }
    const ev = {
      content,
      kind: 30023,
      created_at: createdAt,
      tags,
    };
    try {
      const signed = await sign(ev, false);
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
      hashtags,
    });
  }

  return (
    <Flex flexDirection="column" alignItems="center" px={4}>
      <Box minWidth={["100%", "100%", "786px"]} maxWidth="786px">
        {showPreview ? (
          <>
            <Button colorScheme="teal" onClick={() => setShowPreview(false)}>
              Edit
            </Button>
            <Event
              event={{ tags: previewTags, content }}
              isPreview={false}
              showReactions={false}
              showComments={false}
            ></Event>
          </>
        ) : (
          <>
            <Button colorScheme="teal" onClick={() => setShowPreview(true)}>
              Preview
            </Button>
            <Box className="editor">
              <FormLabel htmlFor='title'>Title</FormLabel>
              <Input
                id='title'
                value={title}
                placeholder="Title for your article"
                onChange={(ev) => setTitle(ev.target.value)}
                size="md"
                mb={2}
              />
              <FormLabel>Content</FormLabel>
              <Box height={600} mb={2}>
                <MdEditor
                  value={content}
                  config={{ view: { html: false } }}
                  preview="edit"
                  renderHTML={(text) => (
                    <EventPreview event={{ ...event, content }} />
                  )}
                  onChange={onChange}
                />
              </Box>
              <FormLabel htmlFor='image'>Image</FormLabel>
              <Input
                id='image'
                placeholder="Link to the main article image"
                value={image}
                onChange={(ev) => setImage(ev.target.value)}
                size="md"
                mb={2}
              />
              <FormLabel htmlFor='summary'>Summary</FormLabel>
              <Textarea
                id="summary"
                placeholder="A brief summary of what your article is about"
                value={summary}
                onChange={(ev) => setSummary(ev.target.value)}
                size="md"
              />
              <FormLabel htmlFor='tags' mt={2}>Tags</FormLabel>
              <Input
                id='tags'
                value={hashtags}
                placeholder="List of tags separated by comma: nostr, markdown"
                onChange={(ev) => setHashtags(ev.target.value)}
                size="md"
                mb={2}
              />
              <Flex alignItems="center" mt={4}>
                <FormLabel htmlFor='sensitive'>Sensitive content warning</FormLabel>
                <Checkbox
                  id='sensitive'
                  isChecked={sensitive}
                  onChange={(ev) => setIsSensitive(ev.target.checked)}
                  mt={-1}
                  size="md"
                />
              </Flex>
              <Input
                value={warning}
                onChange={(ev) => setWarning(ev.target.value)}
                placeholder="nudity, language, violence, etc"
                size="md"
                mb={2}
              />
              <Stack mt={5} direction="row-reverse" spacing={4} align="center">
                <Button colorScheme="purple" onClick={() => onPublish()}>
                  Publish
                </Button>
                <Button onClick={() => onSave()}>Save</Button>
              </Stack>
            </Box>
            <CheckboxGroup
              colorScheme="green"
              defaultValue={["naruto", "kakashi"]}
            >
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
            <Flex flexDirection="row" alignItems="center" px={4}>
            <FormLabel htmlFor='adv' fontSize="2xl" fontWeight={700} mt={2}>
              Advanced options
            </FormLabel>
            <Checkbox
              id='adv'
              onChange={() => {
                setShowAdvanced(!showAdvanced)
              }}
              isChecked={showAdvanced} />
            </Flex>
            { showAdvanced
              ? (<>
                <FormLabel htmlFor='slug'>d</FormLabel>
                <FormLabel htmlFor='slug' my={2}>Unique identifier for the article</FormLabel>
                <Input
                  id='slug'
                  value={slug}
                  onChange={(ev) => setSlug(ev.target.value)}
                  size="md"
                  mb={2}
                /></>)
              : '' }
          </>
        )}
      </Box>
    </Flex>
  );
}
