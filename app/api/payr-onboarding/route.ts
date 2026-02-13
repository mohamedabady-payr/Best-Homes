import { NextRequest, NextResponse } from "next/server";
import { payrOnboarding, payrUserLogin } from "@/lib/payrClient";
import { formatAmountsInPayload } from "@/lib/utils";
import type { PayrOnboardingPayload } from "@/types/payr";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const profile = body.profile as PayrOnboardingPayload | undefined;
    const isOnboardedToPayr = body.isOnboardedToPayr === true;

    if (!profile?.email) {
      return NextResponse.json(
        { error: "Profile required. Please complete your profile first." },
        { status: 400 }
      );
    }

    const normalizedProfile = formatAmountsInPayload({
      ...profile,
      tenant: profile.tenant ?? [],
    }) as PayrOnboardingPayload;

    if (!isOnboardedToPayr) {
      await payrOnboarding(normalizedProfile);
    }

    const userResponse = await payrUserLogin(normalizedProfile.email);

    return NextResponse.json({ url: userResponse.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
