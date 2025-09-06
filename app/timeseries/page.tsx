'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingCard } from '@/components/ui/loading'
import { ApiCallDisplay } from '@/components/ui/api-call-display'
import { DataTable, createSortableHeader } from '@/components/ui/data-table'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Search } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'

interface TimeSeriesData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

const columns: ColumnDef<TimeSeriesData>[] = [
  {
    accessorKey: "date",
    header: createSortableHeader("Date"),
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"))
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  },
  {
    accessorKey: "open",
    header: ({ column }) => (
      <div className="text-right">
        {createSortableHeader("Open")({ column })}
      </div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("open"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "high",
    header: ({ column }) => (
      <div className="text-right">
        {createSortableHeader("High")({ column })}
      </div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("high"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "low",
    header: ({ column }) => (
      <div className="text-right">
        {createSortableHeader("Low")({ column })}
      </div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("low"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "close",
    header: ({ column }) => (
      <div className="text-right">
        {createSortableHeader("Close")({ column })}
      </div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("close"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "volume",
    header: ({ column }) => (
      <div className="text-right">
        {createSortableHeader("Volume")({ column })}
      </div>
    ),
    cell: ({ row }) => {
      const volume = parseFloat(row.getValue("volume"))
      const formatted = new Intl.NumberFormat("en-US").format(volume)
      return <div className="text-right">{formatted}</div>
    },
  },
]

export default function TimeSeriesPage() {
  const [symbol, setSymbol] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedFunction, setSelectedFunction] = useState('TIME_SERIES_DAILY')
  const [interval, setInterval] = useState('5min')
  const [outputSize, setOutputSize] = useState('compact')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<TimeSeriesData[]>([])
  const [metadata, setMetadata] = useState<any>(null)
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
    params.append('function', selectedFunction)
    params.append('symbol', symbol)
    
    if (selectedFunction.includes('INTRADAY')) {
      params.append('interval', interval)
    }
    params.append('outputsize', outputSize)
    params.append('apikey', process.env.ALPHAVANTAGE_API_KEY || 'YOUR_API_KEY')
    
    return `https://www.alphavantage.co/query?${params.toString()}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setData([])
    setShowSearchResults(false)
    
    // Set the API call URL for display
    const apiUrl = buildAlphaVantageUrl()
    setLastApiCall(apiUrl)

    try {
      const response = await fetch('/api/timeseries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          function: selectedFunction,
          interval: selectedFunction === 'TIME_SERIES_INTRADAY' ? interval : undefined,
          outputsize: outputSize
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch data')
      }

      const timeSeriesKey = Object.keys(result).find(key => key.includes('Time Series'))
      const metaKey = Object.keys(result).find(key => key.includes('Meta Data'))

      if (!timeSeriesKey) {
        throw new Error('Invalid response format')
      }

      const timeSeries = result[timeSeriesKey]
      const meta = result[metaKey]

      const formattedData = Object.entries(timeSeries)
        .map(([date, values]: [string, any]) => ({
          date,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume'])
        }))
        .reverse()

      setData(formattedData)
      setMetadata(meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Time Series Data</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Fetch and visualize stock price data across different time intervals
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Configure Parameters</CardTitle>
            <CardDescription>Enter a stock symbol and select data parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium mb-2">Stock Symbol</label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={symbol}
                      onChange={(e) => {
                        setSymbol(e.target.value.toUpperCase())
                        handleSymbolSearch(e.target.value)
                      }}
                      placeholder="e.g., AAPL"
                      required
                      className="pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                  
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

                <div>
                  <label className="block text-sm font-medium mb-2">Time Series Function</label>
                  <Select
                    value={selectedFunction}
                    onChange={(e) => setSelectedFunction(e.target.value)}
                  >
                    <option value="TIME_SERIES_INTRADAY">Intraday</option>
                    <option value="TIME_SERIES_DAILY">Daily</option>
                    <option value="TIME_SERIES_WEEKLY">Weekly</option>
                    <option value="TIME_SERIES_MONTHLY">Monthly</option>
                  </Select>
                </div>

                {selectedFunction === 'TIME_SERIES_INTRADAY' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Interval</label>
                    <Select value={interval} onChange={(e) => setInterval(e.target.value)}>
                      <option value="1min">1 minute</option>
                      <option value="5min">5 minutes</option>
                      <option value="15min">15 minutes</option>
                      <option value="30min">30 minutes</option>
                      <option value="60min">60 minutes</option>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Output Size</label>
                  <Select value={outputSize} onChange={(e) => setOutputSize(e.target.value)}>
                    <option value="compact">Compact (100 points)</option>
                    <option value="full">Full</option>
                  </Select>
                </div>
              </div>

              <Button type="submit" disabled={loading || !symbol}>
                {loading ? 'Fetching...' : 'Fetch Data'}
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
              title="Alpha Vantage Time Series API Call"
            />
          </div>
        )}

        {data.length > 0 && (
          <>
            {metadata && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>
                    {metadata['2. Symbol']} - {metadata['1. Information']}
                  </CardTitle>
                  <CardDescription>
                    Last Refreshed: {metadata['3. Last Refreshed']}
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Price Chart</CardTitle>
                <CardDescription>Closing prices over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          const date = new Date(value)
                          return `${date.getMonth() + 1}/${date.getDate()}`
                        }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        domain={['dataMin - 1', 'dataMax + 1']}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          color: '#0f172a',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          fontSize: '14px'
                        }}
                        labelStyle={{
                          color: '#0f172a',
                          fontWeight: '600',
                          marginBottom: '4px'
                        }}
                        formatter={(value: number) => [
                          <span style={{ color: '#3b82f6', fontWeight: '600' }}>
                            ${value.toFixed(2)}
                          </span>, 
                          'Close Price'
                        ]}
                        labelFormatter={(label) => {
                          const date = new Date(label)
                          return date.toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="close" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={false}
                        name="Close Price"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Price Data Table</CardTitle>
                <CardDescription>Detailed OHLCV data with sorting, filtering, and pagination</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={columns}
                  data={data}
                  searchKey="date"
                  pageSize={20}
                  defaultSort={{ id: "date", desc: true }}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}