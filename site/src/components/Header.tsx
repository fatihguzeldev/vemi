import { Moon, Sun } from 'lucide-preact'
import { LocaleToggle } from './LocaleToggle'
import { useTheme } from '../context/ThemeContext'
import { useT } from '../context/LocaleContext'
import { ui } from '../content/ui'
import { GitHubIcon, LinkedInIcon, WebsiteIcon, XIcon, YouTubeIcon } from './SocialIcons'

const socials = [
  { href: 'https://x.com/fatihguzeldev', label: 'X (Twitter)', icon: XIcon },
  { href: 'https://github.com/fatihguzeldev', label: 'GitHub', icon: GitHubIcon },
  { href: 'https://linkedin.com/in/fatih-guzel', label: 'LinkedIn', icon: LinkedInIcon },
  { href: 'https://youtube.com/@fatihlovestosimplify', label: 'YouTube', icon: YouTubeIcon },
  { href: 'https://fatihguzel.dev', label: 'Website', icon: WebsiteIcon },
] as const

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const homeLabel = useT(ui.homeLabel)
  const themeLabel = useT(theme === 'light' ? ui.themeLight : ui.themeDark)

  return (
    <header class="header">
      <a href="#welcome" class="header__logo" aria-label={homeLabel}>
        vemi
      </a>
      <div class="header__controls">
        <LocaleToggle />
        <button
          type="button"
          class="header__icon-btn"
          onMouseDown={(e) => e.preventDefault()}
          onClick={toggleTheme}
          aria-label={themeLabel}
        >
          {theme === 'light' ? <Moon size={16} strokeWidth={1.5} /> : <Sun size={16} strokeWidth={1.5} />}
        </button>
      </div>
    </header>
  )
}

export function Footer() {
  const builtBy = useT(ui.footerBuiltBy)
  const socialLinks = useT(ui.socialLinks)

  return (
    <footer class="footer">
      <nav class="footer__socials" aria-label={socialLinks}>
        {socials.map(({ href, label, icon: Icon }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            class="footer__icon-link"
            aria-label={label}
          >
            <Icon size={15} />
          </a>
        ))}
      </nav>
      <p class="footer__credit">
        {builtBy}{' '}
        <a href="https://fatihguzel.dev" target="_blank" rel="noopener noreferrer">
          Fatih Guzel
        </a>
      </p>
      <p class="footer__links">
        <a href="https://www.npmjs.com/package/@fatihguzeldev/vemi" target="_blank" rel="noopener noreferrer">
          npm
        </a>
        {' · '}
        <a href="https://github.com/fatihguzeldev/vemi" target="_blank" rel="noopener noreferrer">
          github
        </a>
      </p>
    </footer>
  )
}
