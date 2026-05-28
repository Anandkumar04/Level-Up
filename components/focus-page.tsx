'use client'

import { useState, useEffect } from 'react'
import usePlayerStore from '@/game-engine/playerStore'
import { Clock, Play, Square, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FocusPage() {
  const state = usePlayerStore()
  const startFocus = usePlayerStore((s) => s.startFocus)
  const stopFocus = usePlayerStore((s) => s.stopFocus)
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [taskName, setTaskName] = useState('')
  const [showStartModal, setShowStartModal] = useState(false)
  const [now, setNow] = useState(Date.now())

  const featuredSkill = state.skills.find((s) => s.name === 'JavaScript') || state.skills[0]

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartFocus = () => {
    if (selectedSkill && taskName.trim()) {
      startFocus(selectedSkill, taskName.trim())
      setShowStartModal(false)
      setTaskName('')
      setSelectedSkill(null)
    }
  }

  const activeSkill = state.activeFocus?.skillId 
    ? state.skills.find(s => s.id === state.activeFocus!.skillId) 
    : null

  // update clock every second for active focus display
  useEffect(() => {
    if (!state.activeFocus?.isActive || !state.activeFocus.startTime) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [state.activeFocus?.isActive, state.activeFocus?.startTime])

  const elapsedSeconds = state.activeFocus?.startTime ? Math.floor((now - state.activeFocus.startTime) / 1000) : 0

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="px-4 pt-8 pb-6 text-center">
        <h1 className="text-2xl font-bold leading-tight">
          <span className="gradient-text">Focus</span>{' '}
          <span className="gradient-text">And Grow</span>
        </h1>
        <h1 className="text-2xl font-bold gradient-text leading-tight">
          Your Skills
        </h1>
      </div>

      {/* Active Focus Timer */}
      {state.activeFocus?.isActive && activeSkill && (
        <div className="mx-4 mb-5">
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-5 border border-purple-500/30">
            <div className="text-center mb-4">
              <div className="text-sm text-white/60 mb-1">Currently Focusing</div>
              <div className="text-lg font-semibold">{state.activeFocus.taskName}</div>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-sm">{activeSkill.categoryIcon}</span>
                <span className="text-sm text-white/60">{activeSkill.name}</span>
              </div>
            </div>
            <div className="text-5xl font-bold text-center mb-5 font-mono">
              {formatTime(elapsedSeconds)}
            </div>
            <button
              onClick={() => stopFocus(elapsedSeconds)}
              className="w-full py-3 bg-red-500/20 text-red-400 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-500/30 transition-colors active:scale-[0.98]"
            >
              <Square className="w-5 h-5 fill-current" />
              Stop & Save XP
            </button>
            <p className="text-center text-xs text-white/40 mt-3">
              You will earn 1 XP per minute focused
            </p>
          </div>
        </div>
      )}

      {/* Start Focus Button */}
      {!state.activeFocus?.isActive && (
        <div className="mx-4 mb-5">
          <button
            onClick={() => setShowStartModal(true)}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            <Play className="w-5 h-5 fill-current" />
            Start Focus Session
          </button>
        </div>
      )}

      {/* Featured Skill Card */}
      <div className="mx-4 mb-5">
        <div className="bg-card rounded-2xl p-4 border border-white/[0.08]">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xl">{featuredSkill.categoryIcon}</span>
            <div className="flex-1">
              <h3 className="font-semibold text-[15px]">{featuredSkill.name}</h3>
              <span className="text-sm text-white/40">Level {featuredSkill.level}</span>
            </div>
            <span className="text-sm text-white/40">{featuredSkill.totalTime}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-[5px] bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(featuredSkill.currentXP / featuredSkill.maxXP) * 100}%`,
                  backgroundColor: featuredSkill.color,
                }}
              />
            </div>
            <span className="text-[11px] text-white/40 min-w-[60px] text-right">
              {featuredSkill.currentXP} / {featuredSkill.maxXP} XP
            </span>
          </div>
        </div>
      </div>

      {/* Focus Sessions Card */}
      <div className="mx-4">
        <div className="bg-card rounded-3xl p-5 border border-white/[0.08]">
          <h2 className="text-base font-semibold text-center mb-5">Focus</h2>

          {/* Past Focus Sessions */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-white/50" />
              <span className="text-sm font-medium text-white/70">Past Focus Sessions</span>
            </div>

            <div className="space-y-3">
              {state.focusSessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="bg-secondary/60 rounded-2xl p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{session.icon}</span>
                      <span className="font-medium text-[15px]">{session.title}</span>
                    </div>
                    <span className="text-sm text-white/40">{session.duration} mins</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                      style={{ backgroundColor: `${session.skillColor}20` }}
                    >
                      <div
                        className="w-2 h-2 rotate-45"
                        style={{ backgroundColor: session.skillColor }}
                      />
                      <span
                        className="text-xs font-semibold"
                        style={{ color: session.skillColor }}
                      >
                        {session.skillName} +{session.xpGained}XP
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-white/30">{session.date}</span>
                </div>
              ))}

              {state.focusSessions.length === 0 && (
                <div className="text-center py-8 text-white/30">
                  <p>No focus sessions yet.</p>
                  <p className="text-sm mt-1">Start your first session above!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Start Focus Modal */}
      {showStartModal && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center"
          onClick={() => setShowStartModal(false)}
        >
          <div 
            className="w-full max-w-md bg-card rounded-t-3xl p-6 border-t border-white/10 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
            <h2 className="text-xl font-bold text-center mb-6">Start Focus Session</h2>
            
            <div className="mb-5">
              <label className="text-sm text-white/60 mb-2 block">Task Name</label>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="What are you working on?"
                className="w-full bg-secondary rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            <div className="mb-6">
              <label className="text-sm text-white/60 mb-2 block">Select Skill</label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {state.skills.map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => setSelectedSkill(skill.id)}
                    className={cn(
                      "p-3 rounded-xl text-left transition-all",
                      selectedSkill === skill.id
                        ? "bg-purple-500/20 border border-purple-500/50"
                        : "bg-secondary hover:bg-secondary/80"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span>{skill.categoryIcon}</span>
                      <span className="text-sm font-medium truncate">{skill.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowStartModal(false)}
                className="flex-1 py-3 bg-secondary rounded-xl font-semibold hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartFocus}
                disabled={!selectedSkill || !taskName.trim()}
                className={cn(
                  "flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
                  selectedSkill && taskName.trim()
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                )}
              >
                <Play className="w-5 h-5" />
                Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
