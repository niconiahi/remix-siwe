
import type { ReactElement } from "react"
import HouseIcon from "~/icons/house"
import { PrimaryButton } from "~/components/primary-button"
import { Link } from "@remix-run/react"

export function HomeButton(
  {children, ...buttonProps}: 
  {children: ReactElement | string} | JSX.IntrinsicElements["button"]) 
{

  return (
   <header className="absolute top-4 left-4 fill-gray-500 hover:fill-gray-800">
		<Link to="/">
      <PrimaryButton {...buttonProps}>
        <HouseIcon className="w-8 h-8" />
      </PrimaryButton>
		</Link>
    </header>
  )
}
