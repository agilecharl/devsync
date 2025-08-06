import { Pool } from 'pg';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  isRead: boolean;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export class NotificationService {
  async getNotificationCount(): Promise<number> {
    const res = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE is_read = false',
      []
    );
    return parseInt(res.rows[0].count, 10);
  }

  async getNotifications(): Promise<Notification[]> {
    const res = await pool.query('SELECT * FROM notifications');
    return res.rows.map(
      (row: {
        id: any;
        user_id: any;
        title: any;
        description: any;
        is_read: any;
      }) => ({
        id: row.id,
        user_id: row.user_id,
        title: row.title,
        description: row.description,
        isRead: row.is_read,
      })
    );
  }

  async createNotification(data: Partial<Notification>): Promise<Notification> {
    const res = await pool.query(
      `INSERT INTO notifications (user_id, title, description, is_read)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        data.user_id || 'default_user',
        data.title || 'New Notification',
        data.description || 'No description provided',
        data.isRead || false,
        new Date(),
      ]
    );
    const row = res.rows[0];
    return {
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      description: row.description,
      isRead: row.is_read,
    };
  }
}
