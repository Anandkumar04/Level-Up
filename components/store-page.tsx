'use client'

import { useState } from 'react'
import usePlayerStore from '@/game-engine/playerStore'
import { MoreHorizontal, Plus, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type Category = 'All' | 'Equipment' | 'Trip' | 'Experience' | 'Food'

const categoryIcons: Record<Category, string> = {
  All: '',
  Equipment: '🔧',
  Trip: '✈️',
  Experience: '🎭',
  Food: '🍕',
}

export function StorePage() {
  const gems = usePlayerStore((s) => s.gems)
  const tokens = usePlayerStore((s) => s.tokens)
  const storeItems = usePlayerStore((s) => s.storeItems)
  const purchaseItem = usePlayerStore((s) => s.purchaseItem)
  const purchasedInventory = usePlayerStore((s) => s.inventory)
  const [activeTab, setActiveTab] = useState<'Store' | 'Inventory'>('Store')
  const [selectedCategory, setSelectedCategory] = useState<Category>('All')

  const categories: Category[] = ['All', 'Equipment', 'Trip', 'Experience', 'Food']

  const filteredItems =
    selectedCategory === 'All'
      ? storeItems
      : storeItems.filter((item) => item.category === selectedCategory)

  const purchasedItems = storeItems.filter((item) => item.purchased)
  const unpurchasedItems = filteredItems.filter((item) => !item.purchased)
  const displayedItems = activeTab === 'Store' ? unpurchasedItems : purchasedItems

  const handlePurchase = (itemId: string) => {
    const item = storeItems.find(i => i.id === itemId)
    if (!item) return
    const currency = item.currency === 'gem' ? gems : tokens
    if (currency < item.price) {
      alert(`Not enough ${item.currency === 'gem' ? 'gems' : 'tokens'}!`)
      return
    }

    purchaseItem(itemId)
  }

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="px-4 pt-8 pb-4 text-center">
        <h1 className="text-2xl font-bold gradient-text leading-tight">
          Personalized Rewards
        </h1>
        <h1 className="text-2xl font-bold gradient-text leading-tight">
          That Motivate
        </h1>
      </div>

      {/* Currency and Tabs Card */}
      <div className="mx-4 mb-4">
        <div className="bg-card rounded-2xl p-4 border border-white/[0.08]">
          {/* Currency Display */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-xl">
                <span className="text-base">💎</span>
                <span className="font-semibold">{gems.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-xl">
                <span className="text-base">🪙</span>
                <span className="font-semibold">{tokens.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors">
                <MoreHorizontal className="w-5 h-5 text-white/50" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors">
                <Plus className="w-5 h-5 text-white/50" />
              </button>
            </div>
          </div>

          {/* Store/Inventory Tabs */}
          <div className="flex bg-secondary rounded-xl p-1">
            <button
              onClick={() => setActiveTab('Store')}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all',
                activeTab === 'Store'
                  ? 'bg-accent text-white'
                  : 'text-white/40'
              )}
            >
              Store
            </button>
            <button
              onClick={() => setActiveTab('Inventory')}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all relative',
                activeTab === 'Inventory'
                  ? 'bg-accent text-white'
                  : 'text-white/40'
              )}
            >
              Inventory
              {purchasedItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full text-xs flex items-center justify-center">
                  {purchasedItems.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      {activeTab === 'Store' && (
        <div className="mx-4 mb-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-secondary rounded-xl hover:bg-accent transition-colors">
              <Plus className="w-4 h-4 text-white/50" />
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-1.5',
                  selectedCategory === category
                    ? 'bg-accent text-white border border-white/20'
                    : 'bg-secondary text-white/40'
                )}
              >
                {categoryIcons[category] && <span className="text-sm">{categoryIcons[category]}</span>}
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="mx-4 space-y-3">
        {displayedItems.map((item) => {
          const canAfford = item.currency === 'gem' 
            ? gems >= item.price 
            : tokens >= item.price

          return (
            <div
              key={item.id}
              className={cn(
                "bg-card rounded-2xl p-4 border flex items-center justify-between transition-all",
                item.purchased 
                  ? "border-emerald-500/30 bg-emerald-500/5" 
                  : "border-white/[0.08]"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <span className="font-medium text-[15px]">{item.name}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-sm">{item.currency === 'gem' ? '💎' : '🪙'}</span>
                    <span className={cn(
                      "text-sm",
                      !item.purchased && !canAfford ? "text-red-400" : "text-white/50"
                    )}>
                      {item.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              {item.purchased ? (
                <div className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-sm font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  Owned
                </div>
              ) : (
                <button
                  onClick={() => handlePurchase(item.id)}
                  disabled={!canAfford}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95",
                    canAfford
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-white/10 text-white/30 cursor-not-allowed"
                  )}
                >
                  Purchase
                </button>
              )}
            </div>
          )
        })}

        {displayedItems.length === 0 && (
          <div className="text-center py-16 text-white/30">
            {activeTab === 'Inventory' ? (
              <>
                <p className="text-base mb-2">No items in your inventory yet.</p>
                <p className="text-sm">Complete quests to earn rewards!</p>
              </>
            ) : (
              <p>No items available in this category.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
