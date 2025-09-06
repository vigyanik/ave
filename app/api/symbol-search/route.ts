import { NextRequest, NextResponse } from 'next/server'
import { fetchFromAlphaVantage } from '@/lib/alphavantage'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    const data = await fetchFromAlphaVantage({
      function: 'SYMBOL_SEARCH',
      keywords: query
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Symbol search error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search symbols' },
      { status: 500 }
    )
  }
}