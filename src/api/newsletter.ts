import { client } from './client'

export const subscribeNewsletter = async (
  email:      string,
  full_name?: string
): Promise<{ success: boolean; message: string }> => {
  const { data } = await client.post('/newsletter/subscribe', {
    email,
    full_name,
    source: 'homepage',
  })
  return data
}

export const subscribeNewsletterFooter = async (
  email:      string,
  full_name?: string
): Promise<{ success: boolean; message: string }> => {
  const { data } = await client.post('/newsletter/subscribe', {
    email,
    full_name,
    source: 'footer',
  })
  return data
}