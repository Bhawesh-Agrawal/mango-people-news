import { client } from './client'

export interface LoginPayload {
  email:    string
  password: string
}

export interface RegisterPayload {
  email:     string
  password:  string
  full_name: string
}

export const login = async (payload: LoginPayload) => {
  const { data } = await client.post('/auth/login', payload)
  return data
}

export const register = async (payload: RegisterPayload) => {
  const { data } = await client.post('/auth/register', payload)
  return data
}

export const logout = async () => {
  const { data } = await client.post('/auth/logout')
  return data
}

export const getMe = async () => {
  const { data } = await client.get('/auth/me')
  return data
}

export const refreshToken = async () => {
  const { data } = await client.post('/auth/refresh')
  return data
}

export const requestMagicLink = async (email: string) => {
  const { data } = await client.post('/auth/magic-link/request', { email })
  return data
}

export const verifyMagicLink = async (token: string) => {
  const { data } = await client.post('/auth/magic-link/verify', { token })
  return data
}

export const googleLogin = async (id_token: string) => {
  const { data } = await client.post('/auth/google', { id_token })
  return data
}