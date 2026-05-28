import usePlayerStore from './playerStore'

function isoDate(d: Date) { return d.toISOString().slice(0,10) }
function prevDateStr(dateStr: string) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() - 1)
  return isoDate(d)
}

export const streakEngine = {
  recordCompletion() {
    const s = usePlayerStore.getState()
    const today = isoDate(new Date())
    if (!s.completionDates.includes(today)) s.completionDates.push(today)

    // compute daily streak (consecutive days ending today)
    const set = new Set(s.completionDates)
    let streak = 0
    let cursor = today
    while (set.has(cursor)) {
      streak += 1
      cursor = prevDateStr(cursor)
    }
    s.streaks.daily = streak

    // weekly streak: count unique completion dates in last 7 days
    let count = 0
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      if (set.has(isoDate(d))) count++
    }
    s.streaks.weekly = count
  },

  recomputeAll() {
    const s = usePlayerStore.getState()
    const set = new Set(s.completionDates)
    // recompute daily
    const today = isoDate(new Date())
    let streak = 0
    let cursor = today
    while (set.has(cursor)) {
      streak += 1
      cursor = prevDateStr(cursor)
    }
    s.streaks.daily = streak
    // weekly
    let count = 0
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      if (set.has(isoDate(d))) count++
    }
    s.streaks.weekly = count
  }
}

export default streakEngine
