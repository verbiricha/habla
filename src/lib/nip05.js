import { Text } from "@chakra-ui/react";

import useNip05 from "./useNip05";

export async function getPubkey(nip05) {
  if (!nip05.includes("@")) {
    return nip05;
  }
  const [username, domain] = nip05.split("@");
  try {
    const { names } = await fetch(
      `https://${domain}/.well-known/nostr.json?name=${encodeURIComponent(
        username
      )}`
    ).then((r) => r.json());
    return names[username.toLowerCase()];
  } catch (error) {
    console.error(error);
  }
}

export default function Nip05({ pubkey, nip05, ...rest }) {
  const nipPubkey = useNip05(nip05);
  const [username, domain] = nip05?.split("@") ?? [];
  return nipPubkey && nipPubkey === pubkey ? (
    <Text as="span" fontSize="sm" {...rest}>
      {username === "_" ? domain : nip05}
    </Text>
  ) : null;
}
