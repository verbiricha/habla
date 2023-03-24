import { RelayList } from "./Relays";
import User from "./User";

export default function Nprofile({ pubkey, relays }) {
  // todo: nostr link
  return (
    <>
      <User pubkey={pubkey} relays={relays} />
      <RelayList
        relays={relays}
        showUrl={true}
        flexDirection="column"
        mt={4}
        ml={"52px"}
      />
    </>
  );
}
