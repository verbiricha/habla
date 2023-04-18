import {NIP27URLReplace} from "./utils";

test('NIP27URLReplace links with npubs identifies', () => {
    const input = "Sample text with url https://snort.social/p/npub1utx00neqgqln72j22kej3ux7803c2k986henvvha4thuwfkper4s7r50e8."
    const expected_ouput = "Sample text with url nostr:npub1utx00neqgqln72j22kej3ux7803c2k986henvvha4thuwfkper4s7r50e8."
    expect(NIP27URLReplace(input)).toBe(expected_ouput);
});

test('NIP27URLReplace links with note identifiers', () => {
    const input = "Another sample text with [url](https://primal.net/thread/note1gc78tn2z9jyyav4lrwed8hl2xz2nggqsxr2setg3gqda0dlzwk6q99skts)."
    const expected_ouput = "Another sample text with [url](nostr:note1gc78tn2z9jyyav4lrwed8hl2xz2nggqsxr2setg3gqda0dlzwk6q99skts)."
    expect(NIP27URLReplace(input)).toBe(expected_ouput);
});

test('NIP27URLReplace links with nevent identifiers', () => {
    const input = "Example https://coracle.social/nevent1qqsxgxcsq5vevy4wdty5z5v88nhwp2fc5qgl0ws5rmamn6z72hwv3qcpyfmhxue69uhkummnw3ez6an9wf5kv6t9vsh8wetvd3hhyer9wghxuet5qk6c9q?random_parameter=true"
    const expected_ouput = "Example nostr:nevent1qqsxgxcsq5vevy4wdty5z5v88nhwp2fc5qgl0ws5rmamn6z72hwv3qcpyfmhxue69uhkummnw3ez6an9wf5kv6t9vsh8wetvd3hhyer9wghxuet5qk6c9q"
    expect(NIP27URLReplace(input)).toBe(expected_ouput);
});

test('NIP27URLReplace links with nprofile identifiers', () => {
    const input = "Nprofile url https://example.com/path/to/nprofile1234567890123456789012345678901234?param1=value1&param2=value2."
    const expected_ouput = "Nprofile url nostr:nprofile1234567890123456789012345678901234."

    expect(NIP27URLReplace(input)).toBe(expected_ouput);
})

test('NIP27URLReplace links with nrelay nevent identifiers', () => {
    const input = "Nrelay url https://example.com/nrelay1asdf2ddd3."
    const expected_ouput = "Nrelay url nostr:nrelay1asdf2ddd3."

    expect(NIP27URLReplace(input)).toBe(expected_ouput);
})

test('NIP27URLReplace links with naddr naddr identifiers', () => {
    const input = "Naddr url https://example.com/naddr1qqsxgxcsq5vevy4wdty5z5v88nhwp2fc5qgl0ws5rmamn6z72hwv3qcpyfmhxue69uhkummnw3ez6an9wf5kv6t9vsh8wetvd3hhyer9wghxuet5qk6c9q?param1=value1."
    const expected_ouput = "Naddr url nostr:naddr1qqsxgxcsq5vevy4wdty5z5v88nhwp2fc5qgl0ws5rmamn6z72hwv3qcpyfmhxue69uhkummnw3ez6an9wf5kv6t9vsh8wetvd3hhyer9wghxuet5qk6c9q."
    expect(NIP27URLReplace(input)).toBe(expected_ouput);
})

test('NIP27URLReplace links with edge-case URLs (ports, ipv6, hash fragment)', () => {
    const input =  "url with a port number: http://example.com:8080/nprofile0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef?param=value&foo=bar. This url has an IPv6 address: http://[2001:0db8:85a3:0000:0000:8a2e:0370:7334]/nevent0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef. This url has a hash fragment https://example.com/note1234567890123456789012345678901234#sectionofmarkdowndocument."
    const expected_ouput = "url with a port number: nostr:nprofile0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef. This url has an IPv6 address: nostr:nevent0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef. This url has a hash fragment nostr:note1234567890123456789012345678901234."
    expect(NIP27URLReplace(input)).toBe(expected_ouput);
})