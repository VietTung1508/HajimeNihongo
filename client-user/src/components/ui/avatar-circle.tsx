'use client'

const PALETTE = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
]

function getColor(username: string): string {
  const sum = Array.from(username).reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return PALETTE[sum % PALETTE.length]
}

function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase()
}

interface AvatarCircleProps {
  username: string
  avatarUrl?: string
  size?: number
}

export function AvatarCircle({username, avatarUrl, size = 32}: AvatarCircleProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username}
        width={size}
        height={size}
        className='rounded-full object-cover'
        style={{width: size, height: size}}
      />
    )
  }

  const initials = username ? getInitials(username) : ''
  const bg = username ? getColor(username) : '#64748b'

  return (
    <div
      style={{width: size, height: size, backgroundColor: bg}}
      className='rounded-full flex items-center justify-center text-white font-semibold select-none'
    >
      <span style={{fontSize: Math.max(10, size * 0.35)}}>{initials}</span>
    </div>
  )
}
