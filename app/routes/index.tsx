import { Form, Link } from "@remix-run/react";
import { PrimaryButton } from "~/components/primary-button";

export default function Index() {
  return (
    <div className="flex items-center justify-center h-full w-full space-x-2">
      <Link to="login">
        <PrimaryButton>Login</PrimaryButton>
      </Link>
      <Link to="join">
        <PrimaryButton>Join</PrimaryButton>
      </Link>
      <Form action="/logout" method="post">
        <PrimaryButton type='submit'>Logout</PrimaryButton>
      </Form>
      <Link to="user">
        <PrimaryButton type='submit'>User</PrimaryButton>
      </Link>
    </div>
  );
}
