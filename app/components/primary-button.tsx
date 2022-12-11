import type { ReactElement } from "react"

export function PrimaryButton(
  {children, ...buttonProps}: 
  {children: ReactElement | string} | JSX.IntrinsicElements["button"]) 
{
  return (
    <button className="flex bg-gray-300 py-2 px-4 rounded-sm border-2 border-gray-500 text-gray-500 space-x-2 hover:bg-gray-400 hover:border-gray-800 hover:text-gray-800 transition disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed" {...buttonProps}>{children}</button>
  )
}
