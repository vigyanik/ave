'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingCard } from '@/components/ui/loading'
import { ApiCallDisplay } from '@/components/ui/api-call-display'
import { DataTable, createSortableHeader } from '@/components/ui/data-table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ColumnDef } from '@tanstack/react-table'
import { Search } from 'lucide-react'

interface AnnualEarning {
  fiscalDateEnding: string
  reportedEPS: string
}

interface QuarterlyEarning {
  fiscalDateEnding: string
  reportedDate: string
  reportedEPS: string
  estimatedEPS: string
  surprise: string
  surprisePercentage: string
}

const annualColumns: ColumnDef<AnnualEarning>[] = [
  {
    accessorKey: "fiscalDateEnding",
    header: createSortableHeader("Fiscal Year"),
    cell: ({ row }) => formatDate(row.getValue("fiscalDateEnding"))
  },
  {
    accessorKey: "reportedEPS",
    header: ({ column }) => (
      <div className="text-right">
        {createSortableHeader("Reported EPS")({ column })}
      </div>
    ),
    cell: ({ row }) => {
      const eps = row.getValue("reportedEPS") as string
      return (
        <div className="text-right font-medium">
          {formatCurrency(parseFloat(eps))}
        </div>
      )
    }
  }
]

const quarterlyColumns: ColumnDef<QuarterlyEarning>[] = [
  {
    accessorKey: "fiscalDateEnding",
    header: createSortableHeader("Quarter End"),
    cell: ({ row }) => formatDate(row.getValue("fiscalDateEnding"))
  },
  {
    accessorKey: "reportedDate",
    header: createSortableHeader("Report Date"),
    cell: ({ row }) => formatDate(row.getValue("reportedDate"))
  },
  {
    accessorKey: "estimatedEPS",
    header: ({ column }) => (
      <div className="text-right">
        {createSortableHeader("Estimated EPS")({ column })}
      </div>
    ),
    cell: ({ row }) => {
      const eps = row.getValue("estimatedEPS") as string
      return (
        <div className="text-right">
          {eps !== 'None' ? formatCurrency(parseFloat(eps)) : 'N/A'}
        </div>
      )
    }
  },
  {
    accessorKey: "reportedEPS",
    header: ({ column }) => (
      <div className="text-right">
        {createSortableHeader("Reported EPS")({ column })}
      </div>
    ),
    cell: ({ row }) => {
      const eps = row.getValue("reportedEPS") as string
      return (
        <div className="text-right font-medium">
          {eps !== 'None' ? formatCurrency(parseFloat(eps)) : 'N/A'}
        </div>
      )
    }
  },
  {
    accessorKey: "surprise",
    header: ({ column }) => (
      <div className="text-right">
        {createSortableHeader("Surprise")({ column })}
      </div>
    ),
    cell: ({ row }) => {
      const surprise = row.getValue("surprise") as string
      const surpriseNum = parseFloat(surprise)
      return (
        <div className={`text-right ${surpriseNum >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {surprise !== 'None' ? formatCurrency(surpriseNum) : 'N/A'}
        </div>
      )
    }
  },
  {
    accessorKey: "surprisePercentage",
    header: ({ column }) => (
      <div className="text-right">
        {createSortableHeader("Surprise %")({ column })}
      </div>
    ),
    cell: ({ row }) => {
      const surprisePercent = row.getValue("surprisePercentage") as string
      const surpriseNum = parseFloat(surprisePercent)
      return (
        <div className={`text-right ${surpriseNum >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {surprisePercent !== 'None' ? `${surpriseNum.toFixed(2)}%` : 'N/A'}
        </div>
      )
    }
  }
]

export default function EarningsPage() {
  const [symbol, setSymbol] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<any>(null)
  const [lastApiCall, setLastApiCall] = useState<string>('')

  const handleSymbolSearch = async (query: string) => {
    if (query.length < 1) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    try {
      const response = await fetch(`/api/symbol-search?q=${query}`)
      const data = await response.json()
      
      if (data.bestMatches) {
        setSearchResults(data.bestMatches)
        setShowSearchResults(true)
      }
    } catch (err) {
      console.error('Symbol search error:', err)
    }
  }

  const buildAlphaVantageUrl = () => {
    const params = new URLSearchParams()
    params.append('function', 'EARNINGS')
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
          function: 'EARNINGS'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch data')
      }

      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch earnings data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Earnings Data</h1>
          <p className="text-slate-600 dark:text-slate-400">
            View annual and quarterly earnings reports
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Company</CardTitle>
            <CardDescription>Enter a stock symbol to fetch earnings data</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="relative max-w-xs">
                <Input
                  type="text"
                  value={symbol}
                  onChange={(e) => {
                    setSymbol(e.target.value.toUpperCase())
                    handleSymbolSearch(e.target.value)
                  }}
                  placeholder="Enter stock symbol (e.g., AAPL)"
                  required
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => {
                          setSymbol(result['1. symbol'])
                          setShowSearchResults(false)
                        }}
                      >
                        <div className="font-medium">{result['1. symbol']}</div>
                        <div className="text-sm text-slate-500">{result['2. name']}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button type="submit" disabled={loading || !symbol}>
                {loading ? 'Fetching...' : 'Get Earnings'}
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
              title="Alpha Vantage Earnings API Call"
            />
          </div>
        )}

        {data && (
          <div className="space-y-8">
            {data.annualEarnings && data.annualEarnings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Annual Earnings</CardTitle>
                  <CardDescription>Yearly earnings per share data</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={annualColumns}
                    data={data.annualEarnings}
                    searchKey="fiscalDateEnding"
                    pageSize={10}
                    defaultSort={{ id: "fiscalDateEnding", desc: true }}
                  />
                </CardContent>
              </Card>
            )}

            {data.quarterlyEarnings && data.quarterlyEarnings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Quarterly Earnings</CardTitle>
                  <CardDescription>Quarterly earnings reports with estimates vs actual</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={quarterlyColumns}
                    data={data.quarterlyEarnings}
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