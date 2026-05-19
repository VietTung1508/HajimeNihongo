import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { AccountProfile } from '@/types/account'
import { Calendar, Clock, Mail, Phone, Shield, User } from 'lucide-react'

function formatDate(date: string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function formatDateTime(date: string | null): string {
  if (!date) return 'Never'
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0 text-muted-foreground">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  )
}

interface AccountProfileCardProps {
  profile: AccountProfile
}

export function AccountProfileCard({ profile }: AccountProfileCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5" />
      <CardContent className="pb-6 pt-0">
        <div className="flex flex-wrap items-end justify-between gap-4 -mt-5 mb-5">
          <div className="flex items-end gap-4">
            <Avatar className="h-20 w-20 ring-4 ring-background shadow-md shrink-0">
              <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.username} />
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                {profile.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="pb-1">
              <h2 className="text-xl font-bold leading-tight">{profile.username}</h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>
        </div>

        <Separator className="mb-5" />

        <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
          <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={profile.email} />
          <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={profile.phone ?? '—'} />
          <InfoRow icon={<User className="h-4 w-4" />} label="Gender" value={profile.gender ?? '—'} />
          <InfoRow icon={<Calendar className="h-4 w-4" />} label="Date of Birth" value={formatDate(profile.dateOfBirth)} />
          <InfoRow icon={<Shield className="h-4 w-4" />} label="Joined" value={formatDate(profile.createdAt)} />
          <InfoRow icon={<Clock className="h-4 w-4" />} label="Last Login" value={formatDateTime(profile.lastLoginAt)} />
        </div>
      </CardContent>
    </Card>
  )
}
