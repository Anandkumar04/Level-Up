'use client'

import { useState } from 'react'
import usePlayerStore from '@/game-engine/playerStore'
import questService from '@/game-engine/questService'
import { journeys } from '@/lib/data'
import { ChevronDown, MoreHorizontal, RefreshCw, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface JourneyDetailModalProps {
  journey: (typeof journeys)[0] | null
  onClose: () => void
}

const difficultyStyles: Record<string, { bg: string; text: string }> = {
  Trivial: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  Easy: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  Medium: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  Hard: { bg: 'bg-red-500/20', text: 'text-red-400' },
}

function JourneyDetailModal({ journey, onClose }: JourneyDetailModalProps) {
  const milestones = usePlayerStore((s) => s.milestones)
  const quests = usePlayerStore((s) => s.quests)
  const completeMilestone = usePlayerStore((s) => s.completeMilestone)
  
  if (!journey) return null

  const journeyMilestones = milestones.filter((m) => m.journeyId === journey.id)
  const journeyQuests = quests.filter((q) => q.journeyId === journey.id)

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-end"
      onClick={onClose}
    >
      <div
        className="w-full bg-card rounded-t-[2rem] max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar and header */}
        <div className="sticky top-0 bg-card pt-3 pb-3 px-4 border-b border-white/[0.08] z-10">
          <div className="flex items-center justify-center mb-3">
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronDown className="w-6 h-6 text-white/50" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Journey Detail</h2>
            <button className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors">
              <MoreHorizontal className="w-5 h-5 text-white/50" />
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* Journey Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{journey.icon}</span>
              <h3 className="text-lg font-semibold">{journey.title}</h3>
            </div>
            <p className="text-sm text-white/40 mb-3">
              {journey.milestonesCount} Milestones, {journey.questsCount} Quests
            </p>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-secondary rounded-lg">
                <span className="text-xs">📅</span>
                <span className="text-xs text-white/60">
                  Since {new Date(journey.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <span
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                style={{
                  backgroundColor: `${journey.categoryColor}20`,
                  color: journey.categoryColor,
                }}
              >
                {journey.category}
              </span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed italic">
              {journey.description}
            </p>
          </div>

          {/* Milestones Section */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-white/70 mb-3">Milestones</h4>
            <div className="space-y-3">
              {journeyMilestones.map((milestone) => (
                <div 
                  key={milestone.id} 
                  className={cn(
                    "bg-secondary/60 rounded-2xl p-4 transition-all",
                    milestone.status === 'Completed' && "bg-emerald-500/10 border border-emerald-500/30"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span>{milestone.icon}</span>
                        <span className={cn(
                          "font-medium",
                          milestone.status === 'Completed' && "line-through text-white/50"
                        )}>{milestone.title}</span>
                      </div>
                      <span className="text-xs text-white/40">
                        {milestone.status === 'Completed' ? 'Completed!' : `In ${milestone.daysLeft} days`}
                      </span>
                    </div>
                    {milestone.status !== 'Completed' ? (
                      <button
                        onClick={() => completeMilestone(milestone.id)}
                        className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-500/30 transition-colors active:scale-95"
                      >
                        Complete
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Done
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-semibold',
                        milestone.type === 'Major'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-white/10 text-white/40'
                      )}
                    >
                      {milestone.type}
                    </span>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/30 rounded-lg">
                      <span className="text-xs">💎</span>
                      <span className="text-xs text-white/60">x {milestone.gemReward}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quests Section */}
          <div className="pb-8">
            <h4 className="text-sm font-semibold text-white/70 mb-3">Quests</h4>
            <div className="space-y-3">
              {journeyQuests.map((quest) => (
                <div 
                  key={quest.id} 
                  className={cn(
                    "bg-secondary/60 rounded-2xl p-4 transition-all",
                    quest.completed && "bg-emerald-500/10 border border-emerald-500/30"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span>{quest.icon}</span>
                      <span className={cn(
                        "font-medium",
                        quest.completed && "line-through text-white/50"
                      )}>{quest.title}</span>
                    </div>
                    {!quest.completed && (
                      <button
                        onClick={() => questService.complete(quest.id)}
                        className="px-3 py-1.5 bg-white text-black rounded-lg text-xs font-semibold hover:bg-white/90 transition-colors active:scale-95"
                      >
                        Complete
                      </button>
                    )}
                    {quest.completed && (
                      <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Done
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-semibold',
                        difficultyStyles[quest.difficulty].bg,
                        difficultyStyles[quest.difficulty].text
                      )}
                    >
                      {quest.difficulty}
                    </span>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/30 rounded-lg">
                      <RefreshCw className="w-3 h-3 text-white/40" />
                      <span className="text-xs text-white/60">{quest.frequency}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/30 rounded-lg">
                      <span className="text-xs">🪙</span>
                      <span className="text-xs text-white/60">x {quest.tokenReward}</span>
                    </div>
                  </div>
                  {quest.statBonuses && quest.statBonuses.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {quest.statBonuses.map((bonus, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 rounded-lg"
                        >
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-xs font-medium text-emerald-400">
                            {bonus.stat} + {bonus.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function JourneyPage() {
  const milestones = usePlayerStore((s) => s.milestones)
  const quests = usePlayerStore((s) => s.quests)
  const [selectedJourney, setSelectedJourney] = useState<(typeof journeys)[0] | null>(null)

  const getDaysSinceStart = (startDate: string) => {
    const start = new Date(startDate)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="px-4 pt-8 pb-6 text-center">
        <h1 className="text-2xl font-bold gradient-text leading-tight">
          Turn Goals into
        </h1>
        <h1 className="text-2xl font-bold gradient-text leading-tight">
          Milestones, Then
        </h1>
        <h1 className="text-2xl font-bold gradient-text leading-tight">
          Conquer Quests
        </h1>
      </div>

      {/* Journey Section */}
      <div className="px-4 mb-5">
        <h2 className="text-[11px] uppercase tracking-wider text-white/40 font-medium mb-3">
          Journey
        </h2>
        {journeys.slice(0, 1).map((journey) => (
          <div
            key={journey.id}
            className="bg-card rounded-2xl p-4 border border-white/[0.08] cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => setSelectedJourney(journey)}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{journey.icon}</span>
              <span className="font-semibold">{journey.title}</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-white/40">
                {getDaysSinceStart(journey.startDate)} days since start
              </span>
              <span
                className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                style={{
                  backgroundColor: `${journey.categoryColor}20`,
                  color: journey.categoryColor,
                }}
              >
                {journey.category}
              </span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              {journey.description}
            </p>
          </div>
        ))}
      </div>

      {/* Milestone Section */}
      <div className="px-4 mb-5">
        <h2 className="text-[11px] uppercase tracking-wider text-white/40 font-medium mb-3">
          Milestone
        </h2>
        {milestones
          .filter((m) => m.status === 'In Progress')
          .slice(0, 1)
          .map((milestone) => (
            <div
              key={milestone.id}
              className="bg-card rounded-2xl p-4 border border-white/[0.08]"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{milestone.icon}</span>
                  <span className="font-semibold">{milestone.title}</span>
                </div>
                <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-semibold">
                  {milestone.status}
                </span>
              </div>
              <p className="text-sm text-white/40 mb-3">In {milestone.daysLeft} days</p>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold">
                  {milestone.type}
                </span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary rounded-lg">
                  <span className="text-xs">💎</span>
                  <span className="text-xs text-white/60">x {milestone.gemReward}</span>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Quests Section */}
      <div className="px-4">
        <h2 className="text-[11px] uppercase tracking-wider text-white/40 font-medium mb-3">
          Quests
        </h2>
        {quests
          .filter((q) => !q.completed)
          .slice(0, 1)
          .map((quest) => (
            <div
              key={quest.id}
              className="bg-card rounded-2xl p-4 border border-white/[0.08]"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{quest.icon}</span>
                <span className="font-semibold">{quest.title}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-semibold',
                    difficultyStyles[quest.difficulty].bg,
                    difficultyStyles[quest.difficulty].text
                  )}
                >
                  {quest.difficulty}
                </span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary rounded-lg">
                  <RefreshCw className="w-3 h-3 text-white/40" />
                  <span className="text-xs text-white/60">{quest.frequency}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary rounded-lg">
                  <span className="text-xs">🪙</span>
                  <span className="text-xs text-white/60">x {quest.tokenReward}</span>
                </div>
              </div>
              {quest.statBonuses && quest.statBonuses.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {quest.statBonuses.map((bonus, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/15 rounded-lg"
                    >
                      <div className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span className="text-xs font-medium text-cyan-400">
                        {bonus.stat} + {bonus.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Journey Detail Modal */}
      {selectedJourney && (
        <JourneyDetailModal
          journey={selectedJourney}
          onClose={() => setSelectedJourney(null)}
        />
      )}
    </div>
  )
}
