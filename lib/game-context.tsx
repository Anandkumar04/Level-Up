'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import type { Quest, Skill, StoreItem, FocusSession, Attribute, Milestone } from './types'
import {
  quests as initialQuests,
  skills as initialSkills,
  storeItems as initialStoreItems,
  focusSessions as initialFocusSessions,
  userStats as initialUserStats,
  milestones as initialMilestones,
} from './data'

interface GameState {
  gems: number
  tokens: number
  level: number
  totalXP: number
  attributes: Attribute[]
  skills: Skill[]
  quests: Quest[]
  milestones: Milestone[]
  storeItems: StoreItem[]
  focusSessions: FocusSession[]
  activeFocus: {
    isActive: boolean
    skillId: string | null
    taskName: string
    startTime: number | null
    elapsedSeconds: number
  } | null
}

type GameAction =
  | { type: 'COMPLETE_QUEST'; questId: string }
  | { type: 'UNCOMPLETE_QUEST'; questId: string }
  | { type: 'PURCHASE_ITEM'; itemId: string }
  | { type: 'START_FOCUS'; skillId: string; taskName: string }
  | { type: 'STOP_FOCUS' }
  | { type: 'UPDATE_FOCUS_TIME'; elapsedSeconds: number }
  | { type: 'ADD_XP_TO_SKILL'; skillId: string; xp: number }
  | { type: 'ADD_QUEST'; quest: Quest }
  | { type: 'ADD_STORE_ITEM'; item: StoreItem }
  | { type: 'COMPLETE_MILESTONE'; milestoneId: string }
  | { type: 'LOAD_STATE'; state: GameState }

const initialState: GameState = {
  gems: initialUserStats.gems,
  tokens: initialUserStats.tokens,
  level: initialUserStats.level,
  totalXP: 0,
  attributes: initialUserStats.attributes,
  skills: initialSkills,
  quests: initialQuests,
  milestones: initialMilestones,
  storeItems: initialStoreItems,
  focusSessions: initialFocusSessions,
  activeFocus: null,
}

function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / 100) + 1
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'COMPLETE_QUEST': {
      const quest = state.quests.find((q) => q.id === action.questId)
      if (!quest || quest.completed) return state

      let newAttributes = [...state.attributes]
      if (quest.statBonuses) {
        quest.statBonuses.forEach((bonus) => {
          newAttributes = newAttributes.map((attr) =>
            attr.name.toLowerCase() === bonus.stat.toLowerCase()
              ? { ...attr, value: attr.value + bonus.value }
              : attr
          )
        })
      }

      const newTotalXP = state.totalXP + quest.tokenReward

      return {
        ...state,
        tokens: state.tokens + quest.tokenReward,
        totalXP: newTotalXP,
        level: calculateLevel(newTotalXP),
        attributes: newAttributes,
        quests: state.quests.map((q) =>
          q.id === action.questId ? { ...q, completed: true } : q
        ),
      }
    }

    case 'UNCOMPLETE_QUEST': {
      const quest = state.quests.find((q) => q.id === action.questId)
      if (!quest || !quest.completed) return state

      return {
        ...state,
        quests: state.quests.map((q) =>
          q.id === action.questId ? { ...q, completed: false } : q
        ),
      }
    }

    case 'PURCHASE_ITEM': {
      const item = state.storeItems.find((i) => i.id === action.itemId)
      if (!item || item.purchased) return state

      const currency = item.currency === 'gem' ? 'gems' : 'tokens'
      if (state[currency] < item.price) return state

      return {
        ...state,
        [currency]: state[currency] - item.price,
        storeItems: state.storeItems.map((i) =>
          i.id === action.itemId ? { ...i, purchased: true } : i
        ),
      }
    }

    case 'START_FOCUS': {
      return {
        ...state,
        activeFocus: {
          isActive: true,
          skillId: action.skillId,
          taskName: action.taskName,
          startTime: Date.now(),
          elapsedSeconds: 0,
        },
      }
    }

    case 'UPDATE_FOCUS_TIME': {
      if (!state.activeFocus) return state
      return {
        ...state,
        activeFocus: {
          ...state.activeFocus,
          elapsedSeconds: action.elapsedSeconds,
        },
      }
    }

    case 'STOP_FOCUS': {
      if (!state.activeFocus || !state.activeFocus.skillId) return state

      const skill = state.skills.find((s) => s.id === state.activeFocus!.skillId)
      if (!skill) return { ...state, activeFocus: null }

      const minutesElapsed = Math.floor(state.activeFocus.elapsedSeconds / 60)
      const xpGained = Math.max(1, minutesElapsed)

      const newSession: FocusSession = {
        id: Date.now().toString(),
        title: state.activeFocus.taskName,
        icon: skill.categoryIcon,
        skillName: skill.name,
        skillColor: skill.color,
        xpGained,
        duration: minutesElapsed,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      }

      let newCurrentXP = skill.currentXP + xpGained
      let newLevel = skill.level
      let newMaxXP = skill.maxXP

      while (newCurrentXP >= newMaxXP) {
        newCurrentXP -= newMaxXP
        newLevel++
        newMaxXP = Math.floor(newMaxXP * 1.5)
      }

      const newTotalTime = parseInt(skill.totalTime) + minutesElapsed

      return {
        ...state,
        activeFocus: null,
        skills: state.skills.map((s) =>
          s.id === state.activeFocus!.skillId
            ? {
                ...s,
                currentXP: newCurrentXP,
                level: newLevel,
                maxXP: newMaxXP,
                totalTime: `${newTotalTime}m`,
              }
            : s
        ),
        focusSessions: [newSession, ...state.focusSessions],
        totalXP: state.totalXP + xpGained,
        level: calculateLevel(state.totalXP + xpGained),
      }
    }

    case 'ADD_XP_TO_SKILL': {
      return {
        ...state,
        skills: state.skills.map((s) => {
          if (s.id !== action.skillId) return s
          
          let newCurrentXP = s.currentXP + action.xp
          let newLevel = s.level
          let newMaxXP = s.maxXP

          while (newCurrentXP >= newMaxXP) {
            newCurrentXP -= newMaxXP
            newLevel++
            newMaxXP = Math.floor(newMaxXP * 1.5)
          }

          return { ...s, currentXP: newCurrentXP, level: newLevel, maxXP: newMaxXP }
        }),
      }
    }

    case 'COMPLETE_MILESTONE': {
      const milestone = state.milestones.find((m) => m.id === action.milestoneId)
      if (!milestone || milestone.status === 'Completed') return state

      return {
        ...state,
        gems: state.gems + milestone.gemReward,
        milestones: state.milestones.map((m) =>
          m.id === action.milestoneId ? { ...m, status: 'Completed' as const } : m
        ),
      }
    }

    case 'ADD_QUEST': {
      return {
        ...state,
        quests: [...state.quests, action.quest],
      }
    }

    case 'ADD_STORE_ITEM': {
      return {
        ...state,
        storeItems: [...state.storeItems, action.item],
      }
    }

    case 'LOAD_STATE': {
      return action.state
    }

    default:
      return state
  }
}

