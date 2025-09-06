'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface SymbolSearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  required?: boolean
}

export function SymbolSearchInput({ 
  value, 
  onChange, 
  placeholder = "Enter stock symbol (e.g., AAPL)",
  className = "",
  required = false 
}: SymbolSearchInputProps) {
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)

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

  const handleInputChange = (inputValue: string) => {
    const upperValue = inputValue.toUpperCase()
    onChange(upperValue)
    handleSymbolSearch(inputValue)
  }

  const selectSymbol = (symbol: string) => {
    onChange(symbol)
    setShowSearchResults(false)
  }

  return (
    <div className={`relative ${className}`}>
      <Input
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder}
        required={required}
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
              onClick={() => selectSymbol(result['1. symbol'])}
            >
              <div className="font-medium">{result['1. symbol']}</div>
              <div className="text-sm text-slate-500">{result['2. name']}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}