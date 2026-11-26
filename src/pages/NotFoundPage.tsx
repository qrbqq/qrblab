import {Link} from 'react-router-dom';
import {ArrowLeft} from 'lucide-react';
import {ScrollReveal} from '../components/ScrollReveal';
import {siteCopy} from '../data/siteConfig';

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-1 items-center justify-center px-4 py-20 sm:px-6">
      <div className="glass-card w-full rounded-[2rem] p-10 text-center sm:p-14">
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
          <ScrollReveal staggerIndex={1}>
            <h1 className="font-display-hero text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
              {siteCopy.notFound.title}
            </h1>
          </ScrollReveal>
          <ScrollReveal staggerIndex={2}>
            <p className="font-body-prose mt-3 text-sm text-[var(--text-secondary)]">
              {siteCopy.notFound.description}
            </p>
          </ScrollReveal>
          <ScrollReveal staggerIndex={3}>
            <Link
              to="/"
              className="mt-8 inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[var(--btn-primary-bg)] px-6 py-3 text-sm font-medium text-[var(--btn-primary-text)] shadow-xs transition-colors hover:bg-[var(--btn-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
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
