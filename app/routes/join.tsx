import { useState } from "react"
import { ActionArgs, json, LoaderArgs } from "@remix-run/node"
import { Form,  useLoaderData } from "@remix-run/react"
import type { JsonRpcSigner } from "@ethersproject/providers"
import { Web3Provider } from "@ethersproject/providers"
import { ErrorTypes, SiweMessage } from "siwe"
import { generateNonce } from "siwe"
import { createUser, getUserByAddress } from "~/models/user.server"
import { createUserSession } from "~/utils/session.server"
import { safeRedirect } from "~/utils/routing.server"
import { nonceCookie} from "~/utils/cookies.server"

export async function action({ request }: ActionArgs) {
  const formData = await request.formData()
	const url = new URL(request.url)
  const redirectTo = safeRedirect(url.searchParams.get("redirectTo"), "/")
  const message = formData.get("message")
  const account = formData.get("account")
  const signature = formData.get("signature")

  if (typeof message !== "string") {
    return json(
      {
        errors: {
          nonce: null,
          account: null,
          message: "Message is required",
          signature: null,
          expired: null,
          valid: null,
        },
      },
      { status: 400 },
    )
  }

  if (typeof account !== "string") {
    return json(
      {
        errors: {
          nonce: null,
          account: "A connected account is required",
          message: null,
          signature: null,
          expired: null,
          valid: null,
        },
      },
      { status: 400 },
    )
  }

  if (typeof signature !== "string") {
    return json(
      {
        errors: {
          nonce: null,
          account: null,
          message: null,
          signature: "Signature is required",
          expired: null,
          valid: null,
        },
      },
      { status: 400 },
    )
  }

  try {
    const siweMessage = new SiweMessage(message)
    // next line does the trick. It will throw if it's invalid
    await siweMessage.validate(signature)

    const cookieHeader = request.headers.get("Cookie")
    const cookie = (await nonceCookie.parse(cookieHeader)) || {}

    if (siweMessage.nonce !== cookie.nonce) {
      return json(
        {
          errors: {
            nonce: "Invalid nonce",
            account: null,
            message: null,
            signature: null,
            expired: null,
            valid: null,
          },
        },
        { status: 422 },
      )
    }
  } catch (error) {
    switch (error) {
      case ErrorTypes.EXPIRED_MESSAGE: {
        return json(
          {
            errors: {
              nonce: null,
              account: null,
              message: null,
              signature: null,
              expired: "Your sesion has expired",
              valid: null,
            },
          },
          { status: 400 },
        )
      }
      case ErrorTypes.INVALID_SIGNATURE: {
        return json(
          {
            errors: {
              nonce: null,
              account: null,
              message: null,
              signature: null,
              expired: null,
              valid: "Your signature is invalid",
            },
          },
          { status: 400 },
        )
      }
      default: {
        break
      }
    }
  }

  const prevUser = await getUserByAddress(account)

  if (!prevUser) {
    const user = await createUser(account)

    return createUserSession({
      request,
      userAddress: user.address,
      remember: true,
      redirectTo
    })
  } else {
    return createUserSession({
      request,
      userAddress: prevUser.address,
      remember: true,
      redirectTo
    })
  }
}

export async function loader({ request }: LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie")
  const cookie = (await nonceCookie.parse(cookieHeader)) || {}

  if (!cookie.nonce) {
    const nextNonce = generateNonce()
    cookie.nonce = nextNonce

    return json(
      {
        nonce: nextNonce,
      },
      {
        headers: {
          "Set-Cookie": await nonceCookie.serialize(cookie),
        },
      },
    )
  }

  return json({
    nonce: cookie.nonce,
  })
}

export default function JoinPage() {
  const { nonce } = useLoaderData<typeof loader>()
  const provider = useProvider()
  const connectMetamask = useConnectMetamask(provider)
  const [account, setAccount] = useState<string | undefined>(undefined)
  const [message, setMessage] = useState<string | undefined>(undefined)
  const [signature, setSignature] = useState<string | undefined>(undefined)

  return (
    <main>
      <button
        aria-label="Connect your wallet"
        onClick={() => connectMetamask()}
      >
        <span>1</span>
        <h3>
          Connect your wallet
        </h3>
      </button>
      <button
        aria-label="Generate personal signature"
        onClick={async () => {
          if (!provider) {
            alert('You need to have Metamask connected to create your signature')

            return
          }

          const account = await getAccount(provider)
          const signer = getSigner(provider)

          const siweMessage = new SiweMessage({
            uri: window.location.origin,
            domain: window.location.host,
            nonce,
            address: account,
            version: "0.1",
            chainId: 1,
            statement: "Sign in with Ethereum to this application",
          })

          const message = siweMessage.prepareMessage()
          setSignature(await signer.signMessage(message))
          setMessage(message)
          setAccount(account)
        }}
      >
        <span>2</span>
        <h3>
          Generate personal signature
        </h3>
      </button>
      <Form method="post">
        <input type="hidden" name="message" value={message} />
        <input type="hidden" name="account" value={account} />
        <input type="hidden" name="signature" value={signature} />
        <button
          type="submit"
          name="_action"
          aria-label="Connect your wallet"
          disabled={Boolean(!message || !signature)}
        >
          <span>3</span>
          <h3>
            Connect your wallet
          </h3>
        </button>
      </Form>
    </main>
  )
}


function useProvider() {
  if (typeof window === "undefined") return

  return (window as any)?.ethereum ? new Web3Provider((window as any).ethereum) : undefined
}

async function getAccount(provider: Web3Provider): Promise<string> {
  return provider.send("eth_accounts", []).then((accounts) => accounts[0])
}

function getSigner(provider: Web3Provider): JsonRpcSigner {
  return provider.getSigner()
}


export function useConnectMetamask(provider: Web3Provider | undefined): () => void {
  async function connectMetamask() {
    if (!provider) {
      alert('You need Metamask to use this application')

      return
    }

    await provider.send("eth_requestAccounts", []).then(() => {
      alert('Metamask connected')
    })
  }

  return connectMetamask
}