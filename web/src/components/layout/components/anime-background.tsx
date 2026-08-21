/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { useTheme } from '@/context/theme-provider'

import {
  ANIME_BG_ATTRIBUTE,
  isAnimeBackgroundPath,
} from '../lib/anime-background'

const DARK_BACKGROUND_URL = '/dark1.webp'
const LIGHT_BACKGROUND_URL = '/light1.webp'

/**
 * Fixed full-screen anime wallpaper rendered behind every page except home.
 * Mounting it once in the root route keeps the same image across client-side
 * navigation. While active it also sets `data-anime-bg` on <body>, which the
 * stylesheet in `src/styles/anime-background.css` uses to turn the regular
 * surface colors translucent with a frosted-glass blur.
 */
export function AnimeBackground() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const active = isAnimeBackgroundPath(pathname)
  const { resolvedTheme } = useTheme()
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)

  useEffect(() => {
    if (typeof document === 'undefined') return undefined
    if (active) {
      document.body.setAttribute(ANIME_BG_ATTRIBUTE, 'true')
    } else {
      document.body.removeAttribute(ANIME_BG_ATTRIBUTE)
    }
    return () => {
      document.body.removeAttribute(ANIME_BG_ATTRIBUTE)
    }
  }, [active])

  if (!active) return null

  const src = resolvedTheme === 'dark' ? DARK_BACKGROUND_URL : LIGHT_BACKGROUND_URL

  return (
    <div
      aria-hidden='true'
      data-slot='anime-background'
      className={
        loadedSrc === src
          ? 'anime-background-layer anime-background-layer-visible'
          : 'anime-background-layer'
      }
    >
      <img
        key={src}
        src={src}
        alt=''
        decoding='async'
        className={`anime-background-image anime-background-image--${resolvedTheme}`}
        onLoad={() => setLoadedSrc(src)}
      />
      <div className='anime-background-scrim' />
    </div>
  )
}
