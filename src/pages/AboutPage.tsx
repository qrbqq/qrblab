import {ArrowUpRight} from 'lucide-react';
import {CoreResearchMatrix} from '../components/CoreResearchMatrix';
import {useLanguage} from '../context/LanguageContext';
import {siteConfig} from '../data/siteConfig';
import {
  getActiveChannels,
  getLocalizedList,
  getLocalizedText,
} from '../utils/papers';

export function AboutPage() {
  const {lang, t} = useLanguage();
  const statement = siteConfig.projectStatement;
  const statementTitle = getLocalizedText(statement.title, lang);
  const paragraphs = getLocalizedList(statement.paragraphs, lang);
  const purposeIndex = statement.purposeParagraphIndex;
  const activeChannels = getActiveChannels(siteConfig);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <header className="mb-10 border-b border-[var(--border-hairline)] pb-8">
        <p className="font-mono-tabular text-[11px] font-medium tracking-[0.12em] text-[var(--text-eyebrow)]">
          {t.about.eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl text-balance">
          {t.about.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
          {t.about.subtitle}
        </p>
      </header>

      <section aria-labelledby="about-statement-heading">
        <div className="glass-surface rounded-[2rem] p-7 sm:p-10 lg:p-12">
          <h2
            id="about-statement-heading"
            className="text-xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-2xl"
          >
            {statementTitle}
          </h2>
          <div className="mt-6 max-w-3xl space-y-4 text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className={
                  index === purposeIndex
                    ? 'font-semibold text-[var(--text-primary)]'
                    : undefined
                }
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-14 sm:mt-16">
        <CoreResearchMatrix
          eyebrow={t.about.focusEyebrow}
          heading={t.about.focusHeading}
          subheading={t.about.focusSubheading}
        />
      </div>

      {activeChannels.length > 0 ? (
        <section className="mt-14 sm:mt-16" aria-labelledby="about-channels-heading">
          <div className="mb-8">
            <h2
              id="about-channels-heading"
              className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]"
            >
              {t.about.channelsHeading}
            </h2>
            <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
              {t.about.channelsSubheading}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeChannels.map((channel, index) => {
              const label =
                channel.key === 'email'
                  ? t.about.emailLabel
                  : t.about.socialLabels[channel.key];
              const isEmail = channel.key === 'email';
              const indexCode = String(index + 1).padStart(2, '0');

              return (
                <a
                  key={channel.key}
                  href={channel.href}
                  target={isEmail ? undefined : '_blank'}
                  rel={isEmail ? undefined : 'noopener noreferrer'}
                  className="glass-card glass-card-interactive group flex min-h-[76px] items-center justify-between gap-4 rounded-3xl p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-tabular text-[11px] font-medium tracking-wider text-[var(--text-eyebrow)]">
                        {indexCode}
                      </span>
                      <span
                        aria-hidden="true"
                        className="h-px w-4 bg-[var(--border-strong)]"
                      />
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {label}
                      </p>
                    </div>
                    <p className="mt-1.5 truncate text-xs text-[var(--text-secondary)]">
                      {channel.label}
                    </p>
                  </div>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-[var(--text-secondary)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
                    strokeWidth={1.75}
                  />
                </a>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
