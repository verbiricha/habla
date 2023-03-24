import { Link } from "react-router-dom";

export default function NostrLink({ link, children }) {
  return (
    <Link
      to={link}
      style={{ textDecoration: "none" }}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </Link>
  );
}
