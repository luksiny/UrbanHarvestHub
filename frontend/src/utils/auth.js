const ADMIN_TOKEN_KEY = 'uh_admin_token';

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

/** Returns true if token exists and is not expired (with 10s buffer). */
export function isAdminTokenValid() {
  const token = getAdminToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    if (!exp) return true;
    return exp * 1000 > Date.now() + 10000;
  } catch {
    return false;
  }
}
