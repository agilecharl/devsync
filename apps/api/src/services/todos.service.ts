import { Pool } from 'pg';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  is_completed: boolean;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export class TodoService {
  async getTodoCount(): Promise<number> {
    const res = await pool.query('SELECT COUNT(*) FROM todos');
    return parseInt(res.rows[0].count, 10);
  }

  async getTodos(): Promise<Todo[]> {
    const res = await pool.query('SELECT * FROM todos');
    return res.rows.map(
      (row: { id: any; title: any; description: any; is_completed: any }) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        is_completed: row.is_completed,
      })
    );
  }

  async createTodo(data: Partial<Todo>): Promise<Todo> {
    const res = await pool.query(
      `INSERT INTO todos (title, description, is_completed)
       VALUES ($1, $2)
       RETURNING *`,
      [
        data.title || 'Unnamed Todo',
        data.description,
        data.is_completed || false,
      ]
    );
    const row = res.rows[0];
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      is_completed: row.is_completed,
    };
  }
}
