// src/lib/http.ts

export type RetryOpts = {
  retries?: number;
  baseDelayMs?: number;
  timeoutMs?: number;
  jitter?: boolean;
};

const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

const backoff = (base: number, attempt: number, jitter: boolean) =>
  base * 2 ** attempt + (jitter ? Math.floor(Math.random() * 100) : 0);

export async function fetchWithResilience(
  url: string,
  opts: RequestInit & {
    retry?: RetryOpts;
    idempotencyKey?: string;
    requestId?: string;
  } = {}
) {
  const { retry = {}, idempotencyKey, requestId, ...init } = opts;

  const {
    retries = 2,
    baseDelayMs = 300,
    timeoutMs = 3000,
    jitter = true
  } = retry;

  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");

  if (idempotencyKey)
    headers.set("Idempotency-Key", idempotencyKey);

  headers.set(
    "X-Request-Id",
    requestId ?? crypto.randomUUID()
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...init,
      headers,
      signal: controller.signal
    });

    // 429 Too Many Requests → чекаємо Retry-After
    if (res.status === 429 && retries >= 1) {
      const retryAfter =
        Number(res.headers.get("Retry-After") || 1) * 1000;

      await sleep(retryAfter);

      return fetchWithResilience(url, {
        ...opts,
        retry: { ...retry, retries: retries - 1 }
      });
    }

    // 5xx → Backoff retry
    if ([502, 503, 504].includes(res.status) && retries >= 1) {
      const attempt = (opts as any).__a ?? 0;

      await sleep(backoff(baseDelayMs, attempt, jitter));

      return fetchWithResilience(url, {
        ...(opts as any),
        __a: attempt + 1,
        retry: { ...retry, retries: retries - 1 }
      });
    }

    return res;
  } catch (err) {
    if (retries >= 1) {
      const attempt = (opts as any).__a ?? 0;

      await sleep(backoff(baseDelayMs, attempt, jitter));

      return fetchWithResilience(url, {
        ...(opts as any),
        __a: attempt + 1,
        retry: { ...retry, retries: retries - 1 }
      });
    }

    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
