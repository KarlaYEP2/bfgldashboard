const API_URL = 'https://api.start.gg/gql/alpha'

async function gql(query, variables) {
  const apiKey = localStorage.getItem('startgg_api_key')

  if (!apiKey) {
    throw new Error('Missing API key')
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query, variables }),
  })

  const json = await res.json()

  if (json.errors) {
    console.error(json.errors)
    throw new Error('GraphQL error')
  }

  return json.data
}

export async function fetchVenueDashboard(tournamentSlug) {
  const tournamentData = await gql(
    `
    query ($slug: String!) {
      tournament(slug: $slug) {
        name
        events {
          id
          name
          slug
          videogame {
            name
          }
        }
      }
    }
  `,
    { slug: tournamentSlug },
  )

  const events = tournamentData.tournament.events

  const eventResults = await Promise.all(
    events.map(async (event) => {
      const eventData = await gql(
        `
        query ($slug: String!) {
          event(slug: $slug) {
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
      `,
        { slug: event.slug },
      )

      const e = eventData.event
      const sets = e.sets?.nodes ?? []

      const running = sets
        .filter((s) => s.state === 2)
        .map((s) => {
          const players = s.slots.map((x) => x.entrant?.name).filter(Boolean)

          return {
            event: e.name,
            game: e.videogame?.name ?? 'Unknown Game',
            players:
              players.length === 2 ? `${players[0]} vs ${players[1]}` : players[0] || 'Waiting...',
            station: s.station?.number ?? null,
          }
        })

      return running
    }),
  )

  return {
    tournament: tournamentData.tournament.name,
    matches: eventResults.flat(),
  }
}

export async function fetchRunningSets({ slug }) {
  const eventData = await gql(
    `
    query ($slug: String!) {
      event(slug: $slug) {
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
  `,
    { slug },
  )

  const e = eventData.event
  const sets = e.sets?.nodes ?? []

  return sets
    .filter((s) => s.state === 2)
    .map((s) => {
      const players = s.slots.map((x) => x.entrant?.name).filter(Boolean)

      return {
        event: e.name,
        game: e.videogame?.name ?? 'Unknown Game',
        players:
          players.length === 2 ? `${players[0]} vs ${players[1]}` : players[0] || 'Waiting...',
        station: s.station?.number ?? null,
      }
    })
}
