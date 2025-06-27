import { Router, Request, Response } from 'express';
import { wrapHandler, wrapAuthHandler } from '../../modules/shared/types';
import { mangaService } from './services';
import { MangaProject, MangaChapter, MangaPage, Panel, AIAssistantPrompt } from './types';

const router = Router();

// Project routes
router.post('/projects', wrapAuthHandler(async (req: Request, res: Response) => {
  const { title, style, metadata } = req.body;
  const project = await mangaService.createProject(title, style, metadata);
  return res.json(project);
}));

router.get('/projects/:id', wrapAuthHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const project = await mangaService.getProject(id);
  return res.json(project);
}));

router.put('/projects/:id', wrapAuthHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const project = await mangaService.updateProject(id, req.body);
  return res.json(project);
}));

router.delete('/projects/:id', wrapAuthHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await mangaService.deleteProject(id);
  return res.sendStatus(204);
}));

// Chapter routes
router.post('/chapters', wrapAuthHandler(async (req: Request, res: Response) => {
  const { projectId, title } = req.body;
  const chapter = await mangaService.addChapter(projectId, title);
  return res.json(chapter);
}));

// Page routes
router.post('/pages', wrapAuthHandler(async (req: Request, res: Response) => {
  const { chapterId, layout } = req.body;
  const page = await mangaService.addPage(chapterId, layout);
  return res.json(page);
}));

// Panel routes
router.put('/panels/:id', wrapAuthHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const panel = await mangaService.updatePanel(id, req.body);
  return res.json(panel);
}));

// AI assistance routes
router.post('/ai/assist', wrapAuthHandler(async (req: Request, res: Response) => {
  const prompt: AIAssistantPrompt = req.body;
  const response = await mangaService.generateAIAssistance(prompt);
  return res.json({ response });
}));

// Writing project import route
router.post('/import/writing', wrapAuthHandler(async (req: Request, res: Response) => {
  const { writingProject } = req.body;
  const project = await mangaService.importFromWritingProject(writingProject);
  return res.json(project);
}));

export const mangaRouter = router;
export default router; 