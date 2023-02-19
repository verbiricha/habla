import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { bech32ToHex } from "./nostr";
import Note from "./Note";
import Mention from "./Mention";
import Hashtag from "./Hashtag";

export const MentionRegex = /(#\[\d+\])/gi;

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
                  return <Mention pubkey={ref[1]} />;
                }
                case "e": {
                  return <Note id={ref[1]} />;
                }
                case "t": {
                  return <Hashtag tag={ref[1]} />;
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
            const id = bech32ToHex(i);
            return <Mention pubkey={id} />;
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
            const id = bech32ToHex(i);
            return <Note id={id} />;
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
  fragments = extractNoteIds(ps);
  fragments = extractNpubs(fragments);
  return <p>{fragments}</p>;
}

export default function Markdown({ tags = [], content }) {
  const components = useMemo(() => {
    return {
      p: ({ children }) => children && transformText(children, tags),
    };
  }, [tags]);

  return (
    <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
      {content}
    </ReactMarkdown>
  );
}
