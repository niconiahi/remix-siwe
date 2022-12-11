import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { HomeButton } from "~/components/home-button"
import { requireUser } from "~/utils/session.server"

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request)

  return json({ user })
}

export default function User() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <main className="flex h-full w-full items-center justify-center space-x-2">
      <HomeButton />
      <div className="flex flex-col">
        <div className="-ml-2 w-fit translate-y-2 rounded-sm border-2 border-gray-500 bg-white py-1 px-2 text-gray-500">
          <span>Your connected address is:</span>
        </div>
        <div className="rounded-sm border-2 border-gray-500 bg-gray-300 py-2 px-4 text-gray-500">
          <h3 className="text-gray-700">{user.address}</h3>
        </div>
      </div>
    </main>
  )
}
