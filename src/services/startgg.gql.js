const API_URL = 'https://api.start.gg/gql/alpha'
const MAX_RETRY_ATTEMPTS = 4
const RETRY_BASE_MS = 10000

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function gql(query, variables, attempt = 1) {
  const apiKey = localStorage.getItem('startgg_api_key')

  if (!apiKey) {
    throw new Error('Missing API key')
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query, variables }),
    })

    if (res.status === 429) {
      if (attempt >= MAX_RETRY_ATTEMPTS) {
        throw new Error('Rate limited: too many retries after 429')
      }

      const retryAfter = res.headers.get('Retry-After')
      const delay = retryAfter ? Number(retryAfter) * 1000 : RETRY_BASE_MS * attempt

      await sleep(delay)
      return gql(query, variables, attempt + 1)
    }

    const json = await res.json()

    if (json.errors) {
      console.error(json.errors)
      throw new Error('GraphQL error')
    }

    return json.data
  } catch (error) {
    if (attempt < MAX_RETRY_ATTEMPTS) {
      await sleep(RETRY_BASE_MS * attempt)
      return gql(query, variables, attempt + 1)
    }

    throw error
  }
}

export async function fetchVenueDashboard(tournamentSlug) {
  const data = await gql(
    `
    query ($slug: String!) {
      tournament(slug: $slug) {
        name
        events {
          name
          videogame { name }
          sets(page: 1, perPage: 20) {
            nodes {
              id
              state
              slots {
                entrant { name }
              }
              station { number }
            }
          }
        }
      }
    }
  `,
    { slug: tournamentSlug },
  )

  const tournament = data.tournament
  const events = tournament.events

  const matches = events.flatMap((e) => {
    const sets = e.sets?.nodes ?? []

    return sets
      .filter((s) => s.state === 2)
      .map((s) => {
        const players = s.slots.map((x) => x.entrant?.name).filter(Boolean)

        const cleanedName = (e.name || '').replace(/^\s*(MAIN:|SIDE:)\s*/i, '').trim()

        return {
          event: e.name,
          eventClean: cleanedName,
          game: e.videogame?.name ?? 'Unknown Game',
          player1: players[0],
          player2: players[1],
          station: s.station?.number ?? null,
        }
      })
  })

  return {
    tournament: tournament.name,
    matches,
  }
}
