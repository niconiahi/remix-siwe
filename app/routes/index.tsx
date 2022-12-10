import { Form, Link } from "@remix-run/react";

export default function Index() {
  return (
    <div>
      <Link to="login">Login</Link>
      <Link to="join">Join</Link>
      <Form action="/logout" method="post">
        <button type="submit">Logout</button>
      </Form>
      <Link to="user">User</Link>
    </div>
  );
}
