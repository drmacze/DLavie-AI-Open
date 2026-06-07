import { Router } from "express";
import { Octokit } from "@octokit/rest";

const router = Router();

function getOctokit() {
  const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
  if (!token) return null;
  return new Octokit({ auth: token });
}

router.get("/github/status", async (_req, res) => {
  const octokit = getOctokit();
  if (!octokit) {
    return res.json({ connected: false, user: null });
  }
  try {
    const { data: user } = await octokit.rest.users.getAuthenticated();
    res.json({ connected: true, user });
  } catch {
    res.json({ connected: false, user: null });
  }
});

router.get("/github/repos", async (_req, res) => {
  const octokit = getOctokit();
  if (!octokit) return res.status(401).json({ error: "GitHub token not configured" });
  try {
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 50,
      visibility: "all",
    });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed to list repos" });
  }
});

router.get("/github/search", async (req, res) => {
  const octokit = getOctokit();
  if (!octokit) return res.status(401).json({ error: "GitHub token not configured" });
  const q = req.query.q as string;
  if (!q) return res.status(400).json({ error: "Query required" });
  try {
    const { data } = await octokit.rest.search.repos({
      q,
      sort: "stars",
      per_page: 10,
    });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Search failed" });
  }
});

router.get("/github/repos/:owner/:repo/contents", async (req, res) => {
  const octokit = getOctokit();
  if (!octokit) return res.status(401).json({ error: "GitHub token not configured" });
  const { owner, repo } = req.params;
  const path = (req.query.path as string) ?? "";
  try {
    const { data } = await octokit.rest.repos.getContent({ owner, repo, path });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed to get contents" });
  }
});

router.get("/github/repos/:owner/:repo/branches", async (req, res) => {
  const octokit = getOctokit();
  if (!octokit) return res.status(401).json({ error: "GitHub token not configured" });
  const { owner, repo } = req.params;
  try {
    const { data } = await octokit.rest.repos.listBranches({ owner, repo, per_page: 30 });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed to get branches" });
  }
});

export default router;
