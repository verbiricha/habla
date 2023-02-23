import { useColorModeValue } from "@chakra-ui/react";

export default function useColors() {
  const fg = useColorModeValue("#141414", "white");
  const bg = useColorModeValue("white", "#141414");
  const surface = useColorModeValue("#D7D7D7", "#181818");

  return {
    fg,
    bg,
    surface,
  };
}
