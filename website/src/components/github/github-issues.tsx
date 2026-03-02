import { component$, useResource$, Resource } from "@builder.io/qwik";

export interface GitHubIssue {
  number: number;
  title: string;
  state: "open" | "closed";
  html_url: string;
  pull_request?: object;
  assignees: any[];
}

export interface GitHubIssuesProps {
  ids: number[];
}

export const GitHubIssues = component$((props: GitHubIssuesProps) => {
  const issuesResource = useResource$<GitHubIssue[]>(async ({ cleanup }) => {
    const controller = new AbortController();
    cleanup(() => controller.abort());

    // Fetching issues from GitHub API
    // We fetch a larger batch and filter by the requested IDs to minimize requests
    const response = await fetch(
      "https://api.github.com/repos/ryuujo1573/life-copilot/issues?state=all&per_page=100",
      { signal: controller.signal }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch issues from GitHub");
    }

    const allIssues: GitHubIssue[] = await response.json();
    return allIssues
      .filter((issue) => props.ids.includes(issue.number))
      .sort((a, b) => props.ids.indexOf(a.number) - props.ids.indexOf(b.number));
  });

  return (
    <div class="overflow-x-auto my-6">
      <Resource
        value={issuesResource}
        onPending={() => (
          <p class="text-base-content/50 italic text-sm py-4">Syncing with GitHub...</p>
        )}
        onRejected={() => (
          <p class="text-error text-sm py-4">Failed to load issues.</p>
        )}
        onResolved={(issues) => (
          <table class="table table-pin-rows">
            <thead>
              <tr>
                <th class="w-20">#</th>
                <th>Task</th>
                <th class="w-36">Status</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => {
                const isDone = issue.state === "closed";
                const isInProgress =
                  issue.assignees.length > 0 || !!issue.pull_request;

                return (
                  <tr key={issue.number} class="hover">
                    <td>
                      <a
                        href={issue.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="link link-hover font-mono text-sm text-base-content/60"
                      >
                        #{issue.number}
                      </a>
                    </td>
                    <td class="font-medium">{issue.title}</td>
                    <td>
                      <span
                        class={`badge badge-sm badge-soft ${
                          isDone
                            ? "badge-success"
                            : isInProgress
                              ? "badge-warning"
                              : "badge-neutral"
                        }`}
                      >
                        {isDone
                          ? "✅ Done"
                          : isInProgress
                            ? "🔄 In Progress"
                            : "🔲 Planned"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      />
    </div>
  );
});
