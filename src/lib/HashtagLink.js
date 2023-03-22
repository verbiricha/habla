import { useNavigate } from "react-router-dom";
import { Text } from "@chakra-ui/react";

export default function HashtagLink({ tag, ...rest }) {
  const navigate = useNavigate();
  const onClick = () => {
    navigate(`/t/${tag}`);
  };
  return (
    <Text
      key={tag}
      cursor="pointer"
      color="purple.500"
      onClick={onClick}
      {...rest}
    >
      #{tag}
    </Text>
  );
}
