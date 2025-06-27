import express from 'express';
import mangaRoutes from './modules/manga/routes';

const app = express();

app.use('/api/manga', mangaRoutes);

export default app; 