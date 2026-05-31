<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchVenueDashboard } from 'src/services/startgg.gql'
import { getGameIcon } from 'src/helpers/gameIcons'

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

  setInterval(load, 10000)
})
</script>

<template>
  <q-page class="tv-page overflow-hidden position-relative background-black color-white">
    <div class="q-mb-lg">
      <div>
        <div
          class="q-mb-xs text-h1 text-uppercase"
          style="font-weight: 900; font-family: var(--font-display), cursive; color: #c90055"
        >
          {{ tournamentName }}
        </div>
        <div class="text-uppercase text-h3" style="color: #7cd678">Now Playing</div>
      </div>
    </div>

    <div class="q-mb-lg" v-if="!configLoaded" style="max-width: 480px">
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
      <div
        v-for="m in sortedMatches"
        :key="m.player1 + m.player2 + m.station"
        class="match-card flex row items-center no-wrap justify-between"
      >
        <div class="players col-3 q-pl-xl text-left text-white text-weight-bold text-h6">
          {{ m.player1 }}
        </div>

        <div class="match-logo col-auto row items-center justify-center">
          <img :src="getGameIcon(m)" :alt="m.eventClean || m.event || m.game" />
        </div>

        <div class="players col-3 q-pr-xl text-right text-white text-weight-bold text-h6">
          {{ m.player2 }}
        </div>

        <div class="match-right row items-center justify-center q-pl-md q-pr-md bg-white">
          <div class="setup-label text-h6 text-uppercase">
            {{ m.station ? `Setup ${m.station}` : 'NO SETUP' }}
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.tv-page {
  padding: 28px 32px;
  min-height: 100vh;
}

.tv-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at center, rgba(255, 255, 255, 0.1), transparent 38%),
    url('/BFGL_Logo.png') center / 1500px no-repeat;
  opacity: 0.16;
  pointer-events: none;
}

.tv-page > * {
  position: relative;
}

.title {
  font-weight: 900;
  font-family: var(--font-display), cursive;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.match-card {
  align-items: center;
  gap: 20px;
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 24px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45);
  min-height: 128px;
}

.match-logo img {
  height: 100px;
  object-fit: contain;
}

.players {
  font-size: 24px;
  font-weight: 800;
  line-height: 1.1;
  /* allow the name to wrap onto a second line, then clamp with an ellipsis */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  flex: 0 1 auto;
  min-width: 0;
}

.match-right {
  min-width: 120px;
  flex-shrink: 0;
  height: 100%;
  background: #ffffff;
  border-radius: 0 24px 24px 0;
  text-align: center;
  box-shadow: 0 18px 28px rgba(0, 0, 0, 0.1);
}

.setup-label {
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #a30053;
  font-family: var(--font-display), cursive;
}

@media (max-width: 1200px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .tv-page {
    padding: 20px;
  }

  .match-card {
    flex-direction: column;
    align-items: stretch;
    min-height: auto;
  }

  .match-right {
    width: 100%;
    margin-top: 16px;
  }
}
</style>
