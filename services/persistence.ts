import { supabase } from './supabaseClient'
import usePlayerStore from '@/game-engine/playerStore'

const LOCAL_KEY = 'player_state_v1'

export function saveToLocal(state: any) {
  try {
    const copy = JSON.parse(JSON.stringify(state))
    // remove functions
    delete copy.addXP
    delete copy.addQuest
    delete copy.completeQuestById
    localStorage.setItem(LOCAL_KEY, JSON.stringify(copy))
  } catch (e) {
    console.error('Failed to save state locally', e)
  }
}

export function loadFromLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to load local state', e)
    return null
  }
}

export async function syncToSupabase(userId: string) {
  const state = usePlayerStore.getState()
  try {
    const payload = { id: userId, data: state }
    const { error } = await supabase.from('players').upsert(payload)
    if (error) throw error
  } catch (e) {
    console.error('Supabase sync error', e)
  }
}

export async function loadFromSupabase(userId: string) {
  try {
    const { data, error } = await supabase.from('players').select('data').eq('id', userId).single()
    if (error) throw error
    return data?.data ?? null
  } catch (e) {
    console.error('Failed to load from supabase', e)
    return null
  }
}

export default { saveToLocal, loadFromLocal, syncToSupabase, loadFromSupabase }
