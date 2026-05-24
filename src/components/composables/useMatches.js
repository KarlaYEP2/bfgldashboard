import { ref } from 'vue'
import { fetchRunningSets } from 'src/services/startgg.gql.js'

export function useMatches() {
  const matches = ref([])
  const loading = ref(false)
  const error = ref(null)
  const eventName = ref('')

  async function load(slug) {
    try {
      loading.value = true

      const event = await fetchRunningSets({ slug })

      matches.value = event.map((set) => ({
        eventName: set.event,
        players: set.players,
        station: set.station ? set.station : 'No setup',
      }))
      return matches.value
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return {
    matches,
    loading,
    error,
    eventName,
    load,
  }
}