const GameContext = createContext<{
  state: GameState
  dispatch: React.Dispatch<GameAction>
  completeQuest: (questId: string) => void
  uncompleteQuest: (questId: string) => void
  purchaseItem: (itemId: string) => void
  startFocus: (skillId: string, taskName: string) => void
  stopFocus: () => void
  completeMilestone: (milestoneId: string) => void
} | null>(null)

const STORAGE_KEY = 'level-up-game-state'

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        dispatch({ type: 'LOAD_STATE', state: parsed })
      } catch (e) {
        console.error('Failed to load saved state:', e)
      }
    }
  }, [])

  // Save state to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  // Focus timer interval
  useEffect(() => {
    if (!state.activeFocus?.isActive || !state.activeFocus.startTime) return

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - state.activeFocus!.startTime!) / 1000)
      dispatch({ type: 'UPDATE_FOCUS_TIME', elapsedSeconds: elapsed })
    }, 1000)

    return () => clearInterval(interval)
  }, [state.activeFocus?.isActive, state.activeFocus?.startTime])

  const completeQuest = useCallback((questId: string) => {
    dispatch({ type: 'COMPLETE_QUEST', questId })
  }, [])

  const uncompleteQuest = useCallback((questId: string) => {
    dispatch({ type: 'UNCOMPLETE_QUEST', questId })
  }, [])

  const purchaseItem = useCallback((itemId: string) => {
    dispatch({ type: 'PURCHASE_ITEM', itemId })
  }, [])

  const startFocus = useCallback((skillId: string, taskName: string) => {
    dispatch({ type: 'START_FOCUS', skillId, taskName })
  }, [])

  const stopFocus = useCallback(() => {
    dispatch({ type: 'STOP_FOCUS' })
  }, [])

  const completeMilestone = useCallback((milestoneId: string) => {
    dispatch({ type: 'COMPLETE_MILESTONE', milestoneId })
  }, [])

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        completeQuest,
        uncompleteQuest,
        purchaseItem,
        startFocus,
        stopFocus,
        completeMilestone,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
