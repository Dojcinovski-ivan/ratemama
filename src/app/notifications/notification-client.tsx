'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { markAllNotificationsRead, markNotificationRead } from '@/lib/social-actions'
import { cn } from '@/components/ui'
import type { NotificationItem } from './page'

const ICONS: Record<string, string> = {
  helpful_vote: 'M7 20V10l4.5-6.5c1.2 0 2 .9 2 2V9h4.2c1.2 0 2.1 1.1 1.8 2.3l-1.6 6.4c-.2.8-1 1.3-1.8 1.3H7z',
  new_follower: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4.5 20c0-3.6 3.4-5.8 7.5-5.8s7.5 2.2 7.5 5.8',
  saved_product_verdict: 'M6.5 3.5h11a1 1 0 011 1v16l-6.5-4-6.5 4v-16a1 1 0 011-1z',
  ten_verdicts: 'M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6L12 16.8 6.7 19.6l1.1-6L3.4 9.4l6-.8z',
  founding_member: 'M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6L12 16.8 6.7 19.6l1.1-6L3.4 9.4l6-.8z',
}

export function MarkAllRead() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await markAllNotificationsRead()
          router.refresh()
        })
      }
      className="shrink-0 text-sm font-semibold text-worth underline"
    >
      {pending ? 'Marking' : 'Mark all as read'}
    </button>
  )
}

export function NotificationRow({
  notification,
  timeLabel,
}: {
  notification: NotificationItem
  timeLabel: string
}) {
  const router = useRouter()
  const [read, setRead] = useState(notification.read)

  function open() {
    if (!read) {
      setRead(true)
      markNotificationRead(notification.id)
    }
    if (notification.link) router.push(notification.link)
  }

  const path = ICONS[notification.type] ?? ICONS.founding_member

  return (
    <li>
      <button
        type="button"
        onClick={open}
        className={cn(
          'flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors',
          read ? 'border-neutral-200 bg-white' : 'border-worth/40 bg-worth-soft'
        )}
      >
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
          <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 stroke-[#2f7a55]" fill="none" strokeWidth="1.8">
            <path d={path} strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-neutral-900">{notification.title}</span>
          <span className="mt-0.5 block text-sm leading-relaxed text-neutral-700">
            {notification.body}
          </span>
          <span className="mt-1 block text-xs text-neutral-400">{timeLabel}</span>
        </span>
        {!read && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#3b82f6]" aria-label="Unread" />}
      </button>
    </li>
  )
}
