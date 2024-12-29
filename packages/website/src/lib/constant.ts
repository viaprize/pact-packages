import { env } from '@/env'

export const REDIRECT_TO_AFTER_AUTH = '/prize'
export const NORMIE_TECH_API_KEY =
  typeof window !== 'undefined'
    ? env.NORMIE_TECH_API_KEY
    : env.NEXT_PUBLIC_NORMIE_TECH_URL
export const NORMIE_TECH_URL =
  typeof window !== 'undefined'
    ? env.NORMIE_TECH_URL
    : env.NEXT_PUBLIC_NORMIE_TECH_URL
export const categories = [
  { label: 'Technology', value: 'technology' },
  { label: 'Science', value: 'science' },
  { label: 'Art', value: 'art' },
  { label: 'Literature', value: 'literature' },
  { label: 'Sports', value: 'sports' },
  { label: 'Music', value: 'music' },
  { label: 'Climate Change', value: 'climate_change' },
  { label: 'Network Civilizations', value: 'network_civilizations' },
  { label: 'Open-Source', value: 'open_source' },
  { label: 'Community Coordination', value: 'community_coordination' },
  { label: 'Health', value: 'health' },
  { label: 'Education', value: 'education' },
]
