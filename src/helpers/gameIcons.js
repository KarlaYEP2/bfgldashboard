import sf6Logo from 'src/assets/Street_Fighter_6_logo.webp'
import bfglLogo from 'src/assets/BFGL_Logo.png'
import tekken8Logo from 'src/assets/Tekken_8.png'
import tekkenBallLogo from 'src/assets/Tekken_Ball.webp'

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
