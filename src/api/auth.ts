import { client } from './client'
import type { ApiResponse, User } from '../types'

export interface LoginPayload {
  email:    string
  password: string
  'cf-turnstile-response'?: string
}

export interface RegisterPayload {
  email:    string
  password: string
  full_name: string
  'cf-turnstile-response'?: string
}

export interface AuthResponse {
  accessToken: string
  user:        User
}

// ── Email + password ──────────────────────────────────────────
export const login = async (payload: LoginPayload) => {
  const { data } = await client.post<ApiResponse<AuthResponse>>(
    '/auth/login', payload
  )

  console.log(data);
  return data
}

export const register = async (payload: RegisterPayload) => {
  const { data } = await client.post<ApiResponse<{ id: string; email: string }>>(
    '/auth/register', payload
  )
  return data
}

// ── Email verification ────────────────────────────────────────
export const verifyEmail = async (token: string) => {
  const { data } = await client.post<ApiResponse<null>>(
    '/auth/verify-email', { token }
  )
  return data
}

export const resendVerification = async (email: string) => {
  // Backend reuses magic-link/request but routes to verification email
  // for unverified users — or you can hit a dedicated resend endpoint
  const { data } = await client.post<ApiResponse<null>>(
    '/auth/magic-link/request', { email }
  )
  return data
}

// ── Google OAuth ──────────────────────────────────────────────
export const googleLogin = async (idToken: string) => {
  const { data } = await client.post<ApiResponse<AuthResponse>>(
    '/auth/google', { id_token: idToken }
  )
  return data
}

// ── Magic link ────────────────────────────────────────────────
export const requestMagicLink = async (email: string) => {
  const { data } = await client.post<ApiResponse<null>>(
    '/auth/magic-link/request', { email }
  )
  return data
}

export const verifyMagicLink = async (token: string) => {
  const { data } = await client.post<ApiResponse<AuthResponse>>(
    '/auth/magic-link/verify', { token }
  )
  return data
}

export const forgotPassword = async (email: string) => {
  const { data } = await client.post<ApiResponse<null>>(
    '/auth/forgot-password', { email }
  )
  return data
}

export const resetPassword = async (token: string, password: string) => {
  const { data } = await client.post<ApiResponse<null>>(
    '/auth/reset-password', { token, password }
  )
  return data
}

// ── Session ───────────────────────────────────────────────────
export const getMe = async () => {
  const { data } = await client.get<ApiResponse<User>>('/auth/me')
  return data
}

export const logout = async () => {
  const { data } = await client.post<ApiResponse<null>>('/auth/logout')
  return data
}

export const refreshToken = async () => {
  const { data } = await client.post<ApiResponse<{ accessToken: string }>>(
    '/auth/refresh'
  )
  return data
}