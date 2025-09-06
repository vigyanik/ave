# Alpha Vantage Data Explorer

A modern, production-ready Next.js application for exploring financial market data through the Alpha Vantage API. Built with TypeScript, Tailwind CSS, and featuring interactive charts and tables.

## Features

- **Time Series Data**: Access intraday, daily, weekly, and monthly stock price data with interactive charts
- **News & Sentiment Analysis**: Real-time news and sentiment analysis for stocks and market topics
- **Fundamental Data**: Company financials, earnings, balance sheets, cash flow, and insider transactions
- **Modern UI**: Clean, responsive design with dark mode support
- **Interactive Visualizations**: Charts powered by Recharts for data visualization
- **Symbol Search**: Autocomplete search for stock symbols
- **Error Handling**: Graceful error handling with user-friendly messages
- **Loading States**: Smooth loading indicators for better UX

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Tables**: Built-in responsive tables
- **HTTP Client**: Axios
- **UI Components**: Custom components with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Alpha Vantage API key (free from [Alpha Vantage](https://www.alphavantage.co/support/#api-key))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd avn
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the project root:
```env
ALPHAVANTAGE_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
avn/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── symbol-search/        # Symbol search endpoint
│   │   ├── timeseries/          # Time series data endpoint
│   │   ├── news-sentiment/      # News sentiment endpoint
│   │   └── fundamentals/        # Fundamental data endpoint
│   ├── timeseries/              # Time series page
│   ├── news-sentiment/          # News sentiment page
│   ├── fundamentals/            # Fundamental data pages
│   │   ├── overview/
│   │   ├── earnings/
│   │   └── ...
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                   # Reusable components
│   ├── ui/                      # UI components
│   │   ├── card.tsx
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── alert.tsx
│   │   └── loading.tsx
│   ├── layout/                  # Layout components
│   │   └── navbar.tsx
│   └── api-key-check.tsx        # API key validation component
├── lib/                          # Utility functions
│   ├── alphavantage.ts          # Alpha Vantage API client
│   └── utils.ts                 # Helper functions
└── public/                       # Static assets
```

## Available Pages

### Home (`/`)
- Welcome page with navigation cards
- API key status check
- Getting started guide

### Time Series (`/timeseries`)
- Fetch stock price data (intraday, daily, weekly, monthly)
- Interactive line chart for closing prices
- Detailed OHLCV data table
- Symbol search with autocomplete

### News & Sentiment (`/news-sentiment`)
- Search news by tickers and topics
- Filter by date range
- Sentiment analysis indicators
- Direct links to articles

### Fundamentals
- **Company Overview** (`/fundamentals/overview`): Company info and key metrics
- **Earnings** (`/fundamentals/earnings`): Annual and quarterly earnings reports
- Additional pages for income statements, balance sheets, cash flow, and insider transactions

## API Routes

All API routes are protected server-side and require the `ALPHAVANTAGE_API_KEY` environment variable.

- `GET /api/symbol-search?q=<query>`: Search for stock symbols
- `POST /api/timeseries`: Fetch time series data
- `POST /api/news-sentiment`: Fetch news and sentiment data
- `POST /api/fundamentals`: Fetch fundamental data

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ALPHAVANTAGE_API_KEY` | Your Alpha Vantage API key | Yes |

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Deployment

This application can be deployed to any platform that supports Next.js:

- **Vercel**: Zero-config deployment (recommended)
- **Netlify**: Static export or serverless functions
- **Docker**: Containerized deployment
- **Node.js server**: Traditional Node.js hosting

Remember to set the `ALPHAVANTAGE_API_KEY` environment variable in your deployment platform.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- Data provided by [Alpha Vantage](https://www.alphavantage.co)
- Built with [Next.js](https://nextjs.org)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Charts by [Recharts](https://recharts.org)
