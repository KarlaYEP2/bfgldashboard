<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchVenueDashboard } from 'src/services/startgg.gql'
import sf6Logo from 'src/assets/Street_Fighter_6_logo.webp'

const matches = ref([])
const tournamentName = ref('')
const configLoaded = ref(false)

const apiKey = ref(localStorage.getItem('startgg_api_key') || '')
const tournamentSlug = ref(localStorage.getItem('tournament_slug') || 'tournament/test-8631')

const sortedMatches = computed(() => {
  return [...matches.value].sort((a, b) => {
    if (!a.station) {
      return 1
    }

    if (!b.station) {
      return -1
    }

    return a.station - b.station
  })
})

async function load() {
  const data = await fetchVenueDashboard(tournamentSlug.value)

  matches.value = data.matches
  tournamentName.value = data.tournament
  configLoaded.value = true
}

async function saveSettings() {
  localStorage.setItem('startgg_api_key', apiKey.value)
  localStorage.setItem('tournament_slug', tournamentSlug.value)

  await load()
}

onMounted(async () => {
  const storedKey = localStorage.getItem('startgg_api_key')
  const storedSlug = localStorage.getItem('tournament_slug')

  if (storedKey && storedSlug) {
    await load()
  }
})
</script>

<template>
  <q-page class="tv-page">
    <div class="header">
      <div class="title">Event 206s</div>
      <div class="subtitle">Now Playing</div>
    </div>

    <div class="settings q-mb-lg" v-if="!configLoaded">
      <q-input v-model="tournamentSlug" label="Tournament Slug" filled dark class="q-mb-md" />

      <q-input
        v-model="apiKey"
        label="start.gg API Key"
        filled
        dark
        type="password"
        class="q-mb-md"
      />

      <q-btn label="Save & Load" color="primary" @click="saveSettings" />
    </div>

    <div class="grid">
      <div v-for="m in sortedMatches" :key="m.players + m.station" class="match-card">
        <div class="logo">
          <img :src="sf6Logo" style="width: 80px" />
        </div>

        <div class="players">
          {{ m.players }}
        </div>

        <div class="meta">
          <div class="live">LIVE</div>
          <div class="station">
            {{ m.station ? `Setup ${m.station}` : 'No Setup' }}
          </div>
          <div class="event">
            {{ m.event }}
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.tv-page {
  background: #0b0b0b;
  color: white;
  height: 100%;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.title {
  font-size: 36px;
  font-weight: bold;
}

.subtitle {
  font-size: 20px;
  color: #aaa;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 16px;
}

.match-card {
  display: flex;
  align-items: center;
  background: #1a1a1a;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.logo img {
  width: 60px;
  height: 60px;
  object-fit: contain;
  margin-right: 16px;
}

.players {
  flex: 1;
  font-size: 22px;
  font-weight: bold;
}

.meta {
  text-align: right;
}

.live {
  color: #ff3b3b;
  font-weight: bold;
  font-size: 16px;
}

.station {
  font-size: 20px;
  font-weight: bold;
}

.event {
  font-size: 12px;
  color: #aaa;
}
</style>
