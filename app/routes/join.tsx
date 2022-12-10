import { useState } from "react"
import { ActionArgs, json, LoaderArgs } from "@remix-run/node"
import { Form, useActionData, useLoaderData } from "@remix-run/react"
import type { JsonRpcSigner } from "@ethersproject/providers"
import { Web3Provider } from "@ethersproject/providers"
import { SiweMessage } from "siwe"
import { createCookie } from "@remix-run/node"
import { generateNonce } from "siwe"

const nonce = createCookie("nonce", {
  maxAge: 604_800,
})

export async function action({ request }: ActionArgs) {
  const formData = await request.formData()

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
        },
      },
      { status: 400 },
    )
  }
}

export async function loader({ request }: LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie")
  const cookie = (await nonce.parse(cookieHeader)) || {}

  if (!cookie.nonce) {
    const nextNonce = generateNonce()
    cookie.nonce = nextNonce

    return json(
      {
        nonce: nextNonce,
      },
      {
        headers: {
          "Set-Cookie": await nonce.serialize(cookie),
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
          setMessage(message)
          setSignature(await signer.signMessage(message))
        }}
      >
        <span>2</span>
        <h3>
          Generate personal signature
        </h3>
      </button>
      <Form method="post">
        <input type="hidden" name="message" value={message} />
        <input type="hidden" name="signature" value={signature} />
        <button
          type="submit"
          name="_action"
          aria-label="Connect your wallet"
          disabled={!provider}
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