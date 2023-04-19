import { useRef, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import EmojiPicker, { Emoji } from "emoji-picker-react";

import {
  useColorMode,
  useToast,
  Box,
  Flex,
  Button,
  IconButton,
  Input,
  Text,
  Textarea,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { QRCodeCanvas } from "qrcode.react";
import { AddIcon, ChatIcon, LinkIcon, StarIcon } from "@chakra-ui/icons";

import {
  getEventId,
  eventAddress,
  dateToUnix,
  useNostr,
  useProfile,
  signEvent,
  getMetadata,
  encodeNaddr,
  getZapAmount,
  getZapRequest,
  dedupeByPubkey,
} from "../nostr";
import { useLnURLService, loadInvoice } from "./LNUrl";
import Thread, { Reply } from "./Thread";
import User from "./User";
import ZapIcon from "./Zap";
import useWebln from "./useWebln";

function useOnClickOutside(ref, onClickOutside) {
  useEffect(() => {
    function handleClickOutside(ev) {
      if (ref && ref.current && !ref.current.contains(ev.target)) {
        onClickOutside();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}

function EmojiModal({ colorMode, isOpen, onEmojiClick, onClose }) {
  const ref = useRef(null);
  useOnClickOutside(ref, onClose);
  function onEmoji(emoji) {
    onEmojiClick(emoji);
    onClose();
  }
  return (
    isOpen && (
      <Box ref={ref} width="350px">
        <EmojiPicker onEmojiClick={onEmoji} theme={colorMode} />
      </Box>
    )
  );
}

function ZapModal({ event, header, lnurl, isOpen, onClose, naddr }) {
  const [amount, setAmount] = useState(21);
  const { user, relays: userRelays } = useSelector((s) => s.relay);
  const [comment, setComment] = useState("");
  const webln = useWebln(true);
  const toast = useToast();
  const [invoice, setInvoice] = useState();

  async function zapRequest(content) {
    const ev = {
      kind: 9734,
      content,
      pubkey: user,
      created_at: dateToUnix(),
      tags: [
        ["relays", ...userRelays.map(({ url }) => url)],
        ["e", event.id],
        ["p", event.pubkey],
        ["amount", String(Math.floor(amount * 1000))],
      ],
    };
    if (naddr) {
      ev.tags.push(["a", naddr]);
    }
    try {
      return window.nostr.signEvent(ev);
    } catch (error) {
      console.error("couldn't sign zap request");
    }
  }

  async function onZap() {
    const req = await zapRequest(comment.trim());
    try {
      const invoice = await loadInvoice(lnurl, amount, comment.trim(), req);
      if (webln?.enabled) {
        try {
          await webln.sendPayment(invoice.pr);
          toast({
            title: "Paid",
            status: "success",
          });
          onClose();
        } catch (error) {
          setInvoice(invoice.pr);
        }
      } else {
        if (invoice?.pr) {
          setInvoice(invoice.pr);
        } else {
          toast({
            title: "Could not get invoice",
            status: "error",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Could not get invoice",
        status: "error",
      });
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{header}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex flexDirection="column">
            <Input
              type="number"
              min={lnurl.minSendable / 1000}
              max={lnurl.maxSendable / 1000}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              mt={4}
            />
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              my={4}
            />
            <Flex alignSelf="flex-end">
              <Button isDisabled={amount === 0} onClick={onZap}>
                Zap
              </Button>
            </Flex>
          </Flex>
          {invoice && (
            <>
              <Flex alignItems="center" justifyContent="center">
                <Box p={4} bg="white" borderRadius="var(--border-radius)">
                  <QRCodeCanvas value={invoice} size={250} />
                </Box>
              </Flex>
              <Button
                colorScheme="purple"
                mr={3}
                onClick={() => window.open(`lightning:${invoice}`)}
              >
                Open wallet
              </Button>
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function Reactions({
  events = [],
  showComments = false,
  showMentions = true,
  showHighlights = true,
  showUsers = false,
  isBounty = false,
  relays = [],
  event,
  ...rest
}) {
  const { pool } = useNostr();
  const { user, relays: userRelays } = useSelector((s) => s.relay);
  const toast = useToast();
  const naddr = eventAddress(event);
  const { colorMode } = useColorMode();
  const { data } = useProfile({ pubkey: event.pubkey });
  const lnurl = useLnURLService(data?.lud06 || data?.lud16);

  const [showReply, setShowReply] = useState(false);
  const [showZap, setShowZap] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const likes = dedupeByPubkey(
    events.filter(
      (e) => e.kind === 7 && e.content === "+" && e.pubkey !== event.pubkey
    )
  );
  const emojis = useMemo(() => {
    const emo = events
      .filter(
        (e) =>
          e.kind === 7 &&
          e.content !== "+" &&
          e.content !== "-" &&
          e.pubkey !== event.pubkey
      )
      .reduce((acc, ev) => {
        const count = acc[ev.content] ?? 0;
        return { ...acc, [ev.content]: count + 1 };
      }, {});
    const entries = Object.entries(emo);
    entries.sort((a, b) => a.count - b.count);
    return entries;
  }, [events]);
  const reactions = dedupeByPubkey(events.filter((e) => e.kind === 7));
  const mentions = events.filter((e) => e.kind === 30023);
  const liked = likes.find((e) => e.pubkey === user);
  const highlights = events.filter((e) => e.kind === 9802);
  const zaps = events.filter((e) => e.kind === 9735);
  const zappers = useMemo(() => {
    return zaps
      .map((z) => {
        return { ...getZapRequest(z), amount: getZapAmount(z) };
      })
      .filter((z) => z.pubkey !== event.pubkey);
  }, [zaps, event]);
  const zapped = zappers.find((z) => z.pubkey === user);
  const zapsTotal = useMemo(() => {
    return zappers.reduce((acc, { amount }) => {
      return acc + amount;
    }, 0);
  }, [zappers]);
  async function react(content) {
    const ev = {
      content,
      kind: 7,
      created_at: dateToUnix(),
      tags: [["e", event.id, relays[0] ?? ""]],
    };
    if (naddr) {
      ev.tags.push(["a", naddr, relays[0] ?? ""]);
    }
    try {
      const signed = await signEvent(ev);
      pool.publish(userRelays, signed);
    } catch (error) {
      toast({
        title: "Could not comment, create an account first",
        status: "error",
      });
    }
  }

  function onZapCancel() {
    setShowZap(false);
    setShowEmojiPicker(false);
  }

  function like() {
    if (!liked) {
      react("+");
    }
  }

  function hasReactedWith(emoji) {
    return events.find(
      (r) => r.kind === 7 && r.pubkey === user && r.content === emoji
    );
  }

  function emojiReact({ emoji }) {
    if (!hasReactedWith(emoji)) {
      react(emoji);
    }
  }

  return (
    <>
      <Flex sx={{ position: "relative", overflow: "visible" }}>
        <Flex mt={4} flexWrap="wrap" {...rest}>
          <Flex alignItems="center" flexDirection="row" mr={4}>
            <IconButton
              color={zapped ? "purple.500" : "var(--font)"}
              variant="unstyled"
              icon={<ZapIcon />}
              size="sm"
              onClick={() => setShowZap(true)}
            />
            <Text as="span" fontSize="xl">
              {zapsTotal}
            </Text>
          </Flex>
          {showHighlights && (
            <Flex alignItems="center" flexDirection="row" ml={2} mr={4}>
              <StarIcon />
              <Text as="span" ml={4} fontSize="xl">
                {highlights.length}
              </Text>
            </Flex>
          )}
          {showMentions && (
            <Flex alignItems="center" flexDirection="row" ml={2} mr={4}>
              <LinkIcon />
              <Text as="span" ml={4} fontSize="xl">
                {mentions.length}
              </Text>
            </Flex>
          )}
          <Flex alignItems="center" flexDirection="row" mr={4}>
            <IconButton
              variant="unstyled"
              icon={<Emoji unified="1f49c" size="20" />}
              size="sm"
              style={{ filter: liked ? "none" : "grayscale(100%)" }}
              onClick={like}
            />
            <Text as="span" ml={2} fontSize="xl">
              {likes.length}
            </Text>
          </Flex>
          {emojis.map(([e, count]) => {
            return (
              <Flex alignItems="center" flexDirection="row" key={e} mr={4}>
                <Button
                  variant="unstyled"
                  size="sm"
                  fontSize="20px"
                  style={{
                    filter: hasReactedWith(e) ? "none" : "grayscale(100%)",
                  }}
                  onClick={() => react(e)}
                >
                  {e}
                </Button>
                <Text as="span" ml={2} fontSize="xl">
                  {count}
                </Text>
              </Flex>
            );
          })}
          <IconButton
            isDisabled={showEmojiPicker}
            variant="unstyled"
            icon={<AddIcon />}
            size="sm"
            onClick={(ev) => {
              setShowEmojiPicker(true);
            }}
          />
          {showComments && (
            <Flex alignItems="center" flexDirection="row" ml={2}>
              <IconButton
                variant="unstyled"
                icon={<ChatIcon />}
                size="sm"
                onClick={() => setShowReply((s) => !s)}
              />
            </Flex>
          )}
        </Flex>
      </Flex>
      <EmojiModal
        colorMode={colorMode}
        isOpen={showEmojiPicker}
        onEmojiClick={emojiReact}
        onClose={() => setShowEmojiPicker(false)}
      />
      {lnurl && (
        <ZapModal
          naddr={naddr}
          event={event}
          header={`Zap ${data?.name}`}
          lnurl={lnurl}
          isOpen={showZap}
          onClose={onZapCancel}
        />
      )}
      <Reply
        relays={relays}
        root={event.id}
        event={event}
        showReply={showReply}
        setShowReply={setShowReply}
      />
      {showUsers && zappers.length > 0 && (
        <Box mt={2} mb={2}>
          <Heading mb={2}>Zaps</Heading>
          {zappers.map(({ id, content, pubkey, amount }) => (
            <>
              <Flex key={id} alignItems="center" mb={2}>
                <User showNip={false} pubkey={pubkey} />
                <Text> zapped {amount} sats</Text>
              </Flex>
              <Text ml="60px">{content}</Text>
            </>
          ))}
        </Box>
      )}
      {showComments && (
        <Box mt={2} mb={2}>
          <Heading mb={2}>Comments</Heading>
          <Thread relays={relays} isBounty={isBounty} event={event} />
        </Box>
      )}
      {showUsers && reactions.length > 0 && (
        <Box mt={2} mb={2}>
          <Heading mb={2}>Reactions</Heading>
          {reactions.map((ev) => (
            <Flex key={getEventId(ev)} alignItems="center" mb={2}>
              <User showNip={false} pubkey={ev.pubkey} />
              <Text>
                {ev.content === "+" && " liked"}
                {ev.content === "-" && " disliked"}
                {!["+", "-"].includes(ev.content) &&
                  ` reacted with ${ev.content}`}
              </Text>
            </Flex>
          ))}
        </Box>
      )}
      {showComments && mentions.length > 0 && (
        <Box mt={2} mb={2}>
          <Heading mb={2}>Mentions</Heading>
          {mentions.map((ev) => (
            <ArticlePreview ev={ev} />
          ))}
        </Box>
      )}
    </>
  );
}

function ArticlePreview({ ev }) {
  const meta = getMetadata(ev);
  const naddr = encodeNaddr(ev);
  return (
    <Box key={ev.id} mb={2}>
      <Link to={`/a/${naddr}`}>
        <Flex flexDirection="column">
          <Text fontSize="4xl">{meta?.title}</Text>
          <Flex alignItems="center" flexDirection="row">
            <Text fontSize="xs" color="secondary.500">
              by{" "}
            </Text>
            <User ml={2} size="xs" pubkey={ev.pubkey} fontSize="md" />
          </Flex>
        </Flex>
      </Link>
    </Box>
  );
}
