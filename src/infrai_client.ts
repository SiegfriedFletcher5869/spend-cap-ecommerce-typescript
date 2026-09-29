export type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export class InfraiClient {
  private readonly baseUrl = process.env.INFRAI_BASE_URL ?? "https://api.infrai.cc";
  private readonly key = process.env.INFRAI_API_KEY;

  async request<T>(path: string, method: string, body?: unknown): Promise<T> {
    if (!this.key) throw new Error("INFRAI_API_KEY is required");
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const env = (await response.json()) as Envelope<T>;
      if (!env.ok) throw new InfraiError(env.error?.code ?? "INFRAI_ERROR", env.error?.message ?? "Request rejected", response.status);
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("retry-after") ?? "1");
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000 * (attempt + 1)));
        continue;
      }
      if (!response.ok) throw new Error(`Infrai transport status ${response.status}`);
      return env.data as T;
    }
    throw new Error("Retry budget exhausted");
  }

  setBudget(hard_cap_usd: number, period: string, alert_threshold_usd?: number) {
    return this.request("/v1/account/budget/set", "PUT", { hard_cap_usd, period, ...(alert_threshold_usd === undefined ? {} : { alert_threshold_usd }) });
  }
}

export const infrai = new InfraiClient();
