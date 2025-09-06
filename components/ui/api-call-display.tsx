'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ApiCallDisplayProps {
  url: string
  method?: string
  title?: string
}

export function ApiCallDisplay({ url, method = 'GET', title = 'API Call' }: ApiCallDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>{title}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 px-2"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="ml-1 text-xs">{copied ? 'Copied!' : 'Copy'}</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="bg-slate-900 rounded-md p-3 font-mono text-sm overflow-x-auto">
          <div className="text-blue-300 mb-1">
            <span className="text-green-300">{method}</span>
          </div>
          <div className="text-slate-200 break-all">
            {url}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}