type AuthMethod = 'email' | 'phone'

type AuthMethodTabsProps = {
  value: AuthMethod
  onChange: (value: AuthMethod) => void
}

export function AuthMethodTabs({ value, onChange }: AuthMethodTabsProps) {
  return (
    <div className="authMethodTabs" role="tablist" aria-label="登录方式">
      <button
        type="button"
        role="tab"
        aria-selected={value === 'email'}
        className={value === 'email' ? 'authMethodTab authMethodTabActive' : 'authMethodTab'}
        onClick={() => onChange('email')}
      >
        邮箱
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === 'phone'}
        className={value === 'phone' ? 'authMethodTab authMethodTabActive' : 'authMethodTab'}
        onClick={() => onChange('phone')}
      >
        手机
      </button>
    </div>
  )
}

export type { AuthMethod }
