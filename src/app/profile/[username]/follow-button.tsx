'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleFollow } from '@/lib/social-actions'
import { Button } from '@/components/ui'

export function FollowButton({
  targetUserId,
  initialFollowing,
  initialFollowers,
  signedIn,
  path,
  compact,
}: {
  targetUserId: string
  initialFollowing: boolean
  initialFollowers?: number
  signedIn: boolean
  path?: string
  compact?: boolean
}) {
  const router = useRouter()
  const [following, setFollowing] = useState(initialFollowing)
  const [, setFollowers] = useState(initialFollowers ?? 0)
  const [pending, startTransition] = useTransition()

  function press() {
    if (!signedIn) {
      router.push('/login')
      return
    }
    // Changes the moment they tap, then the server confirms.
    const next = !following
    setFollowing(next)
    setFollowers((c) => c + (next ? 1 : -1))
    startTransition(async () => {
      const result = await toggleFollow(targetUserId, path)
      if (result.error) {
        setFollowing(!next)
        setFollowers((c) => c + (next ? -1 : 1))
      }
    })
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={press}
        disabled={pending}
        className={
          following
            ? 'shrink-0 rounded-full border border-neutral-300 px-4 py-1.5 text-sm font-semibold text-neutral-600'
            : 'shrink-0 rounded-full bg-worth px-4 py-1.5 text-sm font-semibold text-worth-fg'
        }
      >
        {following ? 'Following' : 'Follow'}
      </button>
    )
  }

  return (
    <Button variant={following ? 'secondary' : 'primary'} onClick={press} disabled={pending}>
      {following ? 'Following' : 'Follow'}
    </Button>
  )
}
