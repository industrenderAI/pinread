import type { User } from '../types/item'

export function Avatar({ user, size = 'md' }: { user: User | null; size?: 'sm' | 'md' }) {
  const dimension = size === 'sm' ? 'h-10 w-10' : 'h-14 w-14'

  if (!user) {
    return (
      <img
        src="/icons/profile.svg"
        alt="default_avatar"
        className={`${dimension} shrink-0 rounded-full bg-paper-card`}
      />
    )
  }

  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={`${dimension} shrink-0 rounded-full object-cover`}
      />
    )
  }

  return (
    <div
      className={`flex ${dimension} shrink-0 items-center justify-center rounded-full border border-line text-sm font-medium text-ink`}
    >
      {user.name.slice(0, 1)}
    </div>
  )
}
