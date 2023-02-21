import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { decode } from "light-bolt11-decoder";

import {
  useToast,
  Box,
  Flex,
  HStack,
  Button,
  IconButton,
  Input,
  Text,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { QRCodeCanvas } from "qrcode.react";
import { TriangleUpIcon, ChatIcon } from "@chakra-ui/icons";

import {
  getEventId,
  eventAddress,
  dateToUnix,
  sign,
  useNostr,
  useNostrEvents,
  useProfile,
  signEvent,
  findTag,
} from "../nostr";
import { useLnURLService, loadInvoice } from "./LNUrl";
import useLoggedInUser from "./useLoggedInUser";
import Markdown from "./Markdown";
import User from "./User";
import ZapIcon from "./Zap";
import useWebln from "./useWebln";

function getZapRequest(zap) {
  let zapRequest = findTag(zap.tags, "description");
  if (zapRequest) {
    try {
      if (zapRequest.startsWith("%")) {
        zapRequest = decodeURIComponent(zapRequest);
      }
      return JSON.parse(zapRequest);
    } catch (e) {
      console.warn("Invalid zap", zapRequest);
    }
  }
}

function getZapAmount(zap) {
  try {
    const invoice = findTag(zap.tags, "bolt11");
    if (invoice) {
      const decoded = decode(invoice);
      const amount = decoded.sections.find(({ name }) => name === "amount");
      return Number(amount.value) / 1000;
    }
    return 0;
  } catch (error) {
    return 0;
  }
}

export default function Reactions({ showUsers = false, event }) {
  const { publish } = useNostr();
  const { relays } = useSelector((s) => s.relay);
  const toast = useToast();
  const { user } = useLoggedInUser();
  const naddr = eventAddress(event);
  const { events } = useNostrEvents({
    filter: {
      kinds: [1, 7, 9735],
      "#a": [naddr],
    },
  });
  const { data } = useProfile({ pubkey: event.pubkey });
  const lnurl = useLnURLService(data?.lud06 || data?.lud16);

  const [showReply, setShowReply] = useState(false);
  const [comment, setComment] = useState("");
  const [showZap, setShowZap] = useState(false);
  const [invoice, setInvoice] = useState();
  const [showModal, setShowModal] = useState(false);
  const webln = useWebln(showZap);
  const [amount, setAmount] = useState(0);

  const likes = events.filter(
    (e) => e.kind === 7 && e.content === "+" && e.pubkey !== event.pubkey
  );
  const liked = likes.find((e) => e.pubkey === user);
  const comments = events.filter(
    (e) => e.kind === 1 && e.pubkey !== event.pubkey
  );
  const zaps = events.filter((e) => e.kind === 9735);
  const zappers = useMemo(() => {
    return zaps
      .map((z) => {
        return { ...getZapRequest(z), amount: getZapAmount(z) };
      })
      .filter((z) => z.pubkey !== event.pubkey);
  }, [zaps, event]);
  const zapsTotal = useMemo(() => {
    return zappers.reduce((acc, { amount }) => {
      return acc + amount;
    }, 0);
  }, [zappers]);
  async function react(content) {
    if (!user) {
      return;
    }
    const ev = {
      content,
      kind: 7,
      created_at: dateToUnix(),
      tags: [
        ["e", event.id],
        ["a", naddr],
      ],
    };
    const signed = await signEvent(ev);
    publish(signed);
  }
  async function sendComment(content) {
    if (!user) {
      return;
    }
    const ev = {
      content,
      kind: 1,
      created_at: dateToUnix(),
      tags: [
        ["e", event.id, "", "root"],
        ["p", event.pubkey],
        ["a", naddr],
      ],
    };
    const signed = await sign(ev);
    publish(signed);
  }

  function onComment() {
    sendComment(comment.trim());
    toast({
      title: "Comment published",
      status: "success",
    });
    setComment("");
    setShowReply(false);
  }

  function onCancel() {
    setComment("");
    setShowReply(false);
  }

  async function zapRequest(content) {
    const ev = {
      kind: 9734,
      content,
      pubkey: user,
      created_at: dateToUnix(),
      tags: [
        ["e", event.id],
        ["p", event.pubkey],
        ["a", naddr],
        ["relays", ...relays],
      ],
    };
    return window.nostr.signEvent(ev);
  }

  async function onZap() {
    const req = await zapRequest(comment.trim());
    const invoice = await loadInvoice(lnurl, amount, comment.trim(), req);
    if (webln?.enabled) {
      try {
        await webln.sendPayment(invoice.pr);
        toast({
          title: "Paid",
          status: "success",
        });
        onZapCancel();
      } catch (error) {
        setInvoice(invoice.pr);
        setShowModal(true);
      }
    }
  }

  function onZapCancel() {
    setAmount(0);
    setComment("");
    setInvoice();
    setShowZap(false);
    setShowModal(false);
  }

  return (
    <>
      <Flex>
        <HStack spacing={4} mt={4}>
          <Flex alignItems="center" flexDirection="row" minWidth={"80px"}>
            <IconButton
              variant="unstyled"
              isDisabled={liked}
              icon={<TriangleUpIcon />}
              size="sm"
              onClick={() => react("+")}
            />
            <Text as="span" ml={4} fontSize="xl">
              {likes.length}
            </Text>
          </Flex>
          <Flex alignItems="center" flexDirection="row" minWidth={"80px"}>
            <IconButton
              variant="unstyled"
              icon={<ChatIcon />}
              size="sm"
              onClick={() => setShowReply(true)}
            />
            <Text as="span" ml={4} fontSize="xl">
              {comments.length}
            </Text>
          </Flex>
          <Flex alignItems="center" flexDirection="row" minWidth={"80px"}>
            <IconButton
              variant="unstyled"
              icon={<ZapIcon />}
              size="sm"
              onClick={() => setShowZap(true)}
            />
            <Text as="span" ml={4} fontSize="xl">
              {zapsTotal}
            </Text>
          </Flex>
        </HStack>
      </Flex>
      {showZap && user && lnurl && (
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
            <Button mr={2} variant="outline" onClick={onZapCancel}>
              Cancel
            </Button>
            <Button isDisabled={amount === 0} onClick={onZap}>
              Zap
            </Button>
          </Flex>
        </Flex>
      )}
      <Modal isOpen={showModal} onClose={onZapCancel}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Zap {data?.name} {amount} sats
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex alignItems="center" justifyContent="center">
              <QRCodeCanvas value={invoice} size={250} />
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onZapCancel}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {showReply && user && (
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
            <Button
              isDisabled={comment.trim().length === 0}
              onClick={onComment}
            >
              Publish
            </Button>
          </Flex>
        </Flex>
      )}
      {showUsers && zappers.length > 0 && (
        <>
          {zappers.map(({ id, content, pubkey, amount }) => (
            <>
              <Flex key={id} alignItems="center">
                <User showNip={false} pubkey={pubkey} />
                <Text> zapped {amount} sats</Text>
              </Flex>
              <Text ml="60px">{content}</Text>
            </>
          ))}
        </>
      )}
      {showUsers && (
        <>
          {comments.map((ev) => (
            <Flex
              flexDirection="column"
              key={getEventId(ev)}
              alignItems="flex-start"
            >
              <User showNip={false} pubkey={ev.pubkey} />
              <Box ml="60px">
                <Markdown content={ev.content} tags={ev.tags} />
              </Box>
            </Flex>
          ))}
        </>
      )}
      {showUsers && likes.length > 0 && (
        <>
          {likes.map((ev) => (
            <Flex key={getEventId(ev)} alignItems="center">
              <User showNip={false} pubkey={ev.pubkey} />
              <Text> liked</Text>
            </Flex>
          ))}
        </>
      )}
    </>
  );
}
