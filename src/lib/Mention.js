import { Link } from "react-router-dom";
import { nip19 } from "nostr-tools";
import { useProfile } from "../nostr";

export default function Mention({ pubkey }) {
  const { data } = useProfile({ pubkey });
  return (
    <Link to={`/p/${nip19.npubEncode(pubkey)}`}>
      {data?.display_name || data?.name || pubkey}
    </Link>
  );
}
