import express, { Express } from 'express';
import notificationRouter from './routes/notifications.route';
import todoRouter from './routes/todos.route';

export function createApp(): Express {
  const app = express();

  app.use(express.json());
  app.use('/api/todos', todoRouter);
  app.use('/api/notifications', notificationRouter);

  return app;
}
