export default function NostrLink({ link, children }) {
  return (
    <a href={`nostr:${link}`} style={{ textDecoration: "none" }}>
      {children}
    </a>
  );
}
