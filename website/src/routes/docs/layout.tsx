import { component$, Slot } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";

interface NavItem {
  label: string;
  href: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Introduction", href: "/docs/" },
    ],
  },
  {
    title: "Specification",
    items: [
      { label: "System Architecture", href: "/docs/architecture/" },
      { label: "Tauri 2.0 Platform", href: "/docs/tauri/" },
      { label: "Local-First Database", href: "/docs/database/" },
    ],
  },
  {
    title: "Extensibility",
    items: [
      { label: "Plugin API", href: "/docs/plugins/" },
    ],
  },
  {
    title: "Design",
    items: [
      { label: "ADHD UX Guidelines", href: "/docs/adhd-ux/" },
    ],
  },
];

export default component$(() => {
  const loc = useLocation();

  return (
    <div class="docs-root">
      <header class="docs-header">
        <Link href="/" class="docs-header__logo">
          Life Copilot
        </Link>
        <span class="docs-header__badge">Specification</span>
      </header>

      <div class="docs-shell">
        <aside class="docs-sidebar">
          <nav aria-label="Documentation navigation">
            {NAV.map((section) => (
              <div key={section.title} class="docs-nav-section">
                <p class="docs-nav-section__title">{section.title}</p>
                <ul class="docs-nav-list">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        class={[
                          "docs-nav-link",
                          loc.url.pathname === item.href
                            ? "docs-nav-link--active"
                            : "",
                        ].join(" ")}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <main class="docs-content">
          <article class="docs-article">
            <Slot />
          </article>
        </main>
      </div>

      <style>{`
        .docs-root {
          display: flex;
          flex-direction: column;
          min-height: 100dvh;
        }

        /* Header */
        .docs-header {
          position: sticky;
          top: 0;
          z-index: 40;
          height: var(--header-height);
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: 0 var(--space-6);
          background: var(--color-bg);
          border-bottom: 1px solid var(--color-border);
        }
        .docs-header__logo {
          font-weight: 700;
          font-size: var(--text-lg);
          color: var(--color-text);
          letter-spacing: -0.02em;
        }
        .docs-header__logo:hover { text-decoration: none; color: var(--color-primary); }
        .docs-header__badge {
          font-size: var(--text-xs);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-primary);
          background: color-mix(in srgb, var(--color-primary) 12%, transparent);
          padding: 2px 8px;
          border-radius: 999px;
          border: 1px solid color-mix(in srgb, var(--color-primary) 30%, transparent);
        }

        /* Shell */
        .docs-shell {
          display: flex;
          flex: 1;
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
        }

        /* Sidebar */
        .docs-sidebar {
          position: sticky;
          top: var(--header-height);
          align-self: flex-start;
          width: var(--sidebar-width);
          flex-shrink: 0;
          height: calc(100dvh - var(--header-height));
          overflow-y: auto;
          padding: var(--space-6) var(--space-4);
          border-right: 1px solid var(--color-border);
          scrollbar-width: thin;
        }
        .docs-nav-section { margin-bottom: var(--space-6); }
        .docs-nav-section__title {
          font-size: var(--text-xs);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-text-muted);
          padding: 0 var(--space-3);
          margin-bottom: var(--space-2);
        }
        .docs-nav-list { list-style: none; padding: 0; margin: 0; }
        .docs-nav-link {
          display: block;
          padding: var(--space-2) var(--space-3);
          font-size: var(--text-sm);
          color: var(--color-text-muted);
          border-radius: var(--radius-md);
          transition: color 0.15s, background 0.15s;
        }
        .docs-nav-link:hover {
          color: var(--color-text);
          background: var(--color-bg-raised);
          text-decoration: none;
        }
        .docs-nav-link--active {
          color: var(--color-primary);
          background: color-mix(in srgb, var(--color-primary) 10%, transparent);
          font-weight: 500;
        }
        .docs-nav-link--active:hover { color: var(--color-primary); }

        /* Content */
        .docs-content {
          flex: 1;
          min-width: 0;
          padding: var(--space-8) var(--space-12);
        }
        .docs-article {
          max-width: var(--content-max-width);
          padding-bottom: var(--space-16);
        }
        .docs-article > h1:first-child { margin-top: 0; }
        .docs-article > h2:first-of-type { margin-top: var(--space-8); }

        /* Responsive */
        @media (max-width: 768px) {
          .docs-sidebar { display: none; }
          .docs-content { padding: var(--space-6) var(--space-4); }
        }
      `}</style>
    </div>
  );
});
