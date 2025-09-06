import { NextRequest, NextResponse } from 'next/server'
import { fetchFromAlphaVantage } from '@/lib/alphavantage'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tickers, topics, time_from, time_to, sort } = body

    const params: any = {
      function: 'NEWS_SENTIMENT'
    }

    if (tickers) params.tickers = tickers
    if (topics) params.topics = topics
    if (time_from) params.time_from = time_from
    if (time_to) params.time_to = time_to
    if (sort) params.sort = sort

    const data = await fetchFromAlphaVantage(params)

    // Check for Alpha Vantage API-specific error responses
    if (data.Information && data.Information.includes('Invalid inputs')) {
      throw new Error('NEWS_SENTIMENT API access may require a premium Alpha Vantage API key, or you may have reached your daily request limit. Please check your Alpha Vantage subscription.')
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('News sentiment error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch news sentiment data' },
      { status: 500 }
    )
  }
}