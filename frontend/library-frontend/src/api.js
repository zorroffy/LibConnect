export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export function getToken() {
  return localStorage.getItem("token");
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

export function saveSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export async function api(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running on port 5001?");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
  }

  if (!res.ok) {
    if (res.status === 401 && token && !path.startsWith("/auth/")) {
      clearSession();
      window.location.href = "/login";
    }
    const details = data && data.details ? `: ${data.details.join(", ")}` : "";
    throw new Error(((data && data.error) || `Request failed (${res.status})`) + details);
  }
  return data;
}
