"use client"

import { useEffect } from 'react'
import { initPersistence } from '@/game-engine/persistenceBridge'
import { startResetScheduler } from '@/game-engine/resetScheduler'

export default function PersistenceInit() {
  useEffect(() => {
    initPersistence()
    startResetScheduler()
  }, [])
  return null
}
