import { NextRequest, NextResponse } from 'next/server'
import { fetchFromAlphaVantage } from '@/lib/alphavantage'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { symbol, function: fn, interval, outputsize } = body

    if (!symbol || !fn) {
      return NextResponse.json(
        { error: 'Symbol and function are required' },
        { status: 400 }
      )
    }

    const params: any = {
      function: fn,
      symbol
    }

    if (interval) params.interval = interval
    if (outputsize) params.outputsize = outputsize

    const data = await fetchFromAlphaVantage(params)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Time series error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch time series data' },
      { status: 500 }
    )
  }
}