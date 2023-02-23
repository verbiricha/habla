import { useNavigate } from "react-router-dom";
import { Tag } from "@chakra-ui/react";

export default function Hashtag({ tag, ...rest }) {
  const navigate = useNavigate();
  const onClick = () => {
    navigate(`/t/${tag}`);
  };
  return (
    <Tag
      key={tag}
      cursor="pointer"
      color="white"
      background="purple.500"
      size="lg"
      borderRadius="full"
      fontSize="sm"
      onClick={onClick}
      {...rest}
    >
      {tag}
    </Tag>
  );
}
