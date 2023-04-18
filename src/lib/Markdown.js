import { useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown, { uriTransformer } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkToc from "remark-toc";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import slugify from "slugify";

import HyperText from "./HyperText";
import HashtagLink from "./HashtagLink";
import { visit, SKIP } from "unist-util-visit";

import {
  bech32ToHex,
  hexToBech32,
  encodeTLV,
  decodeNprofile,
  decodeNaddr,
  encodeNevent,
  decodeNevent,
  decodeNrelay,
} from "../nostr";

import NEvent from "./NEvent";
import NRelay from "./NRelay";
import NProfile from "./Nprofile";
import Naddr from "./Naddr";
import Note from "./Note";
import Mention from "./Mention";

const MentionRegex = /(#\[\d+\])/gi;
const NostrPrefixRegex = /^nostr:/;

export function replaceMentions(f, tags) {
  return f
    .split(MentionRegex)
    .map((match) => {
      const matchTag = match.match(/#\[(\d+)\]/);
      if (matchTag && matchTag.length === 2) {
        const idx = parseInt(matchTag[1]);
        const ref = tags?.find((a) => a[2] === idx);
        if (ref) {
          switch (ref[0]) {
            case "p": {
              // todo: nprofile?
              return `nostr:${hexToBech32(ref[1], "npub")}`;
            }
            case "e": {
              const maybeRelay = ref[2];
              if (maybeRelay) {
                return `nostr:${encodeNevent(ref[1], [maybeRelay])}`;
              } else {
                return `nostr:${hexToBech32(ref[1], "note")}`;
              }
            }
            case "t": {
              return <HashtagLink tag={ref[1]} />;
            }
            case "a": {
              const [k, p, d] = ref[1].split(":");
              return `nostr:${encodeTLV(d, "naddr", [], p, Number(k))}`;
            }
            default:
              return ref[1];
          }
        }
        return null;
      } else {
        return match;
      }
    })
    .join("");
}

function extractMentions(fragments, tags) {
  return fragments
    .map((f) => {
      if (typeof f === "string") {
        return f.split(MentionRegex).map((match) => {
          const matchTag = match.match(/#\[(\d+)\]/);
          if (matchTag && matchTag.length === 2) {
            const idx = parseInt(matchTag[1]);
            const ref = tags?.find((a, i) => i === idx);
            if (ref) {
              switch (ref[0]) {
                case "p": {
                  return <Mention key={ref[1]} pubkey={ref[1]} />;
                }
                case "e": {
                  return <Note id={ref[1]} />;
                }
                case "t": {
                  return <Link to={`/t/${ref[1]}`}>{ref[1]}</Link>;
                }
                case "a": {
                  try {
                    const [k, p, d] = ref[1].split(":");
                    const naddr = encodeTLV(d, "naddr", [], p, Number(k));
                    return (
                      <Naddr naddr={naddr} kind={Number(k)} d={d} pubkey={p} />
                    );
                  } catch (error) {
                    return ref[1];
                  }
                }
                default:
                  return ref[1];
              }
            }
            return null;
          } else {
            return match;
          }
        });
      }
      return f;
    })
    .flat();
}

function extractNpubs(fragments) {
  return fragments
    .map((f) => {
      if (typeof f === "string") {
        return f.split(/(nostr:npub1[a-z0-9]+)/g).map((i) => {
          if (i.startsWith("nostr:npub1")) {
            try {
              const raw = i.replace(NostrPrefixRegex, "");
              const id = bech32ToHex(raw);
              return <Mention pubkey={id} />;
            } catch (error) {
              return i;
            }
          } else {
            return i;
          }
        });
      }
      return f;
    })
    .flat();
}

function extractNaddrs(fragments) {
  return fragments
    .map((f) => {
      if (typeof f === "string") {
        return f.split(/(nostr:naddr1[a-z0-9]+)/g).map((i) => {
          if (i.startsWith("nostr:naddr1")) {
            try {
              const naddr = i.replace(NostrPrefixRegex, "");
              const { kind, pubkey, d, relays } = decodeNaddr(naddr);
              return (
                <Naddr
                  naddr={naddr}
                  kind={kind}
                  pubkey={pubkey}
                  d={d}
                  relays={relays}
                />
              );
            } catch (error) {
              return i;
            }
          } else {
            return i;
          }
        });
      }
      return f;
    })
    .flat();
}

function extractNprofiles(fragments) {
  return fragments
    .map((f) => {
      if (typeof f === "string") {
        return f.split(/(nostr:nprofile1[a-z0-9]+)/g).map((i) => {
          if (i.startsWith("nostr:nprofile1")) {
            try {
              const { pubkey, relays } = decodeNprofile(
                i.replace(NostrPrefixRegex, "")
              );
              return <NProfile pubkey={pubkey} relays={relays} />;
            } catch (error) {
              return i;
            }
          } else {
            return i;
          }
        });
      }
      return f;
    })
    .flat();
}

function extractNevents(fragments) {
  return fragments
    .map((f) => {
      if (typeof f === "string") {
        return f.split(/(nostr:nevent1[a-z0-9]+)/g).map((i) => {
          if (i.startsWith("nostr:nevent1")) {
            try {
              const nevent = i.replace(NostrPrefixRegex, "");
              const { id, relays } = decodeNevent(nevent);
              return <NEvent nevent={nevent} id={id} relays={relays} />;
            } catch (error) {
              return i;
            }
          } else {
            return i;
          }
        });
      }
      return f;
    })
    .flat();
}

function extractNrelays(fragments) {
  return fragments
    .map((f) => {
      if (typeof f === "string") {
        return f.split(/(nostr:nrelay1[a-z0-9]+)/g).map((i) => {
          if (i.startsWith("nostr:nrelay1")) {
            try {
              const relay = decodeNrelay(i.replace(NostrPrefixRegex, ""));
              return <NRelay nrelay={i} relay={relay} />;
            } catch (error) {
              return i;
            }
          } else {
            return i;
          }
        });
      }
      return f;
    })
    .flat();
}

function extractNoteIds(fragments) {
  return fragments
    .map((f) => {
      if (typeof f === "string") {
        return f.split(/(nostr:note1[a-z0-9]+)/g).map((i) => {
          if (i.startsWith("nostr:note1")) {
            try {
              const id = bech32ToHex(i.replace(NostrPrefixRegex, ""));
              return <Note id={id} />;
            } catch (error) {
              return i;
            }
          } else {
            return i;
          }
        });
      }
      return f;
    })
    .flat();
}

function transformText(ps, tags) {
  let fragments = extractMentions(ps, tags);
  fragments = extractNprofiles(fragments);
  fragments = extractNevents(fragments);
  fragments = extractNrelays(fragments);
  fragments = extractNaddrs(fragments);
  fragments = extractNoteIds(fragments);
  fragments = extractNpubs(fragments);
  return fragments;
}

function nostrUriTransformer(uri) {
  const nostrProtocol = 'nostr:';

  if (uri.startsWith(nostrProtocol)) {
    return uri;
  } else {
    return uriTransformer(uri);
  }
}

export default function Markdown({ tags = [], content }) {
  const components = useMemo(() => {
    return {
      h1: ({ children }) => (
        <h1
          id={
            typeof children?.at(0) === "string" &&
            slugify(children[0], { lower: true })
          }
        >
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2
          id={
            typeof children?.at(0) === "string" &&
            slugify(children[0], { lower: true })
          }
        >
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3
          id={
            typeof children?.at(0) === "string" &&
            slugify(children[0], { lower: true })
          }
        >
          {children}
        </h3>
      ),
      h4: ({ children }) => (
        <h4
          id={
            typeof children?.at(0) === "string" &&
            slugify(children[0], { lower: true })
          }
        >
          {children}
        </h4>
      ),
      h5: ({ children }) => (
        <h5
          id={
            typeof children?.at(0) === "string" &&
            slugify(children[0], { lower: true })
          }
        >
          {children}
        </h5>
      ),
      h6: ({ children }) => (
        <h6
          id={
            typeof children?.at(0) === "string" &&
            slugify(children[0], { lower: true })
          }
        >
          {children}
        </h6>
      ),
      img: ({ alt, src }) => {
        return <img key={src} alt={alt} src={src} />;
      },
      li: ({ children }) =>
        children && <li>{transformText(children, tags)}</li>,
      td: ({ children }) =>
        children && <td>{transformText(children, tags)}</td>,
      p: ({ children }) => children && <p>{transformText(children, tags)}</p>,
      a: (props) => {
        return <HyperText link={props.href}>{props.children}</HyperText>;
      },
    };
  }, [tags]);

  const replaceLinkHrefs = useCallback(
    () => (tree: Node) => {
      visit(tree, (node, index, parent) => {
        if (
          parent &&
          typeof index === "number" &&
          (node.type === "link" || node.type === "linkReference")
        ) {
          try {
            node.url = replaceMentions(node.url, tags);
          } catch (error) {
            console.error(error);
          } finally {
            return SKIP;
          }
        }
      });
    },
    [tags]
  );

  return (
    <ReactMarkdown
      components={components}
      remarkPlugins={[replaceLinkHrefs, remarkGfm, remarkToc, remarkMath]}
      rehypePlugins={[rehypeRaw, rehypeKatex]}
      transformLinkUri={nostrUriTransformer}
    >
      {content}
    </ReactMarkdown>
  );
}
