const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

export interface AlphaVantageParams {
  function: string;
  symbol?: string;
  interval?: string;
  outputsize?: string;
  keywords?: string;
  tickers?: string;
  topics?: string;
  time_from?: string;
  time_to?: string;
  sort?: string;
  [key: string]: string | undefined;
}

export async function fetchFromAlphaVantage(params: AlphaVantageParams) {
  const apiKey = process.env.ALPHAVANTAGE_API_KEY;
  
  if (!apiKey) {
    throw new Error('Alpha Vantage API key is not configured');
  }

  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, value);
    }
  });
  
  queryParams.append('apikey', apiKey);

  const url = `${ALPHA_VANTAGE_BASE_URL}?${queryParams.toString()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data['Error Message']) {
    throw new Error(data['Error Message']);
  }
  
  if (data['Note']) {
    throw new Error('API call frequency limit reached. Please try again later.');
  }

  return data;
}