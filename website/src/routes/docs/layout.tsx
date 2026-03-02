import { component$, Slot } from "@builder.io/qwik";
import { Link, useLocation, useDocumentHead } from "@builder.io/qwik-city";
import { GitHubStatus } from "../../components/github/github-status";

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
      { label: "Roadmap", href: "/docs/roadmap/" },
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
    items: [{ label: "Plugin API", href: "/docs/plugins/" }],
  },
  {
    title: "Design",
    items: [{ label: "ADHD UX Guidelines", href: "/docs/adhd-ux/" }],
  },
];

export default component$(() => {
  const loc = useLocation();
  const head = useDocumentHead();

  const githubBase =
    "https://github.com/ryuujo1573/life-copilot/edit/main/website/src/routes";
  const editUrl = `${githubBase}${loc.url.pathname}${
    loc.url.pathname.endsWith("/") ? "index.mdx" : ".mdx"
  }`;

  const lastUpdated = head.frontmatter?.lastUpdated;

  return (
    <div class="flex flex-col min-h-screen">
      {/* Sticky Header */}
      <header class="navbar sticky top-0 z-40 min-h-14 h-14 border-b border-base-300 bg-base-100 px-6">
        <div class="navbar-start gap-4">
          <Link
            href="/"
            class="text-lg font-bold tracking-tight text-base-content hover:text-primary hover:no-underline"
          >
            Life Copilot
          </Link>
          <span class="badge badge-primary badge-soft badge-sm font-semibold uppercase tracking-wide">
            Specification
          </span>
        </div>
        <div class="navbar-end gap-3">
          <GitHubStatus />
          <a
            href="https://github.com/ryuujo1573/life-copilot"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-ghost btn-sm btn-square text-base-content/60 hover:text-base-content"
            aria-label="GitHub Repository"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
        </div>
      </header>

      {/* Shell */}
      <div class="flex flex-1 max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <aside class="max-md:hidden sticky top-14 self-start w-64 shrink-0 h-[calc(100dvh-3.5rem)] overflow-y-auto border-r border-base-300 py-6 px-4 scrollbar-thin">
          <nav aria-label="Documentation navigation">
            {NAV.map((section) => (
              <div key={section.title} class="mb-6">
                <p class="text-xs font-bold uppercase tracking-widest text-base-content/50 px-3 mb-1">
                  {section.title}
                </p>
                <ul class="menu menu-sm p-0 gap-0.5">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        class={loc.url.pathname === item.href ? "active" : ""}
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

        {/* Content */}
        <main class="flex-1 min-w-0 p-8 xl:px-12 max-md:px-4 max-md:py-6">
          <article class="docs-article max-w-195 pb-16">
            <Slot />
            <footer class="mt-12 pt-6 border-t border-base-300">
              <div class="flex justify-between items-center text-sm text-base-content/60">
                {lastUpdated && (
                  <span>
                    Last updated:{" "}
                    {new Date(lastUpdated).toLocaleDateString()}
                  </span>
                )}
                <a
                  href={editUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link link-primary font-medium ml-auto"
                >
                  Edit this page
                </a>
              </div>
            </footer>
          </article>
        </main>
      </div>
    </div>
  );
});
