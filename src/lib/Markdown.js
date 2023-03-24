import { useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
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
              return <HashtagLink tag={ref[1]} />;
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
              const { kind, pubkey, d, relays } = decodeNaddr(i);
              return (
                <Naddr
                  naddr={i}
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

function extractNevents(fragments) {
  return fragments
    .map((f) => {
      if (typeof f === "string") {
        return f.split(/(nevent1[a-z0-9]+)/g).map((i) => {
          if (i.startsWith("nevent1")) {
            try {
              const { id, relays } = decodeNevent(i);
              return <NEvent id={id} relays={relays} />;
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
        return f.split(/(nrelay1[a-z0-9]+)/g).map((i) => {
          if (i.startsWith("nrelay1")) {
            try {
              const relay = decodeNrelay(i);
              return <NRelay relay={relay} />;
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
  fragments = extractNevents(fragments);
  fragments = extractNrelays(fragments);
  fragments = extractNaddrs(fragments);
  fragments = extractNoteIds(fragments);
  fragments = extractNpubs(fragments);
  return <p>{fragments}</p>;
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
      p: ({ children }) => children && transformText(children, tags),
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
    >
      {content}
    </ReactMarkdown>
  );
}
