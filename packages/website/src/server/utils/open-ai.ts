import { openai } from '@ai-sdk/openai'
import { embed } from 'ai'

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll('\n', ' ')

  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: input,
  })

  console.log('embedding', embedding)

  return embedding
}

