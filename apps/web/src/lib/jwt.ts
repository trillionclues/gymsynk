import type { SessionUser, UserRole } from '@/stores/authStore';

type JwtPayload = {
  sub: string;
  role: UserRole;
  orgId: string;
};

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return atob(padded);
}

export function decodeSessionUser(token: string, email: string | null): SessionUser {
  const payload = token.split('.')[1];
  if (!payload) {
    throw new Error('Invalid access token');
  }

  const claims = JSON.parse(base64UrlDecode(payload)) as JwtPayload;
  return {
    id: claims.sub,
    email,
    role: claims.role,
    orgId: claims.orgId,
  };
}
