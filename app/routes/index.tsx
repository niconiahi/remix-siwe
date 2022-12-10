import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div>
      <Link to="login">Login</Link>
      <Link to="join">Join</Link>
    </div>
  );
}
