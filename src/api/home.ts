import { client } from './client'
import type { ApiResponse, HomeData } from '../types'

export const getHomeData = async (): Promise<ApiResponse<HomeData>> => {
  const { data } = await client.get('/home')
  return data
}
