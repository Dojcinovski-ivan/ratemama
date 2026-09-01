import Link from 'next/link'
import { Screen } from '@/components/ui'
import { LegalList, LegalSection } from '@/components/legal'

export const metadata = {
  title: 'Privacy Policy | RateMama',
  description: 'How RateMama looks after your data, in plain language.',
}

export default function PrivacyPage() {
  return (
    <Screen>
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-neutral-500">Last updated August 2026</p>
      <p className="mt-4 text-base leading-relaxed text-neutral-700">
        We have written this in plain language because you deserve to understand what happens to
        your information without wading through legal text.
      </p>

      <LegalSection title="What we collect">
        <p>When you join RateMama we ask for a few things:</p>
        <LegalList
          items={[
            'Your first name and surname',
            'Your email address',
            'Your city and country',
            'The ratings you leave, including the price you paid and where you bought it',
            'Which products you save, swipe on and mark as helpful',
          ]}
        />
      </LegalSection>

      <LegalSection title="Why we collect it">
        <p>
          To personalise what you see, to show your ratings to other families, and to send you the
          notifications you asked for. That is all.
        </p>
      </LegalSection>

      <LegalSection title="What other people can see">
        <p>Your public profile shows only:</p>
        <LegalList
          items={[
            'Your first name',
            'Your city and country',
            'Your profile photo, if you added one',
            'Your bio, if you wrote one',
            'The ratings you have left',
          ]}
        />
      </LegalSection>

      <LegalSection title="What stays private">
        <p>
          Your surname is never shown to anyone. Not on your profile, not on your ratings, not
          anywhere. Neither is your email address or your marketing preference. These are locked
          down in our database itself, not merely hidden by our website.
        </p>
        <p>
          You can also set your profile to friends only, which keeps your ratings visible just to
          people you follow who follow you back.
        </p>
      </LegalSection>

      <LegalSection title="Your rights">
        <p>Under UK and EU data protection law you can ask us to:</p>
        <LegalList
          items={[
            'Show you everything we hold about you',
            'Correct anything that is wrong',
            'Delete your account and your data',
            'Stop sending you marketing email at any time',
          ]}
        />
        <p>
          Email us at hello@ratemama.com and we will sort it out. To delete your account, email us
          from the address you signed up with and we will remove it along with your ratings.
        </p>
      </LegalSection>

      <LegalSection title="We never sell your data">
        <p>
          Not to advertisers, not to brands, not to anyone. Ever. We are not that kind of company
          and we do not intend to become one.
        </p>
      </LegalSection>

      <LegalSection title="Who helps us run RateMama">
        <p>Three companies process data on our behalf:</p>
        <LegalList
          items={[
            'Supabase, which stores our database and handles logging in',
            'Resend, which sends our email',
            'Vercel, which hosts the website',
          ]}
        />
      </LegalSection>

      <LegalSection title="Cookies and analytics">
        <p>
          We ask before setting anything beyond what is needed to keep you logged in. If you
          decline, the site works exactly the same.
        </p>
        <p>
          If you accept, we use Google Analytics to see which pages people find useful and where
          they arrive from. It records the pages you visit, roughly where in the world you are and
          what kind of device you use. It never receives your name, your email address or the
          ratings you leave, and we do not use it for advertising.
        </p>
        <p>
          Google Analytics is provided by Google Ireland Limited, and some data may be processed
          outside the UK under the safeguards Google publishes. Nothing loads until you accept, and
          you can change your mind at any time on your{' '}
          <Link href="/settings" className="font-semibold text-worth underline">
            settings page
          </Link>
          . Turning it off clears the cookies it set.
        </p>
      </LegalSection>

      <LegalSection title="Getting in touch">
        <p>
          Email hello@ratemama.com and a real person will read it.{' '}
          <Link href="/terms" className="font-semibold text-worth underline">
            Our terms of service
          </Link>{' '}
          cover how the community works.
        </p>
      </LegalSection>

      <div className="h-12" />
    </Screen>
  )
}
