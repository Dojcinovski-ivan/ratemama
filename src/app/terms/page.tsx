import Link from 'next/link'
import { Screen } from '@/components/ui'
import { LegalList, LegalSection } from '@/components/legal'

export const metadata = {
  title: 'Terms of Service | RateMama',
  description: 'The rules of the RateMama community, in plain language.',
}

export default function TermsPage() {
  return (
    <Screen>
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Terms of Service</h1>
      <p className="mt-2 text-sm text-neutral-500">Last updated August 2026</p>
      <p className="mt-4 text-base leading-relaxed text-neutral-700">
        Short and readable, because rules nobody reads are not really rules.
      </p>

      <LegalSection title="What RateMama is">
        <p>
          A community platform where real families say whether everyday products are worth the
          money. It is not a sponsored review site. Nobody pays us to be rated well, and no brand
          has any say over what members write.
        </p>
      </LegalSection>

      <LegalSection title="Who can use it">
        <p>Anyone aged 18 or over.</p>
      </LegalSection>

      <LegalSection title="How to behave here">
        <p>The whole thing only works if people are honest. So please:</p>
        <LegalList
          items={[
            'Only rate products you have actually bought and used',
            'Say what you really think, even when it is unflattering',
            'Do not post fake ratings, for any reason',
            'Do not spam, advertise or promote your own products',
            'Do not harass anyone, ever',
          ]}
        />
      </LegalSection>

      <LegalSection title="Your ratings belong to you">
        <p>
          You own what you write. By posting it you give us permission to display it on RateMama
          and to show it to people who find your rating through a search engine. If you delete your
          account we remove your ratings with it.
        </p>
      </LegalSection>

      <LegalSection title="What we are not responsible for">
        <p>
          Ratings are honest opinions from members, not statements of fact. We do not check them and we
          cannot promise they are accurate. Prices change, recipes change, and what suits one family
          may not suit yours. Please treat what you read as helpful opinion rather than advice, and
          make your own decision about what to buy.
        </p>
      </LegalSection>

      <LegalSection title="Losing your account">
        <p>
          We may remove accounts that post fake ratings, spam or abuse. We would much rather not,
          and we will always tell you why.
        </p>
      </LegalSection>

      <LegalSection title="Shopping links">
        <p>
          Some links to supermarkets may earn RateMama a small commission. This never influences a
          rating, and any link that earns us something is labelled where you see it.
        </p>
      </LegalSection>

      <LegalSection title="Which law applies">
        <p>These terms are governed by the law of the United Kingdom.</p>
      </LegalSection>

      <LegalSection title="Getting in touch">
        <p>
          Email hello@ratemama.com.{' '}
          <Link href="/privacy" className="font-semibold text-worth underline">
            Our privacy policy
          </Link>{' '}
          explains what we do with your data.
        </p>
      </LegalSection>

      <div className="h-12" />
    </Screen>
  )
}
