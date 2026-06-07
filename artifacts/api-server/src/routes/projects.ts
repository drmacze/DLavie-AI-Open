import { Router } from "express";
import { db, projectsTable, filesTable, messagesTable } from "@workspace/db";
import { eq, desc, count, sql } from "drizzle-orm";
import {
  CreateProjectBody,
  GetProjectParams,
  UpdateProjectParams,
  UpdateProjectBody,
  DeleteProjectParams,
  GetProjectStatsParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/projects", async (req, res) => {
  try {
    const projects = await db
      .select()
      .from(projectsTable)
      .orderBy(desc(projectsTable.updatedAt));
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Failed to list projects" });
  }
});

router.post("/projects", async (req, res) => {
  try {
    const body = CreateProjectBody.parse(req.body);
    const [project] = await db
      .insert(projectsTable)
      .values({
        name: body.name,
        description: body.description ?? null,
        language: body.language,
      })
      .returning();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: "Invalid project data" });
  }
});

router.get("/projects/recent", async (req, res) => {
  try {
    const projects = await db
      .select()
      .from(projectsTable)
      .orderBy(desc(projectsTable.lastAccessedAt))
      .limit(6);
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Failed to list recent projects" });
  }
});

router.get("/projects/:projectId", async (req, res) => {
  try {
    const { projectId } = GetProjectParams.parse({ projectId: Number(req.params.projectId) });
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId));
    if (!project) return res.status(404).json({ error: "Project not found" });

    await db
      .update(projectsTable)
      .set({ lastAccessedAt: new Date() })
      .where(eq(projectsTable.id, projectId));

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: "Failed to get project" });
  }
});

router.patch("/projects/:projectId", async (req, res) => {
  try {
    const { projectId } = UpdateProjectParams.parse({ projectId: Number(req.params.projectId) });
    const body = UpdateProjectBody.parse(req.body);
    const [updated] = await db
      .update(projectsTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(projectsTable.id, projectId))
      .returning();
    if (!updated) return res.status(404).json({ error: "Project not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Invalid update data" });
  }
});

router.delete("/projects/:projectId", async (req, res) => {
  try {
    const { projectId } = DeleteProjectParams.parse({ projectId: Number(req.params.projectId) });
    await db.delete(projectsTable).where(eq(projectsTable.id, projectId));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete project" });
  }
});

router.get("/projects/:projectId/stats", async (req, res) => {
  try {
    const { projectId } = GetProjectStatsParams.parse({ projectId: Number(req.params.projectId) });

    const files = await db
      .select()
      .from(filesTable)
      .where(eq(filesTable.projectId, projectId));

    const fileCount = files.length;
    const totalLines = files.reduce((sum, f) => sum + (f.content?.split("\n").length ?? 0), 0);

    const langMap: Record<string, number> = {};
    for (const f of files) {
      langMap[f.language] = (langMap[f.language] ?? 0) + 1;
    }

    const languages = Object.entries(langMap).map(([language, count]) => ({
      language,
      fileCount: count,
      percentage: fileCount > 0 ? Math.round((count / fileCount) * 100) : 0,
    }));

    res.json({ fileCount, totalLines, languages });
  } catch (err) {
    res.status(500).json({ error: "Failed to get project stats" });
  }
});

export default router;
