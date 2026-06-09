import type { InputHTMLAttributes } from 'react'

import styles from './Input.module.css'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className={styles.field}>
      {label ? (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={[styles.input, error ? styles.hasError : '', className ?? '']
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      {error ? <span className={styles.error}>{error}</span> : null}
    </div>
  )
}
