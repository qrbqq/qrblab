import {useState} from 'react';
import {Link} from 'react-router-dom';
import {useLanguage} from '../context/LanguageContext';
import {siteConfig} from '../data/siteConfig';
import {getActiveChannels, getLocalizedText, resolveAssetUrl} from '../utils/papers';

export function Footer() {
  const {lang, t} = useLanguage();
  const [logoError, setLogoError] = useState(false);
  const currentYear = new Date().getFullYear();
  const activeChannels = getActiveChannels(siteConfig);
  const tagline = getLocalizedText(siteConfig.tagline, lang).trim() || t.footer.tagline;
  const logoSrc = resolveAssetUrl('images/logo.png', import.meta.env.BASE_URL);

  return (
    <footer className="mt-auto border-t border-[var(--border-hairline)] bg-[var(--bg-surface)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          {!logoError ? (
            <img
              src={logoSrc}
              alt=""
              aria-hidden="true"
              onError={() => setLogoError(true)}
              className="brand-logo-img h-7 w-auto shrink-0 object-contain"
            />
          ) : null}
          <div>
            <Link
              to="/"
              className="text-sm font-bold tracking-tight text-[var(--text-primary)]"
            >
              {siteConfig.brandName}
            </Link>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{tagline}</p>
          </div>
        </div>

        <nav
          aria-label={t.footer.navigationLabel}
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-[var(--text-secondary)]"
        >
          <Link
            to="/"
            className="transition-colors hover:text-[var(--text-primary)] whitespace-nowrap"
          >
            {t.nav.home}
          </Link>
          <Link
            to="/research"
            className="transition-colors hover:text-[var(--text-primary)] whitespace-nowrap"
          >
            {t.nav.research}
          </Link>
          <Link
            to="/about"
            className="transition-colors hover:text-[var(--text-primary)] whitespace-nowrap"
          >
            {t.nav.about}
          </Link>
          {activeChannels.map((channel) => {
            const label =
              channel.key === 'email'
                ? t.about.emailLabel
                : t.about.socialLabels[channel.key];
            return (
              <a
                key={channel.key}
                href={channel.href}
                target={channel.key === 'email' ? undefined : '_blank'}
                rel={channel.key === 'email' ? undefined : 'noopener noreferrer'}
                className="transition-colors hover:text-[var(--text-primary)] whitespace-nowrap"
              >
                {label}
              </a>
            );
          })}
        </nav>

        <p className="font-mono-tabular text-xs text-[var(--text-secondary)]">
          © {currentYear} {t.footer.copyright}
        </p>
      </div>
    </footer>
  );
}
