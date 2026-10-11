/** Fetch wrapper for unreliable networks. No runtime dependencies. */
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
export class HttpClient {
  constructor({ timeout = 8000, retries = 1, retryDelay = 250, fetcher = globalThis.fetch?.bind(globalThis) } = {}) {
    this.timeout = timeout;
    this.retries = retries;
    this.retryDelay = retryDelay;
    this.fetcher = fetcher;
  }
  async request(url, { signal, method = "GET", ...options } = {}) {
    if (!this.fetcher) throw new Error("fetch is unavailable");
    if (!Number.isInteger(this.retries) || this.retries < 0) throw new RangeError("Invalid retry count");
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      const controller = new AbortController();
      const abort = () => controller.abort(signal.reason);
      signal?.addEventListener("abort", abort, { once: true });
      if (signal?.aborted) abort();
      const timer = setTimeout(() => controller.abort(new Error("HTTP timeout")), this.timeout);
      try {
        const response = await this.fetcher(url, { ...options, method, signal: controller.signal });
        if (response.ok || response.status < 500 || attempt === this.retries || !["GET", "HEAD"].includes(method.toUpperCase())) return response;
      } catch (error) {
        if (signal?.aborted || attempt === this.retries || !["GET", "HEAD"].includes(method.toUpperCase())) throw error;
      } finally {
        clearTimeout(timer);
        signal?.removeEventListener("abort", abort);
      }
      await sleep(this.retryDelay * (attempt + 1));
    }
    throw new Error("HTTP request failed");
  }
}
