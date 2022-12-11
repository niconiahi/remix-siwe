import { createCookie } from "@remix-run/node"

export const nonceCookie = createCookie("nonce", {
  maxAge: 604_800,
})
