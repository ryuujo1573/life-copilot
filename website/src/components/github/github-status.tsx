import { component$, useResource$, Resource } from "@builder.io/qwik";

export const GitHubStatus = component$(() => {
  const repoResource = useResource$(async ({ cleanup }) => {
    const controller = new AbortController();
    cleanup(() => controller.abort());

    const response = await fetch(
      "https://api.github.com/repos/ryuujo1573/life-copilot",
      { signal: controller.signal }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch GitHub status");
    }

    return response.json() as Promise<{
      stargazers_count: number;
      pushed_at: string;
    }>;
  });

  return (
    <div class="flex items-center text-xs bg-base-200 border border-base-300 rounded-full px-3 py-1 mr-3 gap-2">
      <Resource
        value={repoResource}
        onPending={() => <span class="opacity-50 italic">Fetching live stats...</span>}
        onRejected={() => <span class="opacity-50">Status unavailable</span>}
        onResolved={(repo) => (
          <div class="flex items-center gap-2">
            <span class="relative flex size-2">
              <span class="absolute inline-flex size-full rounded-full bg-success opacity-75 animate-ping"></span>
              <span class="relative inline-flex size-2 rounded-full bg-success"></span>
            </span>
            <span class="text-base-content/70">
              <strong class="text-base-content">{repo.stargazers_count}</strong> stars
            </span>
            <span class="text-base-content/30">•</span>
            <span class="text-base-content/70">
              Updated{" "}
              <strong class="text-base-content">
                {new Date(repo.pushed_at).toLocaleDateString()}
              </strong>
            </span>
          </div>
        )}
      />
    </div>
  );
});
