import {Link} from 'react-router-dom';
import {ArrowLeft} from 'lucide-react';
import {useLanguage} from '../context/LanguageContext';

export function NotFoundPage() {
  const {t} = useLanguage();

  return (
    <div className="mx-auto flex max-w-2xl flex-1 items-center justify-center px-4 py-20 sm:px-6">
      <div className="glass-card w-full rounded-[2rem] p-10 text-center sm:p-14">
        <div className="mx-auto flex max-w-md flex-col items-center">
          <p className="font-mono-tabular text-xs font-medium tracking-[0.14em] text-[var(--text-eyebrow)]">
            {t.notFound.code}
          </p>
          <span
            aria-hidden="true"
            className="my-4 h-px w-12 bg-[var(--border-strong)]"
          />
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            {t.notFound.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
            {t.notFound.description}
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[var(--btn-primary-bg)] px-6 py-3 text-sm font-medium text-[var(--btn-primary-text)] shadow-xs transition-colors hover:bg-[var(--btn-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] whitespace-nowrap"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" strokeWidth={1.75} />
            <span>{t.notFound.backHome}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
