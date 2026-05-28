'use client'

import usePlayerStore from '@/game-engine/playerStore'
import { MoreHorizontal } from 'lucide-react'

export function CharacterPage() {
  const state = usePlayerStore()

  // Group skills by category
  const skillsByCategory = state.skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = {
          icon: skill.categoryIcon,
          skills: [],
          totalLevel: 0,
        }
      }
      acc[skill.category].skills.push(skill)
      acc[skill.category].totalLevel = Math.max(
        acc[skill.category].totalLevel,
        skill.level
      )
      return acc
    },
    {} as Record<string, { icon: string; skills: typeof state.skills; totalLevel: number }>
  )

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="px-4 pt-8 pb-4 text-center">
        <h2 className="text-lg font-semibold gradient-text mb-2">
          Track Your Skills
        </h2>
        <h3 className="text-lg font-semibold gradient-text mb-4">
          and Attributes
        </h3>
        <h1 className="text-6xl font-bold gradient-text-silver tracking-tight">
          Level Up
        </h1>
        <div className="mt-2 text-white/40 text-sm">Level {state.level}</div>
      </div>

      {/* Character Card */}
      <div className="mx-4 bg-card rounded-3xl p-5 border border-white/[0.08]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold tracking-wide">Character</h2>
          <button className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors">
            <MoreHorizontal className="w-5 h-5 text-white/50" />
          </button>
        </div>

        {/* Attributes Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-white/50" />
            <span className="text-sm font-medium text-white/70">Attributes</span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {state.attributes.map((attr) => (
              <div
                key={attr.name}
                className="bg-secondary/80 rounded-2xl py-4 px-2 text-center"
              >
                <div className="text-2xl font-bold mb-0.5">{attr.value}</div>
                <div className="text-[9px] uppercase tracking-widest text-white/40 font-medium">
                  {attr.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3.5 h-3.5 rotate-45 border-2 border-white/50" />
            <span className="text-sm font-medium text-white/70">Skills</span>
          </div>

          <div className="space-y-5">
            {Object.entries(skillsByCategory).map(([category, data]) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{data.icon}</span>
                    <span className="text-[11px] uppercase tracking-wider text-white/40 font-medium">
                      {category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <span>Level {data.totalLevel}</span>
                  </div>
                </div>
                {data.skills.map((skill) => (
                  <div key={skill.id} className="mb-3 last:mb-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <span className="text-xs text-white/40">{skill.totalTime}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-[5px] bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(skill.currentXP / skill.maxXP) * 100}%`,
                            backgroundColor: skill.color,
                          }}
                        />
                      </div>
                      <span className="text-[11px] text-white/40 min-w-[60px] text-right">
                        {skill.currentXP} / {skill.maxXP} XP
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
