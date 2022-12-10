import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { requireUser } from "~/utils/session.server"

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request)

  return json({ user })
}

export default function User() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <div>
      <Link to="/">Home</Link>
      <h3 className="text-2xl font-bold">Connected user address: {user.address}</h3>
    </div>
  )
}
