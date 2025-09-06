'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingCard } from '@/components/ui/loading'

export default function InsiderTransactionsPage() {
  const [symbol, setSymbol] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // This endpoint would need to be implemented with a different API
      // as Alpha Vantage doesn't provide insider transactions data
      setError('Insider transactions data is not currently available through Alpha Vantage API. This feature would require integration with additional financial data providers.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch insider transactions data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Insider Transactions</h1>
          <p className="text-slate-600 dark:text-slate-400">
            View insider buying and selling activity (Coming Soon)
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Company</CardTitle>
            <CardDescription>Enter a stock symbol to fetch insider transaction data</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <Input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="Enter stock symbol (e.g., AAPL)"
                required
                className="max-w-xs"
                disabled
              />
              <Button type="submit" disabled={true}>
                Coming Soon
              </Button>
            </form>
          </CardContent>
        </Card>

        <Alert variant="info" className="mb-8">
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Feature Under Development</p>
              <p>
                Insider transaction data is not currently available through the Alpha Vantage API. 
                This feature would require integration with additional financial data providers such as:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>SEC EDGAR database</li>
                <li>Financial data aggregators</li>
                <li>Specialized insider trading data services</li>
              </ul>
              <p>
                When implemented, this page will show insider buying/selling activity, 
                transaction dates, amounts, and insider roles with sortable tables 
                and filtering capabilities.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}