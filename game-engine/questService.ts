import usePlayerStore from './playerStore'
import type { Quest } from '@/lib/types'
import { xpEngine } from './xpEngine'
import { streakEngine } from './streakEngine'

export const questService = {
  create(quest: Quest) {
    usePlayerStore.getState().quests.push(quest)
  },
  edit(id: string, patch: Partial<Quest>) {
    const qs = usePlayerStore.getState().quests
    const idx = qs.findIndex(q => q.id === id)
    if (idx >= 0) qs[idx] = { ...qs[idx], ...patch }
  },
  remove(id: string) {
    const s = usePlayerStore.getState()
    s.quests = s.quests.filter(q => q.id !== id)
    s.completedQuests = s.completedQuests.filter(cid => cid !== id)
  },
  complete(id: string) {
    const s = usePlayerStore.getState()
    const q = s.quests.find(q => q.id === id)
    if (!q) return
    if (!s.completedQuests.includes(id)) {
      s.completedQuests.push(id)
      // award XP via engine
      xpEngine.awardXP(q.tokenReward)
      // stat bonuses
      if (q.statBonuses) q.statBonuses.forEach(b => s.stats[b.stat] = (s.stats[b.stat]||0)+b.value)
      // record streaks
      streakEngine.recordCompletion()
    }
  }
}

export default questService
