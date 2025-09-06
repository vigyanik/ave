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

interface CashFlow {
  fiscalDateEnding: string
  reportedCurrency: string
  operatingCashflow: string
  cashflowFromInvestment: string
  cashflowFromFinancing: string
  changeInCashAndCashEquivalents: string
  capitalExpenditures: string
  changeInOperatingLiabilities: string
}

const cashFlowColumns: ColumnDef<CashFlow>[] = [
  {
    accessorKey: "fiscalDateEnding",
    header: createSortableHeader("Fiscal Year"),
    cell: ({ row }) => formatDate(row.getValue("fiscalDateEnding"))
  },
  {
    accessorKey: "operatingCashflow",
    header: ({ column }) => (
      <div className="text-right">
        {createSortableHeader("Operating Cash Flow")({ column })}
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue("operatingCashflow") as string
      const numValue = parseFloat(value)
      return (
        <div className={`text-right font-medium ${numValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {value !== 'None' ? formatCurrency(numValue) : 'N/A'}
        </div>
      )
    }
  },
  {
    accessorKey: "cashflowFromInvestment",
    header: ({ column }) => (
      <div className="text-right">
        {createSortableHeader("Investment Cash Flow")({ column })}
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue("cashflowFromInvestment") as string
      const numValue = parseFloat(value)
      return (
        <div className={`text-right ${numValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {value !== 'None' ? formatCurrency(numValue) : 'N/A'}
        </div>
      )
    }
  },
  {
    accessorKey: "cashflowFromFinancing",
    header: ({ column }) => (
      <div className="text-right">
        {createSortableHeader("Financing Cash Flow")({ column })}
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue("cashflowFromFinancing") as string
      const numValue = parseFloat(value)
      return (
        <div className={`text-right ${numValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {value !== 'None' ? formatCurrency(numValue) : 'N/A'}
        </div>
      )
    }
  },
  {
    accessorKey: "changeInCashAndCashEquivalents",
    header: ({ column }) => (
      <div className="text-right">
        {createSortableHeader("Net Change in Cash")({ column })}
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue("changeInCashAndCashEquivalents") as string
      const numValue = parseFloat(value)
      return (
        <div className={`text-right font-medium ${numValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {value !== 'None' ? formatCurrency(numValue) : 'N/A'}
        </div>
      )
    }
  },
  {
    accessorKey: "capitalExpenditures",
    header: ({ column }) => (
      <div className="text-right">
        {createSortableHeader("Capital Expenditures")({ column })}
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue("capitalExpenditures") as string
      return (
        <div className="text-right">
          {value !== 'None' ? formatCurrency(parseFloat(value)) : 'N/A'}
        </div>
      )
    }
  }
]

export default function CashFlowPage() {
  const [symbol, setSymbol] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<any>(null)
  const [lastApiCall, setLastApiCall] = useState<string>('')

  const buildAlphaVantageUrl = () => {
    const params = new URLSearchParams()
    params.append('function', 'CASH_FLOW')
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
          function: 'CASH_FLOW'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch data')
      }

      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cash flow data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Cash Flow Statement</h1>
          <p className="text-slate-600 dark:text-slate-400">
            View annual and quarterly cash flow reports
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Company</CardTitle>
            <CardDescription>Enter a stock symbol to fetch cash flow data</CardDescription>
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
                {loading ? 'Fetching...' : 'Get Cash Flow'}
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
              title="Alpha Vantage Cash Flow API Call"
            />
          </div>
        )}

        {data && (
          <div className="space-y-8">
            {data.annualReports && data.annualReports.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Annual Cash Flow</CardTitle>
                  <CardDescription>Yearly cash flow activity data</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={cashFlowColumns}
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
                  <CardTitle>Quarterly Cash Flow</CardTitle>
                  <CardDescription>Quarterly cash flow activity data</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={cashFlowColumns}
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