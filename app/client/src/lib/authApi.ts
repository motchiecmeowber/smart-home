const BASE = `${import.meta.env.VITE_API_URL}/auth`

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((json as { message?: string }).message ?? `HTTP ${res.status}`)
  }
  return json as T
}

export interface LoginPayload {
  identifier: string
  password: string
}

export interface RegisterPayload {
  email: string
  userName: string
  password: string
  firstName: string
  lastName: string
}

export interface UserDto {
  userId: string
  email: string
  username: string
  role: string
  createdAt: string
}

export interface LoginResponseData {
  accessToken: string
  user: UserDto
}

export interface LoginResponse {
  message: string
  data: LoginResponseData
}

export interface RegisterResponse {
  message: string
  data: unknown
}

export interface RefreshResponse {
  accessToken: string
  user: UserDto
}

export async function apiLogin(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',   // receive refreshToken cookie
    body: JSON.stringify(payload),
  })
  return handleResponse<LoginResponse>(res)
}

export async function apiRegister(payload: RegisterPayload): Promise<RegisterResponse> {
  const res = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return handleResponse<RegisterResponse>(res)
}


export async function apiRefreshToken(): Promise<RefreshResponse> {
  const res = await fetch(`${BASE}/refresh-token`, {
    method: 'POST',
    credentials: 'include',
  })
  return handleResponse<RefreshResponse>(res)
}

export async function apiLogout(accessToken: string): Promise<void> {
  await fetch(`${BASE}/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: 'include',
  })
}
