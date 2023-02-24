import { useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { visit, SKIP } from "unist-util-visit";

import {
  bech32ToHex,
  hexToBech32,
  encodeTLV,
  decodeNprofile,
  decodeNaddr,
} from "../nostr";

import NProfile from "./Nprofile";
import Naddr from "./Naddr";
import Note from "./Note";
import Mention from "./Mention";

export const MentionRegex = /(#\[\d+\])/gi;

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
              return hexToBech32(ref[1], "npub");
            }
            case "e": {
              return hexToBech32(ref[1], "note");
            }
            case "t": {
              return `#${ref[1]}`;
            }
            case "a": {
              const [k, p, d] = ref[1].split(":");
              return encodeTLV(d, "naddr", [], p, Number(k));
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
            const ref = tags?.find((a) => a[2] === idx);
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
                  const [k, p, d] = ref[1].split(":");
                  return (
                    <Naddr naddr={ref[1]} kind={Number(k)} d={d} pubkey={p} />
                  );
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
        return f.split(/(npub1[a-z0-9]+)/g).map((i) => {
          if (i.startsWith("npub1")) {
            try {
              const id = bech32ToHex(i);
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
        return f.split(/(naddr1[a-z0-9]+)/g).map((i) => {
          if (i.startsWith("naddr1")) {
            try {
              const [kind, pubkey, d] = decodeNaddr(i);
              return <Naddr naddr={i} kind={kind} pubkey={pubkey} d={d} />;
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
        return f.split(/(nprofile1[a-z0-9]+)/g).map((i) => {
          if (i.startsWith("nprofile1")) {
            try {
              const { pubkey, relays } = decodeNprofile(i);
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

function extractNoteIds(fragments) {
  return fragments
    .map((f) => {
      if (typeof f === "string") {
        return f.split(/(note1[a-z0-9]+)/g).map((i) => {
          if (i.startsWith("note1")) {
            try {
              const id = bech32ToHex(i);
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
  fragments = extractNaddrs(fragments);
  fragments = extractNoteIds(fragments);
  fragments = extractNpubs(fragments);
  return <p>{fragments}</p>;
}

export default function Markdown({ tags = [], content }) {
  const components = useMemo(() => {
    return {
      p: ({ children }) => children && transformText(children, tags),
      a: ({ href }) => <Link to={href}>{href}</Link>,
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
          node.url = replaceMentions(node.url, tags);
          return SKIP;
        }
      });
    },
    [tags]
  );

  return (
    <ReactMarkdown
      components={components}
      remarkPlugins={[replaceLinkHrefs, remarkGfm]}
    >
      {content}
    </ReactMarkdown>
  );
}
