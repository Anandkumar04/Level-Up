import { streakEngine } from './streakEngine'
import usePlayerStore from './playerStore'

let dailyTimer: any = null

function msToNextMidnight() {
  const now = new Date()
  const next = new Date(now)
  next.setDate(now.getDate() + 1)
  next.setHours(0,0,5,0) // a few seconds after midnight
  return next.getTime() - now.getTime()
}

export function startResetScheduler() {
  // schedule first run
  const delay = msToNextMidnight()
  dailyTimer = setTimeout(() => {
    runDailyReset()
    // then schedule every 24h
    dailyTimer = setInterval(runDailyReset, 24 * 60 * 60 * 1000)
  }, delay)
}

export function stopResetScheduler() {
  if (dailyTimer) clearTimeout(dailyTimer)
}

function runDailyReset() {
  const s = usePlayerStore.getState()
  // recompute streaks (handles missed days)
  streakEngine.recomputeAll()
  // reset daily progress/energy
  s.dailyProgress = 0
  s.energy = Math.min(100, s.energy + 20)
  // weekly reset logic on Mondays
  const today = new Date()
  if (today.getDay() === 1) {
    s.weeklyProgress = 0
  }
}

export default { startResetScheduler, stopResetScheduler }
