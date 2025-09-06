'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingCard } from '@/components/ui/loading'
import { ApiCallDisplay } from '@/components/ui/api-call-display'
import { ExternalLink, TrendingUp, TrendingDown, Search, X, Plus, Calendar, Clock } from 'lucide-react'

interface NewsItem {
  title: string
  url: string
  summary: string
  source: string
  category_within_source: string
  time_published: string
  overall_sentiment_score: number
  overall_sentiment_label: string
  ticker_sentiment: Array<{
    ticker: string
    relevance_score: string
    ticker_sentiment_score: string
    ticker_sentiment_label: string
  }>
}

export default function NewsSentimentPage() {
  const [tickerInput, setTickerInput] = useState('')
  const [selectedTickers, setSelectedTickers] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [topics, setTopics] = useState('')
  const [timeFrom, setTimeFrom] = useState('')
  const [timeTo, setTimeTo] = useState('')
  const [sort, setSort] = useState('LATEST')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [newsData, setNewsData] = useState<NewsItem[]>([])
  const [lastApiCall, setLastApiCall] = useState<string>('')

  const handleTickerSearch = async (query: string) => {
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

  const addTicker = (ticker: string) => {
    if (ticker && !selectedTickers.includes(ticker)) {
      setSelectedTickers([...selectedTickers, ticker])
      setTickerInput('')
      setShowSearchResults(false)
    }
  }

  const removeTicker = (ticker: string) => {
    setSelectedTickers(selectedTickers.filter(t => t !== ticker))
  }

  const handleAddTickerFromInput = () => {
    if (tickerInput.trim()) {
      addTicker(tickerInput.trim().toUpperCase())
    }
  }

  const formatDateTimeForAPI = (dateTimeString: string) => {
    if (!dateTimeString) return undefined
    // Convert from "2023-12-25T14:30" to "20231225T1430"
    return dateTimeString.replace(/[-:]/g, '')
  }

  const buildAlphaVantageUrl = () => {
    const params = new URLSearchParams()
    params.append('function', 'NEWS_SENTIMENT')
    
    if (selectedTickers.length > 0) {
      params.append('tickers', selectedTickers.join(','))
    }
    if (topics) {
      params.append('topics', topics)
    }
    if (timeFrom) {
      params.append('time_from', formatDateTimeForAPI(timeFrom) || '')
    }
    if (timeTo) {
      params.append('time_to', formatDateTimeForAPI(timeTo) || '')
    }
    params.append('sort', sort)
    params.append('apikey', process.env.ALPHAVANTAGE_API_KEY || 'YOUR_API_KEY')
    
    return `https://www.alphavantage.co/query?${params.toString()}`
  }

  const getDefaultDateTime = (daysAgo: number) => {
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    date.setHours(9, 0, 0, 0) // Set to 9 AM
    return date.toISOString().slice(0, 16)
  }

  // Set default date range (7 days ago to now)
  const initializeDateRange = () => {
    if (!timeFrom) setTimeFrom(getDefaultDateTime(7))
    if (!timeTo) setTimeTo(new Date().toISOString().slice(0, 16))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setNewsData([])
    
    // Set the API call URL for display
    const apiUrl = buildAlphaVantageUrl()
    setLastApiCall(apiUrl)

    try {
      const response = await fetch('/api/news-sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tickers: selectedTickers.length > 0 ? selectedTickers.join(',') : undefined,
          topics: topics || undefined,
          time_from: formatDateTimeForAPI(timeFrom),
          time_to: formatDateTimeForAPI(timeTo),
          sort
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch data')
      }

      if (result.feed) {
        setNewsData(result.feed)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news data')
    } finally {
      setLoading(false)
    }
  }

  const getSentimentColor = (score: number) => {
    if (score > 0.35) return 'text-green-600'
    if (score < -0.35) return 'text-red-600'
    return 'text-yellow-600'
  }

  const getSentimentIcon = (score: number) => {
    if (score > 0.35) return <TrendingUp className="h-4 w-4" />
    if (score < -0.35) return <TrendingDown className="h-4 w-4" />
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">News & Sentiment Analysis</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Get real-time news and sentiment analysis for stocks and market topics
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Parameters</CardTitle>
            <CardDescription>Configure your news search criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Ticker Selection with Autocomplete */}
              <div className="space-y-3">
                <label className="block text-sm font-medium">Stock Tickers</label>
                
                {/* Ticker Input with Autocomplete */}
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type="text"
                        value={tickerInput}
                        onChange={(e) => {
                          setTickerInput(e.target.value.toUpperCase())
                          handleTickerSearch(e.target.value)
                        }}
                        placeholder="Search for stock symbols (e.g., AAPL, MSFT)"
                        className="pr-10"
                      />
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddTickerFromInput}
                      disabled={!tickerInput.trim()}
                      className="px-3"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Autocomplete Dropdown */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {searchResults.map((result, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                          onClick={() => addTicker(result['1. symbol'])}
                        >
                          <div className="font-semibold text-blue-600 dark:text-blue-400">{result['1. symbol']}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 truncate">{result['2. name']}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Ticker Chips */}
                {selectedTickers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTickers.map((ticker) => (
                      <div
                        key={ticker}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                      >
                        {ticker}
                        <button
                          type="button"
                          onClick={() => removeTicker(ticker)}
                          className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Time From with better UI */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    From Date & Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={timeFrom}
                    onChange={(e) => setTimeFrom(e.target.value)}
                    onFocus={() => {
                      if (!timeFrom) setTimeFrom(getDefaultDateTime(7))
                    }}
                    className="text-sm"
                  />
                </div>

                {/* Time To with better UI */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    To Date & Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={timeTo}
                    onChange={(e) => setTimeTo(e.target.value)}
                    onFocus={() => {
                      if (!timeTo) setTimeTo(new Date().toISOString().slice(0, 16))
                    }}
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Quick Date Range Presets */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 py-1">Quick ranges:</span>
                {[
                  { label: 'Last 24h', days: 1 },
                  { label: 'Last 3 days', days: 3 },
                  { label: 'Last week', days: 7 },
                  { label: 'Last month', days: 30 }
                ].map(({ label, days }) => (
                  <Button
                    key={label}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTimeFrom(getDefaultDateTime(days))
                      setTimeTo(new Date().toISOString().slice(0, 16))
                    }}
                    className="text-xs"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {label}
                  </Button>
                ))}
              </div>

              {/* Topics Field - Optional */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Topics (comma-separated) - Optional</label>
                <Input
                  type="text"
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                  placeholder="e.g., earnings, merger, IPO"
                  className="text-sm"
                />
              </div>

              {/* Sort and Submit */}
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Sort By</label>
                  <Select value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="LATEST">Latest</option>
                    <option value="EARLIEST">Earliest</option>
                    <option value="RELEVANCE">Relevance</option>
                  </Select>
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="px-6"
                >
                  {loading ? 'Searching...' : 'Search News'}
                </Button>
              </div>
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
              title="Alpha Vantage News Sentiment API Call"
            />
          </div>
        )}

        {newsData.length > 0 && (
          <div className="space-y-4">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Found {newsData.length} articles
            </div>
            
            {newsData.map((article, idx) => (
              <Card key={idx} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 transition-colors flex items-center gap-2"
                        >
                          {article.title}
                          <ExternalLink className="h-4 w-4 flex-shrink-0" />
                        </a>
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>{article.source}</span>
                        <span>•</span>
                        <span>
                          {new Date(article.time_published).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 ${getSentimentColor(article.overall_sentiment_score)}`}>
                      {getSentimentIcon(article.overall_sentiment_score)}
                      <div className="text-right">
                        <div className="font-semibold">
                          {article.overall_sentiment_label}
                        </div>
                        <div className="text-xs">
                          {(article.overall_sentiment_score * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {article.summary}
                  </p>
                  
                  {article.ticker_sentiment && article.ticker_sentiment.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {article.ticker_sentiment.map((ticker, tidx) => (
                        <div
                          key={tidx}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-sm"
                        >
                          <span className="font-medium">{ticker.ticker}</span>
                          <span className={getSentimentColor(parseFloat(ticker.ticker_sentiment_score))}>
                            {ticker.ticker_sentiment_label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {newsData.length === 0 && !loading && !error && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-slate-500">
                Enter search criteria above to fetch news articles
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}