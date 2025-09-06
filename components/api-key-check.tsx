import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ApiKeyCheckProps {
  hasApiKey: boolean
}

export function ApiKeyCheck({ hasApiKey }: ApiKeyCheckProps) {
  if (hasApiKey) return null

  return (
    <Alert variant="warning" className="mb-6">
      <AlertTitle>API Key Required</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          To use this application, you need an Alpha Vantage API key.
        </p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Get your free API key from{" "}
            <a
              href="https://www.alphavantage.co/support/#api-key"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Alpha Vantage
            </a>
          </li>
          <li>Create a <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm font-mono">.env.local</code> file in the project root</li>
          <li>Add your API key: <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm font-mono">ALPHAVANTAGE_API_KEY=your_key_here</code></li>
          <li>Restart the development server</li>
        </ol>
      </AlertDescription>
    </Alert>
  )
}