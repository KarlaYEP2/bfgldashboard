import sf6Logo from 'src/assets/Street_Fighter_6_logo.webp'

const bfglLogo = new URL('/BFGL_Logo.png', import.meta.url).href
const tekken8Logo = new URL('/Tekken_8.png', import.meta.url).href
const tekkenBallLogo = new URL('/Tekken_Ball.webp', import.meta.url).href

const gameIconMappings = [
  { keys: ['street fighter 6'], logo: sf6Logo },
  { keys: ['tekken 8'], logo: tekken8Logo },
  { keys: ['tekken ball'], logo: tekkenBallLogo },
]

export function getGameIcon(m) {
  const name = m.eventClean || m.event || ''
  const key = `${name}`.toLowerCase()

  for (const mapping of gameIconMappings) {
    if (mapping.keys.some((k) => key.includes(k))) {
      return mapping.logo
    }
  }

  return bfglLogo
}
