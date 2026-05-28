// Types for the Life Leveling App

export interface Attribute {
  name: string
  value: number
  maxValue?: number
}

export interface Skill {
  id: string
  name: string
  category: string
  categoryIcon: string
  level: number
  currentXP: number
  maxXP: number
  totalTime: string
  color: string
}

export interface Quest {
  id: string
  title: string
  icon: string
  difficulty: 'Trivial' | 'Easy' | 'Medium' | 'Hard'
  frequency: 'Daily' | 'Weekly' | 'Monthly'
  tokenReward: number
  statBonuses?: { stat: string; value: number }[]
  journeyId: string
  completed: boolean
}

export interface Milestone {
  id: string
  title: string
  icon: string
  daysLeft: number
  type: 'Major' | 'Minor'
  gemReward: number
  status: 'In Progress' | 'Completed' | 'Not Started'
  journeyId: string
}

export interface Journey {
  id: string
  title: string
  icon: string
  description: string
  category: string
  categoryColor: string
  startDate: string
  milestonesCount: number
  questsCount: number
}

export interface StoreItem {
  id: string
  name: string
  icon: string
  category: 'Equipment' | 'Trip' | 'Experience' | 'Food'
  price: number
  currency: 'gem' | 'token'
  purchased: boolean
}

export interface FocusSession {
  id: string
  title: string
  icon: string
  skillName: string
  skillColor: string
  xpGained: number
  duration: number
  date: string
}

export interface UserStats {
  gems: number
  tokens: number
  level: number
  attributes: Attribute[]
}
