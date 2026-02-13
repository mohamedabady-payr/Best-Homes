import fs from "fs";
import path from "path";

const TOKEN_FILE = ".payr-token.json";

function getTokenPath(): string {
  return path.join(process.cwd(), TOKEN_FILE);
}

interface TokenData {
  token: string;
  updatedAt: string;
}

export function getToken(): string | null {
  try {
    const filePath = getTokenPath();
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw) as TokenData;
    return data?.token ?? null;
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  const filePath = getTokenPath();
  const data: TokenData = {
    token,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}
