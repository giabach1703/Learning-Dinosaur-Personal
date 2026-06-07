import express, { Request, Response } from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes';
import deckRoutes from './routes/deckRoutes';
import cardRoutes from './routes/cardRoutes';
import studyRoutes from './routes/studyRoutes';
import statsRoutes from './routes/statsRoutes';
import searchRoutes from './routes/searchRoutes';
import badgeRoutes from './routes/badgeRoutes';
import errorMiddleware from './middleware/errorMiddleware';

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }),
);

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Learning Dinosaur API is running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/decks', deckRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/badges', badgeRoutes);

app.use(errorMiddleware);

export default app;
