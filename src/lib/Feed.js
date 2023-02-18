import { Stack } from "@chakra-ui/react";

import Event from "./Event";

export default function Feed({ events }) {
  return (
    <Stack spacing={12}>
      {events.map((ev) => (
        <Event key={ev.id} event={ev} />
      ))}
    </Stack>
  );
}
