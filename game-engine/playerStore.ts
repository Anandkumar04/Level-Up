import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Skill, Quest, Attribute } from '@/lib/types'
import { skills as initialSkills, quests as initialQuests, userStats, milestones as initialMilestones, storeItems as initialStoreItems, focusSessions as initialFocusSessions } from '@/lib/data'

export type PlayerState = {
  id: string | null
  level: number
  totalXP: number
  rank: string
  stats: Record<string, number>
  streaks: { daily: number; weekly: number; focus: number }
  achievements: string[]
  inventory: { [id: string]: number }
  completedQuests: string[]
  activeQuests: string[]
  energy: number
  focusPoints: number
  skillPoints: number
  dailyProgress: number
  weeklyProgress: number
  skills: Skill[]
  focusSessions: import('@/lib/types').FocusSession[]
  activeFocus: {
    isActive: boolean
    skillId: string | null
    taskName: string
    startTime: number | null
    elapsedSeconds: number
  } | null
  quests: Quest[]
  attributes: Attribute[]
}

export const usePlayerStore = create(immer<PlayerState>((set, get) => ({
  id: null,
  level: 1,
  totalXP: 0,
  rank: 'E',
  stats: {
    Strength: 1,
    Discipline: 1,
    Focus: 1,
    Intelligence: 1,
    Creativity: 1,
    Endurance: 1,
    Charisma: 1,
    Agility: 1,
  },
  streaks: { daily: 0, weekly: 0, focus: 0 },
  completionDates: [],
  achievements: [],
  inventory: {},
  completedQuests: [],
  activeQuests: [],
  energy: 100,
  focusPoints: 100,
  skillPoints: 0,
  dailyProgress: 0,
  weeklyProgress: 0,
  skills: initialSkills,
  quests: initialQuests,
  attributes: userStats.attributes,
  gems: userStats.gems,
  tokens: userStats.tokens,
  milestones: initialMilestones,
  storeItems: initialStoreItems,
  focusSessions: initialFocusSessions,
  quests: [],
  attributes: [],
  // actions
  addXP: (xp: number) => {
    set((state) => {
      state.totalXP += xp
      // simple level calc
      while (state.totalXP >= levelToXP(state.level)) {
        state.totalXP -= levelToXP(state.level)
        state.level += 1
      }
      state.rank = levelToRank(state.level)
    })
  },
  addQuest: (q: Quest) => set((s) => { s.quests.push(q) }),
  completeQuestById: (id: string) => set((s) => {
    const q = s.quests.find((x) => x.id === id)
    if (!q) return
    if (!s.completedQuests.includes(id)) {
      s.completedQuests.push(id)
      // rewards
      s.totalXP += q.tokenReward
      // stat bonuses
      if (q.statBonuses) {
        q.statBonuses.forEach(b => {
          s.stats[b.stat] = (s.stats[b.stat] || 0) + b.value
        })
      }
      // record completion date
      const today = new Date().toISOString().slice(0,10)
      if (!s.completionDates.includes(today)) s.completionDates.push(today)
    }
  }),
  purchaseItem: (itemId: string) => set((s) => {
    const item = s.storeItems.find(i => i.id === itemId)
    if (!item || item.purchased) return
    const currency = item.currency === 'gem' ? 'gems' : 'tokens'
    if ((s as any)[currency] < item.price) return
    ;(s as any)[currency] -= item.price
    item.purchased = true
    s.inventory[itemId] = (s.inventory[itemId] || 0) + 1
  }),
  completeMilestone: (id: string) => set((s) => {
    const m = s.milestones.find(ms => ms.id === id)
    if (!m || m.status === 'Completed') return
    m.status = 'Completed'
    s.gems += m.gemReward
  }),
  startFocus: (skillId: string, taskName: string) => set((s) => {
    s.activeFocus = {
      isActive: true,
      skillId,
      taskName,
      startTime: Date.now(),
      elapsedSeconds: 0,
    }
  }),
  stopFocus: (elapsedSeconds?: number) => set((s) => {
    if (!s.activeFocus || !s.activeFocus.skillId) return

    const skill = s.skills.find((sk) => sk.id === s.activeFocus!.skillId)
    if (!skill) { s.activeFocus = null; return }

    const usedSeconds = typeof elapsedSeconds === 'number' ? elapsedSeconds : s.activeFocus.elapsedSeconds
    const minutesElapsed = Math.floor((usedSeconds || 0) / 60)
    const xpGained = Math.max(1, minutesElapsed)

    const newSession = {
      id: Date.now().toString(),
      title: s.activeFocus.taskName,
      icon: skill.categoryIcon,
      skillName: skill.name,
      skillColor: skill.color,
      xpGained,
      duration: minutesElapsed,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }),
    }

    // update skill xp/levels
    let newCurrentXP = skill.currentXP + xpGained
    let newLevel = skill.level
    let newMaxXP = skill.maxXP
    while (newCurrentXP >= newMaxXP) {
      newCurrentXP -= newMaxXP
      newLevel++
      newMaxXP = Math.floor(newMaxXP * 1.5)
    }

    skill.currentXP = newCurrentXP
    skill.level = newLevel
    skill.maxXP = newMaxXP
    skill.totalTime = `${parseInt(skill.totalTime || '0') + minutesElapsed}m`

    s.focusSessions.unshift(newSession as any)
    s.totalXP += xpGained
    s.level = Math.floor(s.totalXP / 100) + 1
    s.activeFocus = null
  }),
})))

function levelToXP(level: number) {
  return 100 * Math.pow(1.2, level - 1)
}

function levelToRank(level: number) {
  if (level >= 50) return 'S'
  if (level >= 30) return 'A'
  if (level >= 20) return 'B'
  if (level >= 10) return 'C'
  if (level >= 5) return 'D'
  return 'E'
}

export default usePlayerStore
