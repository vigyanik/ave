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

interface BalanceSheet {
  fiscalDateEnding: string
  reportedCurrency: string
  totalAssets: string
  totalCurrentAssets: string
  cashAndCashEquivalentsAtCarryingValue: string
  totalCurrentLiabilities: string
  totalLiabilities: string
  totalShareholderEquity: string
  retainedEarnings: string
}

const balanceSheetColumns: ColumnDef<BalanceSheet>[] = [
  {
    accessorKey: "fiscalDateEnding",
    header: createSortableHeader("Fiscal Year"),
    cell: ({ row }) => formatDate(row.getValue("fiscalDateEnding"))
  },
  {
    accessorKey: "totalAssets",
    header: ({ column }) => (
      <div className="text-right">
        {createSortableHeader("Total Assets")({ column })}
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue("totalAssets") as string
      return (
        <div className="text-right font-medium">
          {value !== 'None' ? formatCurrency(parseFloat(value)) : 'N/A'}
        </div>
      )
    }
  },
  {
    accessorKey: "totalCurrentAssets",
    header: ({ column }) => (
      <div className="text-right">
        {createSortableHeader("Current Assets")({ column })}
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue("totalCurrentAssets") as string
      return (
        <div className="text-right">
          {value !== 'None' ? formatCurrency(parseFloat(value)) : 'N/A'}
        </div>
      )
    }
  },
  {
    accessorKey: "cashAndCashEquivalentsAtCarryingValue",
    header: ({ column }) => (
      <div className="text-right">
        {createSortableHeader("Cash & Equivalents")({ column })}
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue("cashAndCashEquivalentsAtCarryingValue") as string
      return (
        <div className="text-right">
          {value !== 'None' ? formatCurrency(parseFloat(value)) : 'N/A'}
        </div>
      )
    }
  },
  {
    accessorKey: "totalLiabilities",
    header: ({ column }) => (
      <div className="text-right">
        {createSortableHeader("Total Liabilities")({ column })}
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue("totalLiabilities") as string
      return (
        <div className="text-right">
          {value !== 'None' ? formatCurrency(parseFloat(value)) : 'N/A'}
        </div>
      )
    }
  },
  {
    accessorKey: "totalShareholderEquity",
    header: ({ column }) => (
      <div className="text-right">
        {createSortableHeader("Shareholder Equity")({ column })}
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue("totalShareholderEquity") as string
      return (
        <div className="text-right font-medium">
          {value !== 'None' ? formatCurrency(parseFloat(value)) : 'N/A'}
        </div>
      )
    }
  }
]

export default function BalanceSheetPage() {
  const [symbol, setSymbol] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<any>(null)
  const [lastApiCall, setLastApiCall] = useState<string>('')

  const buildAlphaVantageUrl = () => {
    const params = new URLSearchParams()
    params.append('function', 'BALANCE_SHEET')
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
          function: 'BALANCE_SHEET'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch data')
      }

      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance sheet data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Balance Sheet</h1>
          <p className="text-slate-600 dark:text-slate-400">
            View annual and quarterly balance sheet reports
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Company</CardTitle>
            <CardDescription>Enter a stock symbol to fetch balance sheet data</CardDescription>
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
                {loading ? 'Fetching...' : 'Get Balance Sheet'}
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
              title="Alpha Vantage Balance Sheet API Call"
            />
          </div>
        )}

        {data && (
          <div className="space-y-8">
            {data.annualReports && data.annualReports.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Annual Balance Sheet</CardTitle>
                  <CardDescription>Yearly financial position data</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={balanceSheetColumns}
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
                  <CardTitle>Quarterly Balance Sheet</CardTitle>
                  <CardDescription>Quarterly financial position data</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={balanceSheetColumns}
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