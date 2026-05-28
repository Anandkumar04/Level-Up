'use client'

import { useState } from 'react'
import { BottomNav } from '@/components/bottom-nav'
import { CharacterPage } from '@/components/character-page'
import { QuestsPage } from '@/components/quests-page'
import { JourneyPage } from '@/components/journey-page'
import { FocusPage } from '@/components/focus-page'
import { StorePage } from '@/components/store-page'

export default function Home() {
  const [activeTab, setActiveTab] = useState('character')

  return (
    <main className="min-h-screen bg-black">
      {activeTab === 'character' && <CharacterPage />}
      {activeTab === 'quests' && <QuestsPage />}
      {activeTab === 'journey' && <JourneyPage />}
      {activeTab === 'focus' && <FocusPage />}
      {activeTab === 'store' && <StorePage />}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  )
}
