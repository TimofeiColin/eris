const REQUEST_TIMEOUT = 10_000;

export const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Eris Discord bot' },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  });

  if (!response.ok) {
    throw new Error(`${new URL(url).host} answered with status ${response.status}`);
  }

  return (await response.json()) as T;
};
