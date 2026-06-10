import { Button } from '@matchtable/ui'

import { signInWithOAuth } from '~/features/auth/client'
import { mapAuthError } from '~/features/auth/errors'

type OAuthButtonsProps = {
  mode: 'login' | 'register'
  onError: (message: string | null) => void
}

const labels = {
  login: { google: 'Google', apple: 'Apple', github: 'GitHub' },
  register: { google: 'Google', apple: 'Apple', github: 'GitHub' },
} as const

export function OAuthButtons({ mode, onError }: OAuthButtonsProps) {
  async function handleOAuth(provider: 'google' | 'apple' | 'github') {
    try {
      onError(null)
      await signInWithOAuth(provider)
    } catch (err) {
      console.error('OAuth error:', err)
      onError(mapAuthError(err))
    }
  }

  const text = labels[mode]

  return (
    <div className="oauthGrid">
      <Button type="button" variant="secondary" onClick={() => handleOAuth('google')}>
        {text.google}
      </Button>
      <Button type="button" variant="secondary" onClick={() => handleOAuth('apple')}>
        {text.apple}
      </Button>
      <Button type="button" variant="secondary" onClick={() => handleOAuth('github')}>
        {text.github}
      </Button>
    </div>
  )
}
