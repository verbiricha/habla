import { useMemo, useState, useEffect } from "react";

import {
  useToast,
  Flex,
  Box,
  Textarea,
  Button,
  IconButton,
} from "@chakra-ui/react";
import { ChatIcon } from "@chakra-ui/icons";

import {
  dateToUnix,
  useNostrEvents,
  eventAddress,
  getEventId,
  sign,
  useNostr,
} from "../nostr";
import User from "./User";
import Markdown from "./Markdown";

function extractThread(ev) {
  const isThread = ev.tags.some((a) => a[0] === "e");
  if (!isThread) {
    return null;
  }

  const ret = {};
  const eTags = ev.tags.filter((a) => a[0] === "e");
  const marked = eTags.some((a) => a[3] !== undefined);

  if (!marked) {
    ret.root = eTags[0]?.at(0);
    if (eTags.length > 1) {
      ret.replyTo = eTags[1]?.at(1);
    }
    if (eTags.length > 2) {
      ret.mentions = eTags.slice(2).map((e) => e[1]);
    }
  } else {
    const root = eTags.find((a) => a[3] === "root")?.at(1);
    const reply = eTags.find((a) => a[3] === "reply")?.at(1);
    ret.root = root;
    ret.replyTo = reply;
    ret.mentions = eTags.filter((a) => a[3] === "mention");
  }
  ret.pubKeys = Array.from(
    new Set(ev.tags.filter((a) => a[0] === "p").map((a) => [1]))
  );
  return ret;
}

export function Reply({ root, event, showReply, setShowReply }) {
  const toast = useToast();
  const naddr = eventAddress(event);
  const { publish } = useNostr();
  const [comment, setComment] = useState("");

  async function sendComment(content) {
    const ev = {
      content,
      kind: 1,
      created_at: dateToUnix(),
      tags: [["e", root, "", "root"]],
    };
    if (root !== event.id) {
      ev.tags.push(["e", event.id, "", "reply"]);
    }
    ev.tags.push(["p", event.pubkey]);
    if (event.kind === 30023) {
      ev.tags.push(["a", naddr]);
    }
    try {
      const signed = await sign(ev);
      publish(signed);
      toast({
        title: "Comment published",
        status: "success",
      });
    } catch (error) {
      toast({
        title: "Could not comment, create an account first",
        status: "error",
      });
    }
  }

  function onComment() {
    sendComment(comment.trim());
    setComment("");
    setShowReply(false);
  }

  function onCancel() {
    setComment("");
    setShowReply(false);
  }
  return showReply ? (
    <Flex flexDirection="column">
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        autoFocus={true}
        my={4}
      />
      <Flex alignSelf="flex-end">
        <Button mr={2} variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button isDisabled={comment.trim().length === 0} onClick={onComment}>
          Publish
        </Button>
      </Flex>
    </Flex>
  ) : null;
}

function Comment({ root, ev, chains }) {
  const [showReply, setShowReply] = useState(false);
  const replies = chains.get(ev.id);
  return (
    <Flex flexDirection="column" key={getEventId(ev)} alignItems="flex-start">
      <User showNip={false} pubkey={ev.pubkey} />
      <Box ml="60px" width="calc(100% - 60px)">
        <Markdown content={ev.content} tags={ev.tags} />
        <IconButton
          variant="unstyled"
          icon={<ChatIcon />}
          color="secondary.500"
          size="sm"
          onClick={() => setShowReply((s) => !s)}
        />
        <Reply
          root={root}
          event={ev}
          showReply={showReply}
          setShowReply={setShowReply}
        />
      </Box>
      <Flex flexDirection="column" ml="10px">
        {replies?.map((r) => (
          <>
            <Comment root={root} ev={r} chains={chains} />
          </>
        ))}
      </Flex>
    </Flex>
  );
}

export default function Thread({ event }) {
  const [trackingEvents, setTrackingEvents] = useState([event.id]);
  const naddr = eventAddress(event);
  const root = useNostrEvents({
    filter: {
      kinds: [1],
      "#a": [naddr],
    },
  });
  const { events } = useNostrEvents({
    filter: {
      ids: trackingEvents,
      kinds: [1],
    },
  });
  const related = useNostrEvents({
    filter: {
      "#e": trackingEvents,
      kinds: [1],
    },
  });

  useEffect(() => {
    const ids = root.events.map((c) => c.id);
    setTrackingEvents((ts) => ts.concat(ids.filter((i) => !ts.includes(i))));
  }, [root.events]);

  useEffect(() => {
    const ids = events
      .map((c) =>
        c.tags
          .filter((t) => t[0] === "e")
          .map((t) => t[1])
          .concat([c.id])
      )
      .flat();
    setTrackingEvents((ts) => ts.concat(ids.filter((i) => !ts.includes(i))));
  }, [events]);

  useEffect(() => {
    const ids = related.events
      .map((c) =>
        c.tags
          .filter((t) => t[0] === "e")
          .map((t) => t[1])
          .concat([c.id])
      )
      .flat();
    setTrackingEvents((ts) => ts.concat(ids.filter((i) => !ts.includes(i))));
  }, [related.events]);

  const chains = useMemo(() => {
    const notes = events.concat(
      related.events.filter((r) => !events.map((e) => e.id).includes(r.id))
    );
    const result = new Map();
    notes.sort((a, b) => b.created_at - a.created_at);
    notes.forEach((n) => {
      const thread = extractThread(n);
      if (!thread) {
        return;
      }
      const reply = thread.replyTo || thread.root;
      if (!result.has(reply)) {
        result.set(reply, [n]);
      } else {
        result.get(reply).push(n);
      }
    });
    return result;
  }, [events, related.events]);

  const filtered = root.events.filter((r) => {
    return r.tags.filter((t) => t[0] === "e").length === 1;
  });

  return (
    <>
      {filtered.map((ev) => (
        <Comment root={ev.id} key={ev.id} ev={ev} chains={chains} />
      ))}
    </>
  );
}
