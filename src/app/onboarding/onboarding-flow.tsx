'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  HOUSEHOLD_TYPES,
  SHOPPING_CATEGORIES,
  SUPERMARKETS,
} from '@/lib/onboarding-options'
import {
  saveAnswersAndBuildDeck,
  recordSwipe,
  completeOnboarding,
  type DeckProduct,
} from './actions'
import { Button, FormError, FoundingMemberBadge, Note, Screen } from '@/components/ui'
import { ProgressBar } from './progress-bar'
import { ChoiceCard } from './choice-card'
import { SwipeDeck } from './swipe-deck'

type Stage = 'intro' | 'household' | 'categories' | 'supermarkets' | 'swipe' | 'done'

const TOTAL_STEPS = 5

const STEP_INDEX: Record<Stage, number> = {
  intro: 0,
  household: 1,
  categories: 2,
  supermarkets: 3,
  swipe: 4,
  done: 5,
}

export default function OnboardingFlow({ firstName }: { firstName: string }) {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('intro')
  const [household, setHousehold] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [supermarkets, setSupermarkets] = useState<string[]>([])
  const [deck, setDeck] = useState<DeckProduct[]>([])
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function toggle(list: string[], value: string, set: (v: string[]) => void) {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  function goToSwipe() {
    setError('')
    startTransition(async () => {
      const result = await saveAnswersAndBuildDeck(household, categories, supermarkets)
      if (result.error) {
        setError(result.error)
        return
      }
      setDeck(result.products ?? [])
      setStage('swipe')
    })
  }

  function finish() {
    startTransition(async () => {
      await completeOnboarding()
      setStage('done')
    })
  }

  return (
    <Screen>
      {stage !== 'intro' && (
        <div className="mb-8">
          <ProgressBar step={STEP_INDEX[stage]} total={TOTAL_STEPS} />
        </div>
      )}

      {stage === 'intro' && (
        <div className="flex flex-1 flex-col justify-center">
          <p className="text-lg font-bold text-worth">RateMama</p>
          <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-neutral-900">
            Let us find the right products for you.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-neutral-600">
            We will ask you three quick questions to personalise your experience. Takes about 30
            seconds.
          </p>
          <div className="mt-10">
            <Button onClick={() => setStage('household')}>Let us go</Button>
          </div>
        </div>
      )}

      {stage === 'household' && (
        <div className="flex flex-1 flex-col">
          <h1 className="text-2xl font-bold leading-snug tracking-tight text-neutral-900">
            Who is in your household?
          </h1>
          <div className="mt-6 space-y-3">
            {HOUSEHOLD_TYPES.map((option) => (
              <ChoiceCard
                key={option.value}
                label={option.label}
                selected={household === option.value}
                onSelect={() => setHousehold(option.value)}
              />
            ))}
          </div>
          <div className="mt-6">
            <Note>This helps us show you the most relevant products.</Note>
          </div>
          <div className="mt-auto pt-8">
            <Button disabled={!household} onClick={() => setStage('categories')}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {stage === 'categories' && (
        <div className="flex flex-1 flex-col">
          <h1 className="text-2xl font-bold leading-snug tracking-tight text-neutral-900">
            What do you mostly shop for?
          </h1>
          <div className="mt-6 space-y-3">
            {SHOPPING_CATEGORIES.map((option) => (
              <ChoiceCard
                key={option.value}
                label={option.label}
                multi
                selected={categories.includes(option.value)}
                onSelect={() => toggle(categories, option.value, setCategories)}
              />
            ))}
          </div>
          <div className="mt-6">
            <Note>Select everything that applies. You can change this later.</Note>
          </div>
          <div className="mt-auto space-y-3 pt-8">
            <Button disabled={categories.length === 0} onClick={() => setStage('supermarkets')}>
              Continue
            </Button>
            <Button variant="ghost" onClick={() => setStage('household')}>
              Back
            </Button>
          </div>
        </div>
      )}

      {stage === 'supermarkets' && (
        <div className="flex flex-1 flex-col">
          <h1 className="text-2xl font-bold leading-snug tracking-tight text-neutral-900">
            Where do you usually shop?
          </h1>
          <div className="mt-6 space-y-3">
            {SUPERMARKETS.map((option) => (
              <ChoiceCard
                key={option.value}
                label={option.label}
                multi
                selected={supermarkets.includes(option.value)}
                onSelect={() => toggle(supermarkets, option.value, setSupermarkets)}
              />
            ))}
          </div>
          <div className="mt-6 space-y-4">
            <Note>We use this to show you relevant prices and where to buy.</Note>
            <FormError>{error}</FormError>
          </div>
          <div className="mt-auto space-y-3 pt-8">
            <Button disabled={supermarkets.length === 0 || pending} onClick={goToSwipe}>
              {pending ? 'Getting your products ready' : 'Continue'}
            </Button>
            <Button variant="ghost" onClick={() => setStage('categories')}>
              Back
            </Button>
          </div>
        </div>
      )}

      {stage === 'swipe' && (
        <SwipeDeck
          products={deck}
          onSwipe={recordSwipe}
          onFinish={finish}
          finishing={pending}
        />
      )}

      {stage === 'done' && (
        <div className="flex flex-1 flex-col justify-center">
          <FoundingMemberBadge />
          <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-neutral-900">
            Your feed is ready.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-neutral-600">
            {firstName ? `Welcome to RateMama, ${firstName}. ` : 'Welcome to RateMama. '}
            You are one of our founding members. Every verdict you leave shapes this community.
          </p>
          <div className="mt-10">
            <Button onClick={() => router.push('/feed')}>See my feed</Button>
          </div>
        </div>
      )}
    </Screen>
  )
}
