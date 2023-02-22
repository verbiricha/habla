import { RelayList } from "./Relays";
import User from "./User";

export default function Nprofile({ pubkey, relays }) {
  return (
    <>
      <User pubkey={pubkey} />
      <RelayList
        relays={relays}
        showUrl={true}
        flexDirection="column"
        ml={"52px"}
      />
    </>
  );
}
