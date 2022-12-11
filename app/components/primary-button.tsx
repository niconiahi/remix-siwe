import type { ReactElement } from "react"

export function PrimaryButton({
  children,
  ...buttonProps
}: { children: ReactElement | string } | JSX.IntrinsicElements["button"]) {
  return (
    <button
      className="flex space-x-2 rounded-sm border-2 border-gray-500 bg-gray-300 py-2 px-4 text-gray-500 outline-offset-1 transition hover:border-gray-800 hover:bg-gray-400 hover:text-gray-800 disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-gray-200 disabled:text-gray-400"
      {...buttonProps}
    >
      {children}
    </button>
  )
}
