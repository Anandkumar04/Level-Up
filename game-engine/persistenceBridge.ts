import usePlayerStore from './playerStore'
import { saveToLocal, loadFromLocal, syncToSupabase, loadFromSupabase } from '@/services/persistence'
import { onAuthStateChange, getSession } from '@/services/auth'

let unsub: any = null

export function initPersistence() {
  // hydrate from local first
  const local = loadFromLocal()
  if (local) {
    usePlayerStore.setState(local)
  }

  // subscribe to store changes and save locally
  unsub = usePlayerStore.subscribe((state) => {
    // save a shallow copy
    saveToLocal(state)
  })

  // if logged in, sync
  getSession().then((sess) => {
    const userId = sess?.user?.id
    if (userId) {
      loadFromSupabase(userId).then(remote => {
        if (remote) usePlayerStore.setState(remote)
        syncToSupabase(userId)
      })
    }
  })

  // listen to auth changes
  onAuthStateChange((event, session) => {
    const userId = session?.user?.id
    if (event === 'SIGNED_IN' && userId) {
      // merge remote and push local
      loadFromSupabase(userId).then(remote => {
        if (remote) usePlayerStore.setState(remote)
        syncToSupabase(userId)
      })
    }
    if (event === 'SIGNED_OUT') {
      // no-op for now
    }
  })
}

export function stopPersistence() {
  if (unsub) unsub()
}

export default { initPersistence, stopPersistence }
