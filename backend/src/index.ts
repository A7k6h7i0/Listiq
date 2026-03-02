import 'dotenv/config';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { initSocket } from './services/socket';

import authRoutes from './routes/auth';
import listingsRoutes from './routes/listings';
import favoritesRoutes from './routes/favorites';
import chatRoutes from './routes/chat';
import adminRoutes from './routes/admin';
import paymentRoutes from './routes/payment';
import categoriesRoutes from './routes/categories';
import locationsRoutes from './routes/locations';
import reportsRoutes from './routes/reports';

import { apiLimiter } from './middleware/rateLimiter';

const app: Application = express();
const httpServer = createServer(app);

initSocket(httpServer);

// Render sits behind a reverse proxy. Required for correct client IP/rate limiting behavior.
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', apiLimiter, authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/reports', reportsRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
