import { type ReactNode } from 'react'

type IconActionButtonVariant = 'neutral' | 'danger' | 'primary'

type IconActionButtonProps = {
  label: string
  onClick?: () => void
  disabled?: boolean
  variant?: IconActionButtonVariant
  children: ReactNode
}

const iconActionButtonVariants: Record<IconActionButtonVariant, string> = {
  neutral:
    'border-brand-100 bg-white text-brand-500 shadow-sm hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 focus-visible:ring-brand-300 disabled:hover:translate-y-0 disabled:hover:bg-white',
  danger:
    'border-red-200 bg-white text-red-500 shadow-sm hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:text-red-600 focus-visible:ring-red-300 disabled:hover:translate-y-0 disabled:hover:bg-white',
  primary:
    'border-brand-500 bg-brand-500 text-white shadow-sm hover:-translate-y-0.5 hover:border-brand-400 hover:bg-brand-400 focus-visible:ring-brand-300 disabled:hover:translate-y-0 disabled:hover:bg-brand-500',
}

export const IconActionButton = ({ label, onClick, disabled, variant = 'neutral', children }: IconActionButtonProps) => (
  <button
    type="button"
    className={`group relative inline-flex h-9 w-9 items-center justify-center rounded-xl border transition focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${iconActionButtonVariants[variant]}`}
    aria-label={label}
    title={label}
    onClick={onClick}
    disabled={disabled}
  >
    <span aria-hidden className="inline-flex h-4 w-4 items-center justify-center">
      {children}
    </span>
    <span className="pointer-events-none absolute -top-9 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-md bg-brand-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100">
      {label}
    </span>
    <span className="sr-only">{label}</span>
  </button>
)
