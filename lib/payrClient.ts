import type { PayrOnboardingPayload } from "@/types/payr";

const PAYR_API_URL = process.env.PAYR_API_URL || "https://stage-api.mypayr.co.uk";

const PAYR_INSTITUTION_TOKEN =
  process.env.PAYR_INSTITUTION_TOKEN ||
  "98c6a4aef960545415ff6d499f0b008508c820bee807c2d79e6d83d09cb79b4d";

export interface PayrUserLoginResponse {
  url: string;
}

function getToken(): string {
  if (!PAYR_INSTITUTION_TOKEN) {
    throw new Error("PAYR_INSTITUTION_TOKEN must be configured");
  }
  return PAYR_INSTITUTION_TOKEN;
}

async function fetchWithTokenRetry<T>(
  url: string,
  options: RequestInit & { body?: string },
  parseResponse: (res: Response) => Promise<T>
): Promise<T> {
  const token = getToken();
console.log("Authorization", `Token ${token}`,)
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

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
