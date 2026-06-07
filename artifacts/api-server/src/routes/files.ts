import { Router } from "express";
import { db, filesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListFilesParams,
  CreateFileParams,
  CreateFileBody,
  GetFileParams,
  UpdateFileParams,
  UpdateFileBody,
  DeleteFileParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/projects/:projectId/files", async (req, res) => {
  try {
    const { projectId } = ListFilesParams.parse({ projectId: Number(req.params.projectId) });
    const files = await db
      .select()
      .from(filesTable)
      .where(eq(filesTable.projectId, projectId));
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: "Failed to list files" });
  }
});

router.post("/projects/:projectId/files", async (req, res) => {
  try {
    const { projectId } = CreateFileParams.parse({ projectId: Number(req.params.projectId) });
    const body = CreateFileBody.parse(req.body);
    const [file] = await db
      .insert(filesTable)
      .values({
        projectId,
        name: body.name,
        path: body.path,
        content: body.content ?? "",
        language: body.language,
      })
      .returning();
    res.status(201).json(file);
  } catch (err) {
    res.status(400).json({ error: "Invalid file data" });
  }
});

router.get("/projects/:projectId/files/:fileId", async (req, res) => {
  try {
    const { projectId, fileId } = GetFileParams.parse({
      projectId: Number(req.params.projectId),
      fileId: Number(req.params.fileId),
    });
    const [file] = await db
      .select()
      .from(filesTable)
      .where(and(eq(filesTable.id, fileId), eq(filesTable.projectId, projectId)));
    if (!file) return res.status(404).json({ error: "File not found" });
    res.json(file);
  } catch (err) {
    res.status(500).json({ error: "Failed to get file" });
  }
});

router.put("/projects/:projectId/files/:fileId", async (req, res) => {
  try {
    const { projectId, fileId } = UpdateFileParams.parse({
      projectId: Number(req.params.projectId),
      fileId: Number(req.params.fileId),
    });
    const body = UpdateFileBody.parse(req.body);
    const [updated] = await db
      .update(filesTable)
      .set({ ...body, updatedAt: new Date() })
      .where(and(eq(filesTable.id, fileId), eq(filesTable.projectId, projectId)))
      .returning();
    if (!updated) return res.status(404).json({ error: "File not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Invalid file data" });
  }
});

router.delete("/projects/:projectId/files/:fileId", async (req, res) => {
  try {
    const { projectId, fileId } = DeleteFileParams.parse({
      projectId: Number(req.params.projectId),
      fileId: Number(req.params.fileId),
    });
    await db
      .delete(filesTable)
      .where(and(eq(filesTable.id, fileId), eq(filesTable.projectId, projectId)));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete file" });
  }
});

export default router;
