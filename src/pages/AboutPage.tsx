import {
  ArrowUpRight,
  Compass,
  Github,
  Globe,
  Instagram,
  Mail,
  MessageSquare,
  Share2,
} from 'lucide-react';
import {CoreResearchMatrix} from '../components/CoreResearchMatrix';
import {GlassIcon} from '../components/GlassIcon';
import {useLanguage} from '../context/LanguageContext';
import {siteConfig} from '../data/siteConfig';
import {
  getActiveChannels,
  getLocalizedList,
  getLocalizedText,
  type ActiveChannel,
} from '../utils/papers';

function getChannelIcon(key: ActiveChannel['key']) {
  switch (key) {
    case 'email':
      return Mail;
    case 'github':
      return Github;
    case 'discord':
      return MessageSquare;
    case 'instagram':
      return Instagram;
    case 'x':
      return Share2;
    case 'website':
      return Globe;
  }
}

export function AboutPage() {
  const {lang, t} = useLanguage();
  const statement = siteConfig.projectStatement;
  const statementTitle = getLocalizedText(statement.title, lang);
  const paragraphs = getLocalizedList(statement.paragraphs, lang);
  const purposeIndex = statement.purposeParagraphIndex;
  const activeChannels = getActiveChannels(siteConfig);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <header className="mb-10 flex items-start gap-4 border-b border-[var(--border-hairline)] pb-8">
        <GlassIcon icon={Compass} size="lg" />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl text-balance">
            {t.about.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
            {t.about.subtitle}
          </p>
        </div>
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
            {activeChannels.map((channel) => {
              const Icon = getChannelIcon(channel.key);
              const label =
                channel.key === 'email'
                  ? t.about.emailLabel
                  : t.about.socialLabels[channel.key];
              const isEmail = channel.key === 'email';

              return (
                <a
                  key={channel.key}
                  href={channel.href}
                  target={isEmail ? undefined : '_blank'}
                  rel={isEmail ? undefined : 'noopener noreferrer'}
                  className="glass-card glass-card-interactive group flex min-h-[76px] items-center justify-between gap-4 rounded-3xl p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <GlassIcon icon={Icon} size="md" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {label}
                      </p>
                      <p className="truncate text-xs text-[var(--text-secondary)]">
                        {channel.label}
                      </p>
                    </div>
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
