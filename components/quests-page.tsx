'use client'

import { useState } from 'react'
import usePlayerStore from '@/game-engine/playerStore'
import questService from '@/game-engine/questService'
import { journeys } from '@/lib/data'
import { Clock, Plus, RefreshCw, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const difficultyStyles: Record<string, { bg: string; text: string }> = {
  Trivial: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  Easy: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  Medium: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  Hard: { bg: 'bg-red-500/20', text: 'text-red-400' },
}

export function QuestsPage() {
  const [filter, setFilter] = useState<'Completed' | 'Not Completed'>('Not Completed')
  const quests = usePlayerStore((s) => s.quests)
  const completedIds = usePlayerStore((s) => s.completedQuests)

  const completedQuests = quests.filter((q) => completedIds.includes(q.id))
  const notCompletedQuests = quests.filter((q) => !completedIds.includes(q.id))
  const displayedQuests = filter === 'Completed' ? completedQuests : notCompletedQuests

  const totalQuests = quests.length || 1
  const completedCount = completedQuests.length
  const progress = (completedCount / totalQuests) * 100

  // Group quests by journey
  const questsByJourney = displayedQuests.reduce((acc, quest) => {
    const journey = journeys.find((j) => j.id === quest.journeyId)
    if (journey) {
      if (!acc[journey.id]) acc[journey.id] = { journey, quests: [] }
      acc[journey.id].quests.push(quest)
    }
    return acc
  }, {} as Record<string, { journey: (typeof journeys)[0]; quests: typeof quests }>)

  const today = new Date()
  const dayName = today.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
  const dayNum = today.getDate()

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="px-4 pt-8 pb-4 text-center">
        <h1 className="text-2xl font-bold gradient-text leading-tight">
          Complete Quests
        </h1>
        <h1 className="text-2xl font-bold gradient-text-warm leading-tight">
          and Earn Rewards
        </h1>
      </div>

      {/* Date and Title Header */}
      <div className="px-4 pt-4 pb-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex flex-col">
            <span className="text-red-400 text-[11px] font-semibold uppercase">{dayName}</span>
            <span className="text-xl font-bold">{dayNum}</span>
          </div>
          <h2 className="text-lg font-semibold">Quest</h2>
            <div className="flex items-center gap-1">
              <button className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors">
                <Clock className="w-5 h-5 text-white/50" />
              </button>
              <button
                onClick={() => {
                  // open add-quest modal — placeholder for now
                }}
                className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
              >
                <Plus className="w-5 h-5 text-white/50" />
              </button>
            </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-secondary rounded-xl p-1 mb-5">
          <button
            onClick={() => setFilter('Completed')}
            className={cn(
              'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all',
              filter === 'Completed'
                ? 'bg-accent text-white'
                : 'text-white/40'
            )}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('Not Completed')}
            className={cn(
              'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all',
              filter === 'Not Completed'
                ? 'bg-accent text-white'
                : 'text-white/40'
            )}
          >
            Not Completed
          </button>
        </div>

        {/* Progress Card */}
        <div className="bg-card rounded-2xl p-4 border border-white/[0.08]">
          <h3 className="font-semibold text-[15px] mb-2">Progress of Today</h3>
          <div className="w-full h-1 bg-secondary rounded-full overflow-hidden mb-2">
            <div
              className="h-full progress-pink rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm text-white/40">
            <span>{completedCount} Completed, {totalQuests - completedCount} left</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Simple Quest List (temporary) */}
      <div className="px-4">
        {displayedQuests.map((q) => (
          <div key={q.id} className="bg-card rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">{q.icon}</span>
                <span className="font-medium">{q.title}</span>
              </div>
              <button
                onClick={() => questService.complete(q.id)}
                className="px-3 py-1 bg-white text-black rounded-md text-sm"
              >
                Complete
              </button>
            </div>
          </div>
        ))}
        {displayedQuests.length === 0 && (
          <div className="text-center py-12 text-white/30">
            {filter === 'Completed' ? (
              <p>No completed quests yet. Get started!</p>
            ) : (
              <p>All quests completed! Great job!</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
