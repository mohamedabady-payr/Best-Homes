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

  const payload = { email, password };
  console.log("[payr] POST /auth/login/ request:", { ...payload, password: "***" });

  const res = await fetch(`${PAYR_API_URL}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const resText = await res.text();
  if (!res.ok) {
    console.log("[payr] POST /auth/login/ response:", res.status, resText);
    throw new Error(`Payr auth login failed: ${res.status} ${resText}`);
  }

  const data = JSON.parse(resText) as { token?: string };
  console.log("[payr] POST /auth/login/ response:", res.status, { token: data?.token ? `${data.token.slice(0, 8)}...` : data });
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
  console.log("[payr] POST /thirdparty/onboarding/ request:", JSON.stringify(payload, null, 2));

  await fetchWithTokenRetry(
    `${PAYR_API_URL}/thirdparty/onboarding/`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    async (res) => {
      const text = await res.text();
      console.log("[payr] POST /thirdparty/onboarding/ response:", res.status, text || "(empty body)");
      return undefined;
    }
  );
}

export async function payrUserLogin(
  email: string
): Promise<PayrUserLoginResponse> {
  const payload = { email };
  console.log("[payr] POST /thirdparty/user-login/ request:", payload);

  const raw = await fetchWithTokenRetry<{ url?: string }>(
    `${PAYR_API_URL}/thirdparty/user-login/`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    async (res) => {
      const data = await res.json();
      console.log("[payr] POST /thirdparty/user-login/ response:", res.status, JSON.stringify(data));
      return data;
    }
  );

  let url = raw?.url;
  if (!url || typeof url !== "string") {
    const keys = raw ? Object.keys(raw).join(", ") : "(empty)";
    throw new Error(`Payr user-login missing url. Response keys: ${keys}`);
  }

  url = url.replace(/\/thirdparty(\?|$)/, "/third-party$1");

  return { url };
}
