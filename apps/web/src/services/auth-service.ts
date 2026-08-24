import { api } from '@/lib/api';

// Staff auth
export async function loginStaff(email: string, password: string) {
  const { data } = await api.post<{ accessToken: string }>('/auth/login', { email, password });
  return data;
}

export async function logoutStaff() {
  await api.post('/auth/logout');
}

// Member OTP auth
/**
 * Request 6-digit OTP for the given email address.
 * Returns 204 — no response body.
 */
export async function requestMemberOtp(identifier: string): Promise<void> {
  await api.post('/auth/otp/request', { identifier });
}

/**
 * Verify the OTP code for the given identifier.
 * Returns an access token on success.
 */
export async function verifyMemberOtp(
  identifier: string,
  code: string,
): Promise<{ accessToken: string }> {
  const { data } = await api.post<{ accessToken: string }>('/auth/otp/verify', {
    identifier,
    code,
  });
  return data;
}
