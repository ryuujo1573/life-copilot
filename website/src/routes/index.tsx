import { component$ } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";

const FEATURES = [
  {
    icon: "⚡",
    title: "Brain Dump",
    desc: "Capture anything in under 2 seconds. No category required.",
  },
  {
    icon: "🔌",
    title: "Plugin System",
    desc: "Core features are plugins. Stable, documented, extensible.",
  },
  {
    icon: "📴",
    title: "Local-First",
    desc: "Your data lives on your device. No mandatory cloud.",
  },
  {
    icon: "📱",
    title: "Desktop & Mobile",
    desc: "Native Tauri 2.0 app. Windows, macOS, Linux, iOS, Android.",
  },
];

const SPEC_LINKS = [
  { label: "System Architecture", href: "/docs/architecture/", desc: "Two-layer Rust/frontend model and IPC contract" },
  { label: "Plugin API", href: "/docs/plugins/", desc: "Event bus, lifecycle hooks, and TypeScript interfaces" },
  { label: "ADHD UX Guidelines", href: "/docs/adhd-ux/", desc: "Design principles that double as acceptance criteria" },
  { label: "Database Schema", href: "/docs/database/", desc: "SQLite entities, conventions, and sync strategy" },
  { label: "Tauri 2.0 Platform", href: "/docs/tauri/", desc: "Project structure, capabilities, and mobile setup" },
];

export default component$(() => {
  return (
    <div class="home">
      {/* Hero */}
      <header class="home-hero">
        <div class="home-hero__inner">
          <p class="home-hero__eyebrow">Specification · v0.1</p>
          <h1 class="home-hero__title">Life Copilot</h1>
          <p class="home-hero__subtitle">
            A local-first, extensible personal-organization app for people with
            ADHD — built on Tauri 2.0 with a stable plugin API.
          </p>
          <div class="home-hero__actions">
            <Link href="/docs/" class="btn btn--primary">
              Read the Spec →
            </Link>
            <a
              href="https://github.com/ryuujo1573/life-copilot"
              target="_blank"
              rel="noreferrer"
              class="btn btn--ghost"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Features */}
      <section class="home-section">
        <div class="home-section__inner">
          <h2 class="home-section__heading">Built for Executive Dysfunction</h2>
          <div class="feature-grid">
            {FEATURES.map((f) => (
              <div key={f.title} class="feature-card">
                <span class="feature-card__icon">{f.icon}</span>
                <h3 class="feature-card__title">{f.title}</h3>
                <p class="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spec Links */}
      <section class="home-section home-section--alt">
        <div class="home-section__inner">
          <h2 class="home-section__heading">Specification Sections</h2>
          <ul class="spec-list">
            {SPEC_LINKS.map((s) => (
              <li key={s.href}>
                <Link href={s.href} class="spec-link">
                  <span class="spec-link__label">{s.label}</span>
                  <span class="spec-link__desc">{s.desc}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <style>{`
        .home { min-height: 100dvh; }

        /* Hero */
        .home-hero {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 60dvh;
          padding: var(--space-16) var(--space-6);
          text-align: center;
          background: radial-gradient(
            ellipse 80% 60% at 50% -10%,
            color-mix(in srgb, var(--color-primary) 18%, transparent),
            transparent
          );
        }
        .home-hero__inner { max-width: 640px; }
        .home-hero__eyebrow {
          font-size: var(--text-sm);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-primary);
          margin-bottom: var(--space-3);
        }
        .home-hero__title {
          font-size: clamp(2.5rem, 8vw, 4rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          margin: 0;
          background: linear-gradient(135deg, var(--color-text) 40%, var(--color-primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .home-hero__subtitle {
          font-size: var(--text-lg);
          color: var(--color-text-muted);
          max-width: 520px;
          margin: var(--space-4) auto 0;
        }
        .home-hero__actions {
          display: flex;
          gap: var(--space-3);
          justify-content: center;
          margin-top: var(--space-8);
          flex-wrap: wrap;
        }

        /* Buttons */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-6);
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: var(--text-sm);
          transition: all 0.15s;
          cursor: pointer;
        }
        .btn:hover { text-decoration: none; }
        .btn--primary {
          background: var(--color-primary);
          color: #fff;
        }
        .btn--primary:hover { background: var(--color-primary-hover); color: #fff; }
        .btn--ghost {
          border: 1px solid var(--color-border);
          color: var(--color-text-muted);
          background: transparent;
        }
        .btn--ghost:hover { border-color: var(--color-text-muted); color: var(--color-text); }

        /* Sections */
        .home-section { padding: var(--space-16) var(--space-6); }
        .home-section--alt { background: var(--color-bg-raised); }
        .home-section__inner { max-width: 900px; margin: 0 auto; }
        .home-section__heading {
          font-size: var(--text-2xl);
          font-weight: 700;
          margin: 0 0 var(--space-8);
        }

        /* Feature grid */
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-4);
        }
        .feature-card {
          background: var(--color-bg-raised);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
        }
        .feature-card__icon { font-size: 1.75rem; display: block; margin-bottom: var(--space-3); }
        .feature-card__title { font-size: var(--text-base); font-weight: 600; margin: 0; }
        .feature-card__desc { font-size: var(--text-sm); color: var(--color-text-muted); margin-top: var(--space-2); }

        /* Spec list */
        .spec-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-2); }
        .spec-link {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          padding: var(--space-4) var(--space-6);
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          transition: border-color 0.15s;
        }
        .spec-link:hover { border-color: var(--color-primary); text-decoration: none; }
        .spec-link__label { font-weight: 600; font-size: var(--text-base); color: var(--color-text); }
        .spec-link__desc { font-size: var(--text-sm); color: var(--color-text-muted); }
      `}</style>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Life Copilot — Specification",
  meta: [
    {
      name: "description",
      content:
        "A local-first, extensible personal-organization app for ADHD. Built on Tauri 2.0 with a plugin API designed for stability.",
    },
  ],
};

