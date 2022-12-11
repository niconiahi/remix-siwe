import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { HomeButton } from "~/components/home-button"
import { requireUser } from "~/utils/session.server"

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request)

  return json({ user })
}

export default function User() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <main className="flex items-center justify-center h-full w-full space-x-2">
      <HomeButton />
      <div className="flex flex-col">
        <div className="py-1 px-2 rounded-sm border-2 border-gray-500 text-gray-500 -ml-2 w-fit translate-y-2 bg-white">
          <span>Your connected address is:</span>
        </div>
        <div className="bg-gray-300 py-2 px-4 rounded-sm border-2 border-gray-500 text-gray-500">
          <h3 className="text-gray-700">{user.address}</h3>
        </div>
      </div>
    </main>
  )
}
