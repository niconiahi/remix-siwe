import { User } from "@prisma/client"
import { createCookieSessionStorage, redirect } from "@remix-run/node"
import invariant from "tiny-invariant"
import { getUserByAddress } from "~/models/user.server"

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set")

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
})

const USER_SESSION_KEY = "userAddress"

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie")

  return sessionStorage.getSession(cookie)
}

export async function getUserAddress(
  request: Request,
): Promise<User["address"] | undefined> {
  const session = await getSession(request)
  const userAddress = session.get(USER_SESSION_KEY)

  return userAddress
}

export async function getUser(request: Request) {
  const userAddress = await getUserAddress(request)

  if (userAddress === undefined) return null

  const user = await getUserByAddress(userAddress)

  if (user) return user

  throw await logout(request)
}

export async function requireUserAddress(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const userAddress = await getUserAddress(request)

  if (!userAddress) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]])
    throw redirect(`/login?${searchParams}`)
  }

  return userAddress
}

export async function requireUser(request: Request) {
  const userAddress = await requireUserAddress(request)

  const user = await getUserByAddress(userAddress)

  if (user) return user

  throw await logout(request)
}

export async function createUserSession({
  request,
  userAddress,
  remember,
  redirectTo,
}: {
  request: Request
  userAddress: string
  remember: boolean
  redirectTo: string
}) {
  const session = await getSession(request)
  session.set(USER_SESSION_KEY, userAddress)

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 3 // 3 days
          : undefined,
      }),
    },
  })
}

export async function logout(request: Request) {
  const session = await getSession(request)

  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  })
}
