import express, { Request, Response } from 'express';
import { NotificationService } from '../services/notifications.service';

const router = express.Router();
const notificationsService = new NotificationService();

router.get('/notifications/count', async (req: Request, res: Response) => {
  try {
    const count = await notificationsService.getNotificationCount();
    res.json({ count });
  } catch (error) {
    console.error('Error fetching notifications count:', error);
    res.status(500).json({ error: 'Failed to fetch notifications count' });
  }
});

router.get('/notifications', async (req: Request, res: Response) => {
  try {
    const notifications = await notificationsService.getNotifications();
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notificationss:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.post('/notifications', async (req: Request, res: Response) => {
  try {
    const notifications = await notificationsService.createNotification(
      req.body
    );
    res.status(201).json(notifications);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(400).json({ error: 'Failed to create notification' });
  }
});

export default router;
