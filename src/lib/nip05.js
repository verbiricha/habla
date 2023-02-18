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
