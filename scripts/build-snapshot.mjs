import { mkdir, copyFile, writeFile } from "node:fs/promises";

const repo = "leon337/multiagent-collaboration-framework";
const api = `https://api.github.com/repos/${repo}`;
const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "mcf-mission-control-vercel-build"
};

async function get(path) {
  const response = await fetch(api + path, { headers });
  if (!response.ok) throw new Error(`GitHub ${response.status} for ${path}`);
  return response.json();
}

const [branch, release, issues] = await Promise.all([
  get("/branches/main"),
  get("/releases/latest"),
  get("/issues?state=open&sort=updated&direction=desc&per_page=100")
]);

const prs = issues.filter((item) => item.pull_request);
const pureIssues = issues.filter((item) => !item.pull_request);

const snapshot = {
  schema: "mcf_mission_control_snapshot/v1",
  generated_at: new Date().toISOString(),
  repository: repo,
  main: {
    sha: branch.commit.sha,
    url: branch.commit.html_url
  },
  latest_release: {
    tag: release.tag_name,
    sha: release.target_commitish,
    published_at: release.published_at,
    url: release.html_url
  },
  counts: {
    open_pull_requests: prs.length,
    open_issues: pureIssues.length,
    truncated: issues.length === 100
  },
  recent: [...prs.slice(0, 5), ...pureIssues.slice(0, 5)]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 8)
    .map((item) => ({
      type: item.pull_request ? "PR" : "Issue",
      number: item.number,
      title: item.title,
      updated_at: item.updated_at,
      url: item.html_url
    }))
};

await mkdir("dist", { recursive: true });
await copyFile("index.html", "dist/index.html");
await copyFile("client.js", "dist/client.js");
await writeFile("dist/snapshot.json", JSON.stringify(snapshot, null, 2) + "\n");
console.log(JSON.stringify(snapshot));
