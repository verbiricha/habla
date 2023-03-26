import { Link } from "react-router-dom";

export default function NostrLink({ link, children, ...rest }) {
  return (
    <Link
      to={link}
      style={{ textDecoration: "none" }}
      target="_blank"
      rel="noopener noreferrer"
      {...rest}
    >
      {children}
    </Link>
  );
}
