import { Link } from "react-router-dom";
import { useProfile } from "../nostr";

export default function Mention({ pubkey }) {
  const { data } = useProfile({ pubkey });
  return (
    <Link to={`/${pubkey}`}>{data?.display_name || data?.name || pubkey}</Link>
  );
}
