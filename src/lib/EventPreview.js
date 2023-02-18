import Markdown from "./Markdown";

export default function EventPreview({ event }) {
  return <Markdown content={event.content} tags={event.tags} />;
}
