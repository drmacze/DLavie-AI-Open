import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectsRouter from "./projects";
import filesRouter from "./files";
import aiRouter from "./ai";
import githubRouter from "./github";
import knowledgeRouter from "./knowledge";
import plansRouter from "./plans";

const router: IRouter = Router();

router.use(healthRouter);
router.use(projectsRouter);
router.use(filesRouter);
router.use(aiRouter);
router.use(githubRouter);
router.use(knowledgeRouter);
router.use(plansRouter);

export default router;
