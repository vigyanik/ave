'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingCard } from '@/components/ui/loading'
import { ApiCallDisplay } from '@/components/ui/api-call-display'
import { DataTable, createSortableHeader } from '@/components/ui/data-table'
import { SymbolSearchInput } from '@/components/ui/symbol-search-input'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ColumnDef } from '@tanstack/react-table'

interface IncomeStatement {
  fiscalDateEnding: string
  reportedCurrency: string
  totalRevenue: string
  totalOperatingExpense: string
  costOfRevenue: string
  grossProfit: string
  ebit: string
  netIncome: string
}

const annualColumns: ColumnDef<IncomeStatement>[] = [
  {
    accessorKey: "fiscalDateEnding",
    header: createSortableHeader("Fiscal Year"),
    cell: ({ row }) => formatDate(row.getValue("fiscalDateEnding"))
  },
  {
    accessorKey: "totalRevenue",
    header: ({ column }) => (
      <div className="text-right">
        {createSortableHeader("Total Revenue")({ column })}
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue("totalRevenue") as string
      return (
        <div className="text-right font-medium">
          {value !== 'None' ? formatCurrency(parseFloat(value)) : 'N/A'}
        </div>
      )
    }
  },
  {
    accessorKey: "grossProfit",
    header: ({ column }) => (
      <div className="text-right">
        {createSortableHeader("Gross Profit")({ column })}
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue("grossProfit") as string
      return (
        <div className="text-right font-medium">
          {value !== 'None' ? formatCurrency(parseFloat(value)) : 'N/A'}
        </div>
      )
    }
  },
  {
    accessorKey: "totalOperatingExpense",
    header: ({ column }) => (
      <div className="text-right">
        {createSortableHeader("Operating Expense")({ column })}
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue("totalOperatingExpense") as string
      return (
        <div className="text-right">
          {value !== 'None' ? formatCurrency(parseFloat(value)) : 'N/A'}
        </div>
      )
    }
  },
  {
    accessorKey: "ebit",
    header: ({ column }) => (
      <div className="text-right">
        {createSortableHeader("EBIT")({ column })}
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue("ebit") as string
      return (
        <div className="text-right">
          {value !== 'None' ? formatCurrency(parseFloat(value)) : 'N/A'}
        </div>
      )
    }
  },
  {
    accessorKey: "netIncome",
    header: ({ column }) => (
      <div className="text-right">
        {createSortableHeader("Net Income")({ column })}
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue("netIncome") as string
      return (
        <div className="text-right font-medium">
          {value !== 'None' ? formatCurrency(parseFloat(value)) : 'N/A'}
        </div>
      )
    }
  }
]

export default function IncomeStatementPage() {
  const [symbol, setSymbol] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<any>(null)
  const [lastApiCall, setLastApiCall] = useState<string>('')

  const buildAlphaVantageUrl = () => {
    const params = new URLSearchParams()
    params.append('function', 'INCOME_STATEMENT')
    params.append('symbol', symbol)
    params.append('apikey', process.env.ALPHAVANTAGE_API_KEY || 'YOUR_API_KEY')
    
    return `https://www.alphavantage.co/query?${params.toString()}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setData(null)
    
    // Set the API call URL for display
    const apiUrl = buildAlphaVantageUrl()
    setLastApiCall(apiUrl)

    try {
      const response = await fetch('/api/fundamentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          function: 'INCOME_STATEMENT'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch data')
      }

      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch income statement data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Income Statement</h1>
          <p className="text-slate-600 dark:text-slate-400">
            View annual and quarterly income statement reports
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Company</CardTitle>
            <CardDescription>Enter a stock symbol to fetch income statement data</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <SymbolSearchInput
                value={symbol}
                onChange={setSymbol}
                className="max-w-xs"
                required
              />
              <Button type="submit" disabled={loading || !symbol}>
                {loading ? 'Fetching...' : 'Get Income Statement'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="error" className="mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && <LoadingCard />}

        {lastApiCall && (
          <div className="mb-6">
            <ApiCallDisplay 
              url={lastApiCall}
              title="Alpha Vantage Income Statement API Call"
            />
          </div>
        )}

        {data && (
          <div className="space-y-8">
            {data.annualReports && data.annualReports.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Annual Income Statement</CardTitle>
                  <CardDescription>Yearly financial performance data</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={annualColumns}
                    data={data.annualReports}
                    searchKey="fiscalDateEnding"
                    pageSize={10}
                    defaultSort={{ id: "fiscalDateEnding", desc: true }}
                  />
                </CardContent>
              </Card>
            )}

            {data.quarterlyReports && data.quarterlyReports.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Quarterly Income Statement</CardTitle>
                  <CardDescription>Quarterly financial performance data</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={annualColumns}
                    data={data.quarterlyReports}
                    searchKey="fiscalDateEnding"
                    pageSize={15}
                    defaultSort={{ id: "fiscalDateEnding", desc: true }}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}