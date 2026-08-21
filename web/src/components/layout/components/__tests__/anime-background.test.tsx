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
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ANIME_BG_ATTRIBUTE,
  isAnimeBackgroundPath,
} from '../../lib/anime-background'
import { AnimeBackground } from '../anime-background'

vi.mock('@tanstack/react-router', () => ({
  useRouterState: vi.fn(),
}))

vi.mock('@/context/theme-provider', () => ({
  useTheme: vi.fn(),
}))

// eslint-disable-next-line import/first
import { useRouterState } from '@tanstack/react-router'
// eslint-disable-next-line import/first
import { useTheme } from '@/context/theme-provider'

const mockUseRouterState = vi.mocked(useRouterState)
const mockUseTheme = vi.mocked(useTheme)

let currentPathname = '/'
let currentResolvedTheme: 'dark' | 'light' = 'dark'

function installRouterState() {
  mockUseRouterState.mockImplementation(
    (
      options?: { select?: (state: unknown) => unknown } | undefined
    ) => {
      const state = { location: { pathname: currentPathname } }
      return options?.select ? options.select(state) : state
    }
  )
}

describe('isAnimeBackgroundPath', () => {
  it('excludes the home route from the wallpaper', () => {
    expect(isAnimeBackgroundPath('/')).toBe(false)
  })

  it('covers authenticated and public routes other than home', () => {
    expect(isAnimeBackgroundPath('/dashboard')).toBe(true)
    expect(isAnimeBackgroundPath('/channels')).toBe(true)
    expect(isAnimeBackgroundPath('/sign-in')).toBe(true)
    expect(isAnimeBackgroundPath('/pricing')).toBe(true)
  })
})

describe('AnimeBackground', () => {
  beforeEach(() => {
    currentPathname = '/dashboard'
    currentResolvedTheme = 'dark'
    installRouterState()
    mockUseTheme.mockImplementation(
      () =>
        ({ resolvedTheme: currentResolvedTheme }) as ReturnType<typeof useTheme>
    )
  })

  afterEach(() => {
    document.body.removeAttribute(ANIME_BG_ATTRIBUTE)
  })

  it('renders the dark wallpaper and activates glass mode on non-home routes', () => {
    currentPathname = '/dashboard'
    currentResolvedTheme = 'dark'
    render(<AnimeBackground />)

    const image = screen.getByAltText('')
    expect(image).toHaveAttribute('src', '/dark1.webp')
    expect(image).toHaveClass('anime-background-image--dark')
    expect(document.body).toHaveAttribute(ANIME_BG_ATTRIBUTE, 'true')
  })

  it('renders nothing and keeps glass mode off on the home route', () => {
    currentPathname = '/'
    const { container } = render(<AnimeBackground />)

    expect(container).toBeEmptyDOMElement()
    expect(document.body).not.toHaveAttribute(ANIME_BG_ATTRIBUTE)
  })

  it('switches to the light wallpaper when the resolved theme is light', () => {
    currentPathname = '/keys'
    currentResolvedTheme = 'light'
    render(<AnimeBackground />)

    const image = screen.getByAltText('')
    expect(image).toHaveAttribute('src', '/light1.webp')
    expect(image).toHaveClass('anime-background-image--light')
  })

  it('fades the layer in only after the wallpaper image finishes loading', () => {
    currentPathname = '/usage-logs'
    render(<AnimeBackground />)

    const layer = document.querySelector('[data-slot="anime-background"]')
    expect(layer).not.toHaveClass('anime-background-layer-visible')

    const image = screen.getByAltText('')
    fireEvent.load(image)

    expect(layer).toHaveClass('anime-background-layer-visible')
  })

  it('removes the glass attribute when navigating to home or unmounting', () => {
    currentPathname = '/wallet'
    const { unmount } = render(<AnimeBackground />)
    expect(document.body).toHaveAttribute(ANIME_BG_ATTRIBUTE, 'true')

    unmount()
    expect(document.body).not.toHaveAttribute(ANIME_BG_ATTRIBUTE)
  })
})
