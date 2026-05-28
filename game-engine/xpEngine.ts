import usePlayerStore from './playerStore'

export const xpEngine = {
  awardXP(amount: number) {
    const s = usePlayerStore.getState()
    s.totalXP += amount
    // roll levels
    while (s.totalXP >= levelToXP(s.level)) {
      s.totalXP -= levelToXP(s.level)
      s.level += 1
      // on level up: grant skill point
      s.skillPoints += 1
    }
    s.rank = levelToRank(s.level)
  }
}

function levelToXP(level:number){ return 100 * Math.pow(1.2, level-1) }
function levelToRank(level:number){
  if (level >= 50) return 'S'
  if (level >= 30) return 'A'
  if (level >= 20) return 'B'
  if (level >= 10) return 'C'
  if (level >= 5) return 'D'
  return 'E'
}

export default xpEngine
