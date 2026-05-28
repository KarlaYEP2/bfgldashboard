<script setup>
import { ref, onMounted } from 'vue'
import { fetchVenueDashboard } from 'src/services/startgg.gql'

const storedSlug = localStorage.getItem('tournament_slug')

const matches = ref([])
const tournamentName = ref('')
const loading = ref(false)

async function load() {
  loading.value = true

  const data = await fetchVenueDashboard(storedSlug)

  matches.value = data.matches
  tournamentName.value = data.tournament

  loading.value = false
}

onMounted(() => {
  load()

  // setInterval(load, 10000);
})
</script>

<template>
  <q-page class="q-pa-md bg-dark text-white">
    <div class="text-h4 q-mb-md">
      <!-- {{ tournamentName }} -->
      Event name 205
    </div>

    <!-- <q-btn label="Refresh" @click="load" class="q-mb-md" /> -->

    <div v-if="loading">Loading live matches...</div>

    <q-list v-else bordered>
      <q-item v-for="m in matches" :key="m.players + m.station">
        <q-item-section>
          <div class="text-h6">
            {{ m.players }}
          </div>

          <div class="text-caption text-white">{{ m.game }}</div>
        </q-item-section>

        <q-item-section side>
          <q-badge color="green"> STARTING </q-badge>

          <div v-if="m.station">Station {{ m.station }}</div>
          <div v-else>Station 6</div>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>
