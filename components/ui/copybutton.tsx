// components/ui/CopyButton.tsx
"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 absolute top-2 right-2"
    >
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      {/* {copied ? "Copied" : "Copy"} */}
    </button>
  )
}
