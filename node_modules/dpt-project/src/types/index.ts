export interface Score {
  id: string
  score: number
  grade: 'A'|'B'|'C'|'D'|'F'
  profileComplete: number
  postFreq: number
  engagement: number
  responsiveness: number
  platformCount: number
  platforms: string[]
  dataSource: 'auto'|'manual'|'hybrid'
  calculatedAt: string
}

export interface Recommendation {
  id: string
  icon: string
  priority: 'high'|'mid'|'low'
  titleEn: string
  titleSw: string
  descEn: string
  descSw: string
}

export interface User {
  id: string
  name: string
  email: string
  businessName: string
  sector: string
  location: string
  language: 'en'|'sw'
  plan: 'free'|'pro'
}

export interface PlatformStatus {
  platform: 'facebook'|'instagram'|'google'
  connected: boolean
  lastSynced?: string
}

export type Lang = 'en' | 'sw'