import express, { Request, Response } from 'express';
import { TodoService } from '../services/todos.service';

const router = express.Router();
const todoService = new TodoService();

router.get('/todos/count', async (req: Request, res: Response) => {
  try {
    const count = await todoService.getTodoCount();
    res.json({ count });
  } catch (error) {
    console.error('Error fetching todos count:', error);
    res.status(500).json({ error: 'Failed to fetch todos count' });
  }
});

router.get('/todos', async (req: Request, res: Response) => {
  try {
    const todos = await todoService.getTodos();
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

router.post('/todos', async (req: Request, res: Response) => {
  try {
    const todo = await todoService.createTodo(req.body);
    res.status(201).json(todo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(400).json({ error: 'Failed to create todo' });
  }
});

export default router;
