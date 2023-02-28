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
  useNostr,
  useNostrEvents,
  useProfile,
  signEvent,
  findTag,
} from "../nostr";
import { useLnURLService, loadInvoice } from "./LNUrl";
import Thread, { Reply } from "./Thread";
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

export default function Reactions({
  showComments = false,
  showUsers = false,
  event,
}) {
  const { publish } = useNostr();
  const { user, relays } = useSelector((s) => s.relay);
  const toast = useToast();
  const naddr = eventAddress(event);
  const { events } = useNostrEvents({
    filter: {
      kinds: [7, 9735],
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
      tags: [
        ["e", event.id],
        ["a", naddr],
      ],
    };
    try {
      const signed = await signEvent(ev);
      publish(signed);
    } catch (error) {
      toast({
        title: "Could not comment, create an account first",
        status: "error",
      });
    }
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
    try {
      return window.nostr.signEvent(ev);
    } catch (error) {
      console.error("couldn't sign zap request");
    }
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
    } else {
      setInvoice(invoice.pr);
      setShowModal(true);
    }
  }

  function onZapCancel() {
    setAmount(0);
    setComment("");
    setInvoice();
    setShowZap(false);
    setShowModal(false);
  }

  function like() {
    if (!liked) {
      react("+");
    }
  }

  return (
    <>
      <Flex>
        <HStack spacing={4} mt={4}>
          <Flex alignItems="center" flexDirection="row" minWidth={"80px"}>
            <IconButton
              variant="unstyled"
              color={liked ? "purple.500" : "var(--font)"}
              icon={<TriangleUpIcon />}
              size="sm"
              onClick={like}
            />
            <Text as="span" ml={4} fontSize="xl">
              {likes.length}
            </Text>
          </Flex>
          <Flex alignItems="center" flexDirection="row" minWidth={"80px"}>
            <IconButton
              color={zapped ? "purple.500" : "var(--font)"}
              variant="unstyled"
              icon={<ZapIcon />}
              size="sm"
              onClick={() => setShowZap(true)}
            />
            <Text as="span" ml={4} fontSize="xl">
              {zapsTotal}
            </Text>
          </Flex>
          {showComments && (
            <Flex alignItems="center" flexDirection="row">
              <IconButton
                variant="unstyled"
                icon={<ChatIcon />}
                size="sm"
                onClick={() => setShowReply((s) => !s)}
              />
            </Flex>
          )}
        </HStack>
      </Flex>
      {showZap && lnurl && (
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
              <Box p={4} bg="white" borderRadius="var(--border-radius)">
                <QRCodeCanvas value={invoice} size={250} />
              </Box>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="purple"
              mr={3}
              onClick={() => window.open(`lightning:${invoice}`)}
            >
              Open wallet
            </Button>
            <Button colorScheme="blue" mr={3} onClick={onZapCancel}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Reply
        root={event.id}
        event={event}
        showReply={showReply}
        setShowReply={setShowReply}
      />
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
      {showComments && <Thread event={event} />}
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
