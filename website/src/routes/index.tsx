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
  {
    label: "System Architecture",
    href: "/docs/architecture/",
    desc: "Two-layer Rust/frontend model and IPC contract",
  },
  {
    label: "Plugin API",
    href: "/docs/plugins/",
    desc: "Event bus, lifecycle hooks, and TypeScript interfaces",
  },
  {
    label: "ADHD UX Guidelines",
    href: "/docs/adhd-ux/",
    desc: "Design principles that double as acceptance criteria",
  },
  {
    label: "Database Schema",
    href: "/docs/database/",
    desc: "SQLite entities, conventions, and sync strategy",
  },
  {
    label: "Tauri 2.0 Platform",
    href: "/docs/tauri/",
    desc: "Project structure, capabilities, and mobile setup",
  },
];

export default component$(() => {
  return (
    <div class="min-h-dvh">
      {/* Hero */}
      <header class="flex items-center justify-center min-h-[60dvh] px-6 py-20 text-center bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,106,247,0.15),transparent)]">
        <div class="max-w-xl">
          <p class="text-sm font-semibold uppercase tracking-widest text-[var(--color-primary)] mb-3">
            Specification · v0.1
          </p>
          <h1 class="text-5xl font-extrabold tracking-tight leading-tight bg-gradient-to-br from-[var(--color-text)] to-[var(--color-primary)] bg-clip-text text-transparent">
            Life Copilot
          </h1>
          <p class="text-lg text-[var(--color-text-muted)] max-w-md mx-auto mt-5 leading-relaxed">
            A local-first, extensible personal-organization app for people with
            ADHD — built on Tauri 2.0 with a stable plugin API.
          </p>
          <div class="flex gap-3 justify-center mt-8 flex-wrap">
            <Link
              href="/docs/"
              class="inline-flex items-center px-6 py-2.5 rounded-lg bg-[var(--color-primary)] text-white font-semibold text-sm hover:bg-[var(--color-primary-hover)] hover:no-underline transition-colors"
            >
              Read the Spec →
            </Link>
            <a
              href="https://github.com/ryuujo1573/life-copilot"
              target="_blank"
              rel="noreferrer"
              class="inline-flex items-center px-6 py-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] font-semibold text-sm hover:border-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:no-underline transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Features */}
      <section class="px-6 py-20">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-2xl font-bold tracking-tight text-[var(--color-text)]">
            Built for Executive Dysfunction
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                class="bg-[var(--color-bg-raised)] border border-[var(--color-border)] rounded-xl p-6"
              >
                <span class="text-2xl block mb-3">{f.icon}</span>
                <h3 class="text-base font-semibold text-[var(--color-text)]">
                  {f.title}
                </h3>
                <p class="text-sm text-[var(--color-text-muted)] mt-1.5 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spec Links */}
      <section class="px-6 py-20 bg-[var(--color-bg-raised)]">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-2xl font-bold tracking-tight text-[var(--color-text)]">
            Specification Sections
          </h2>
          <ul class="flex flex-col gap-3 mt-8 list-none p-0">
            {SPEC_LINKS.map((s) => (
              <li key={s.href} class="m-0 p-0">
                <Link
                  href={s.href}
                  class="flex flex-col gap-1 p-5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-primary)] hover:no-underline transition-colors"
                >
                  <span class="font-semibold text-base text-[var(--color-text)]">
                    {s.label}
                  </span>
                  <span class="text-sm text-[var(--color-text-muted)]">
                    {s.desc}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
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
