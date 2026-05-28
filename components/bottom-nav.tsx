'use client'

import { Home, Target, Compass, Clock, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navItems = [
  { id: 'character', icon: Home, label: 'Character' },
  { id: 'quests', icon: Target, label: 'Quests' },
  { id: 'journey', icon: Compass, label: 'Journey' },
  { id: 'focus', icon: Clock, label: 'Focus' },
  { id: 'store', icon: ShoppingBag, label: 'Store' },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/[0.08] px-2 pb-7 pt-2 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200',
                isActive ? 'text-white' : 'text-white/30'
              )}
            >
              <Icon
                className={cn(
                  'w-6 h-6 transition-transform duration-200',
                  isActive && 'scale-110'
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
