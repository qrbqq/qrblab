import {ArrowUpRight} from 'lucide-react';
import {CoreResearchMatrix} from '../components/CoreResearchMatrix';
import {KineticHeadline} from '../components/KineticHeadline';
import {ScrollReveal} from '../components/ScrollReveal';
import {siteConfig, siteCopy} from '../data/siteConfig';
import {
  getActiveChannels,
  getLocalizedList,
  getLocalizedText,
} from '../utils/papers';

export function AboutPage() {
  const statement = siteConfig.projectStatement;
  const statementTitle = getLocalizedText(statement.title);
  const paragraphs = getLocalizedList(statement.paragraphs);
  const purposeIndex = statement.purposeParagraphIndex;
  const activeChannels = getActiveChannels(siteConfig);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <header className="mb-10 border-b border-[var(--border-hairline)] pb-8">
        <ScrollReveal staggerIndex={0} className="flex items-center gap-3">
          <p className="font-mono-tabular shrink-0 text-[11px] font-medium tracking-[0.12em] text-[var(--text-eyebrow)]">
            {siteCopy.about.eyebrow}
          </p>
          <span
            aria-hidden="true"
            className="h-px flex-1 bg-[var(--border-hairline)]"
          />
        </ScrollReveal>
        <KineticHeadline
          as="h1"
          text={siteCopy.about.title}
          className="mt-2.5 text-4xl text-[var(--text-primary)] sm:text-5xl"
        />
        <ScrollReveal staggerIndex={2}>
          <p className="font-body-prose mt-2 max-w-2xl text-sm text-[var(--text-secondary)] sm:text-base">
            {siteCopy.about.subtitle}
          </p>
        </ScrollReveal>
      </header>

      <section aria-labelledby="about-statement-heading" className="border-t border-white/[0.08] py-16 sm:py-20">
        <KineticHeadline
          as="h2"
          id="about-statement-heading"
          text={statementTitle}
          className="text-3xl text-[var(--text-primary)] sm:text-4xl"
        />
        <div className="font-body-prose mt-6 max-w-3xl space-y-4 text-sm text-[var(--text-secondary)] sm:text-base">
          {paragraphs.map((paragraph, index) => (
            <ScrollReveal
              key={index}
              as="p"
              staggerIndex={Math.min(index + 1, 5)}
              className={
                index === purposeIndex
                  ? 'font-semibold text-[var(--text-primary)]'
                  : undefined
              }
            >
              {paragraph}
            </ScrollReveal>
          ))}
        </div>
      </section>

      <div className="border-t border-white/[0.08] py-16 sm:py-20">
        <CoreResearchMatrix
          eyebrow={siteCopy.about.focusEyebrow}
          heading={siteCopy.about.focusHeading}
          subheading={siteCopy.about.focusSubheading}
        />
      </div>

      {activeChannels.length > 0 ? (
        <section className="border-t border-white/[0.08] py-16 sm:py-20" aria-labelledby="about-channels-heading">
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <KineticHeadline
                as="h2"
                id="about-channels-heading"
                text={siteCopy.about.channelsHeading}
                className="shrink-0 text-3xl text-[var(--text-primary)] sm:text-4xl"
              />
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-[var(--border-hairline)]"
              />
            </div>
            <ScrollReveal staggerIndex={1}>
              <p className="font-body-prose mt-1.5 text-sm text-[var(--text-secondary)]">
                {siteCopy.about.channelsSubheading}
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {activeChannels.map((channel, index) => {
              const label =
                channel.key === 'email'
                  ? siteCopy.about.emailLabel
                  : siteCopy.about.socialLabels[channel.key];
              const isEmail = channel.key === 'email';
              const indexCode = String(index + 1).padStart(2, '0');

              return (
                <ScrollReveal
                  key={channel.key}
                  staggerIndex={index % 3}
                  className="h-full"
                >
                  <a
                    href={channel.href}
                    target={isEmail ? undefined : '_blank'}
                    rel={isEmail ? undefined : 'noopener noreferrer'}
                    className="group flex h-full min-h-[72px] items-center justify-between gap-4 border-t border-white/[0.08] py-5 transition-colors hover:border-white/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus-ring)]"
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
                      className="h-4 w-4 shrink-0 text-[var(--text-secondary)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--text-primary)]"
                      strokeWidth={1.75}
                    />
                  </a>
                </ScrollReveal>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
