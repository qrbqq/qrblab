import {Link} from 'react-router-dom';
import {siteConfig, siteCopy} from '../data/siteConfig';
import {useQScore} from '../hooks/useQScore';
import {getActiveChannels, getLocalizedText} from '../utils/papers';
import {QMetricBadge} from './QMetricBadge';
import {ScrollReveal} from './ScrollReveal';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const qScore = useQScore();
  const activeChannels = getActiveChannels(siteConfig);
  const tagline =
    getLocalizedText(siteConfig.tagline).trim() || siteCopy.footer.tagline;

  return (
    <footer className="font-ui-sans mt-auto border-t border-[var(--border-hairline)] bg-[var(--bg-canvas)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <ScrollReveal staggerIndex={0} className="flex items-center gap-3">
          <Link
            to="/"
            aria-label="0101 Home"
            className="group flex items-center gap-3 transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus-ring)]"
          >
            <span
              className="inline-flex h-8 px-2.5 items-center justify-center rounded-lg border border-white/[0.18] bg-white/[0.04] font-bold text-[#FFFFFF] text-xs sm:text-sm tracking-[0.06em] tabular-nums select-none shadow-[0_2px_10px_rgba(0,0,0,0.5)] group-hover:border-white/30"
              style={{
                fontFamily: 'var(--font-oxanium)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              0101
            </span>
            <div>
              <span className="normal-case text-sm font-bold tracking-tight text-[var(--text-primary)]">
                {siteConfig.brandName}
              </span>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{tagline}</p>
            </div>
          </Link>
        </ScrollReveal>

        <ScrollReveal staggerIndex={1}>
          <nav
            aria-label={siteCopy.footer.navigationLabel}
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-[var(--text-secondary)]"
          >
            <Link
              to="/"
              className="whitespace-nowrap transition-colors hover:text-[var(--text-primary)]"
            >
              {siteCopy.nav.home}
            </Link>
            <Link
              to="/qrb-lab"
              className="normal-case whitespace-nowrap transition-colors hover:text-[var(--text-primary)]"
            >
              {siteCopy.nav.qrbLab}
            </Link>
            <Link
              to="/log"
              className="whitespace-nowrap transition-colors hover:text-[var(--text-primary)]"
            >
              {siteCopy.nav.labLog}
            </Link>
            <Link
              to="/about"
              className="whitespace-nowrap transition-colors hover:text-[var(--text-primary)]"
            >
              {siteCopy.nav.about}
            </Link>
            {activeChannels.map((channel) => {
              const label =
                channel.key === 'email'
                  ? siteCopy.about.emailLabel
                  : siteCopy.about.socialLabels[channel.key];
              return (
                <a
                  key={channel.key}
                  href={channel.href}
                  target={channel.key === 'email' ? undefined : '_blank'}
                  rel={channel.key === 'email' ? undefined : 'noopener noreferrer'}
                  className="whitespace-nowrap transition-colors hover:text-[var(--text-primary)]"
                >
                  {label}
                </a>
              );
            })}
          </nav>
        </ScrollReveal>

        <ScrollReveal staggerIndex={2}>
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-[var(--text-secondary)]">
            <p className="font-mono-tabular">
              © {currentYear} {siteCopy.footer.copyright}
            </p>
            <span aria-hidden="true" className="text-white/25">
              ·
            </span>
            <Link
              to="/log"
              aria-label={`View Founder Profile (${qScore.label})`}
              className="inline-flex items-center transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus-ring)]"
            >
              <QMetricBadge score={qScore} variant="inline" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
}
