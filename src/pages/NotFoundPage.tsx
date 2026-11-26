import {Link} from 'react-router-dom';
import {ArrowLeft} from 'lucide-react';
import {KineticHeadline} from '../components/KineticHeadline';
import {ScrollReveal} from '../components/ScrollReveal';
import {siteCopy} from '../data/siteConfig';

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-1 items-center justify-center px-4 py-20 sm:px-6">
      <div className="w-full py-10 text-center sm:py-14">
        <div className="mx-auto flex max-w-md flex-col items-center">
          <ScrollReveal staggerIndex={0} className="flex flex-col items-center">
            <p className="font-mono-tabular text-xs font-medium tracking-[0.14em] text-[var(--text-eyebrow)]">
              {siteCopy.notFound.code}
            </p>
            <span
              aria-hidden="true"
              className="my-4 h-px w-12 bg-[var(--border-strong)]"
            />
          </ScrollReveal>
          <KineticHeadline
            as="h1"
            text={siteCopy.notFound.title}
            className="text-3xl text-[var(--text-primary)] sm:text-4xl"
          />
          <ScrollReveal staggerIndex={2}>
            <p className="font-body-prose mt-3 text-sm text-[var(--text-secondary)]">
              {siteCopy.notFound.description}
            </p>
          </ScrollReveal>
          <ScrollReveal staggerIndex={3}>
            <Link
              to="/"
              className="mt-8 inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap border-b border-white/30 pb-1 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus-ring)]"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
              <span>{siteCopy.notFound.backHome}</span>
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
