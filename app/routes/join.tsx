import { useState } from "react"
import { json } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import type { JsonRpcSigner } from "@ethersproject/providers"
import { Web3Provider } from "@ethersproject/providers"
import { SiweMessage } from "siwe"

export function loader() {
  return json({ nonce: "1" })
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