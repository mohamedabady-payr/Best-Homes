import type { PayrOnboardingPayload } from "@/types/payr";
import { getToken, setToken } from "./payrTokenStore";

const PAYR_API_URL = process.env.PAYR_API_URL || "https://stage-api.mypayr.co.uk";

export interface PayrUserLoginResponse {
  url: string;
}

async function payrAuthLogin(): Promise<string> {
  const email = process.env.BEST_HOMES_INSTITUTION_EMAIL;
  const password = process.env.BEST_HOMES_INSTITUTION_PASSWORD;
  if (!email || !password) {
    throw new Error("BEST_HOMES_INSTITUTION_EMAIL and BEST_HOMES_INSTITUTION_PASSWORD must be configured");
  }

  const res = await fetch(`${PAYR_API_URL}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Payr auth login failed: ${res.status} ${err}`);
  }

  const data = (await res.json()) as { token?: string };
  if (!data?.token) {
    throw new Error("No token received from Payr auth login");
  }
  return data.token;
}

async function getOrRefreshToken(): Promise<string> {
  let token = getToken();
  if (!token) {
    token = await payrAuthLogin();
    setToken(token);
  }
  return token;
}

async function fetchWithTokenRetry<T>(
  url: string,
  options: RequestInit & { body?: string },
  parseResponse: (res: Response) => Promise<T>
): Promise<T> {
  let token = await getOrRefreshToken();

  const doFetch = (authToken: string) =>
    fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
        Authorization: `Token ${authToken}`,
      },
    });

  let res = await doFetch(token);
  if (res.status === 401) {
    token = await payrAuthLogin();
    setToken(token);
    res = await doFetch(token);
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${url}: ${res.status} ${err}`);
  }

  return parseResponse(res);
}

export async function payrOnboarding(
  payload: PayrOnboardingPayload
): Promise<void> {
  await fetchWithTokenRetry(
    `${PAYR_API_URL}/thirdparty/onboarding/`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    async () => undefined
  );
}

export async function payrUserLogin(
  email: string
): Promise<PayrUserLoginResponse> {
  const raw = await fetchWithTokenRetry<{ url?: string }>(
    `${PAYR_API_URL}/thirdparty/user-login/`,
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
    (res) => res.json()
  );

  let url = raw?.url;
  if (!url || typeof url !== "string") {
    const keys = raw ? Object.keys(raw).join(", ") : "(empty)";
    throw new Error(`Payr user-login missing url. Response keys: ${keys}`);
  }

  url = url.replace(/\/thirdparty(\?|$)/, "/third-party$1");

  return { url };
}
