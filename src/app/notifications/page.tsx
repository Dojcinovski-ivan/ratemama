import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Screen } from '@/components/ui'
import { timeAgo } from '@/lib/format'
import { MarkAllRead, NotificationRow } from './notification-client'

export const metadata = { title: 'Notifications | RateMama' }
export const dynamic = 'force-dynamic'

export type NotificationItem = {
  id: string
  type: string
  title: string
  body: string
  link: string | null
  read: boolean
  created_at: string
}

export default async function NotificationsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/notifications')

  const { data } = await supabase
    .from('notifications')
    .select('id, type, title, body, link, read, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(60)

  const items = (data ?? []) as NotificationItem[]
  const unread = items.filter((n) => !n.read).length

  return (
    <Screen>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Notifications</h1>
          {unread > 0 && (
            <p className="mt-1 text-sm text-neutral-500">
              {unread} unread
            </p>
          )}
        </div>
        {unread > 0 && <MarkAllRead />}
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white px-5 py-8">
          <h2 className="text-lg font-bold text-neutral-900">No notifications yet.</h2>
          <p className="mt-2 text-base leading-relaxed text-neutral-600">
            Start reviewing products to connect with the community.
          </p>
          <Link href="/discover" className="mt-4 inline-block font-semibold text-worth underline">
            Find something to rate
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {items.map((n) => (
            <NotificationRow key={n.id} notification={n} timeLabel={timeAgo(n.created_at)} />
          ))}
        </ul>
      )}

      <div className="h-12" />
    </Screen>
  )
}
