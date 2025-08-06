import cors from 'cors';
import express from 'express';
import { NotificationService } from './services/notifications.service';
import { TodoService } from './services/todos.service';
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:4200', // Your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

const notificationService = new NotificationService();
const todoService = new TodoService();

app.get('/api/notifications/count', async (req, res) => {
  const count = await notificationService.getNotificationCount();
  res.json({ count });
});

app.get('/api/notifications', async (req, res) => {
  const chatbots = await notificationService.getNotifications();
  res.json(chatbots);
});

app.post('/api/notifications', async (req, res) => {
  const chatbot = await notificationService.createNotification(req.body);
  res.json(chatbot);
});

app.get('/api/todos/count', async (req, res) => {
  const count = await todoService.getTodoCount();
  res.json({ count });
});

app.get('/api/todos', async (req, res) => {
  const models = await todoService.getTodos();
  res.json(models);
});

app.post('/api/todos', async (req, res) => {
  const model = await todoService.createTodo(req.body);
  res.json(model);
});

app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
