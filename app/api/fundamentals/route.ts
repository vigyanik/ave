import { NextRequest, NextResponse } from 'next/server'
import { fetchFromAlphaVantage } from '@/lib/alphavantage'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { symbol, function: fn } = body

    if (!symbol || !fn) {
      return NextResponse.json(
        { error: 'Symbol and function are required' },
        { status: 400 }
      )
    }

    const data = await fetchFromAlphaVantage({
      function: fn,
      symbol
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Fundamentals error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch fundamental data' },
      { status: 500 }
    )
  }
}