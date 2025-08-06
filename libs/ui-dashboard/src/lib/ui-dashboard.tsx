import { useEffect, useState } from 'react';
import config from '../../../config.json';
import styles from './ui-dashboard.module.scss';

export function UiDashboard() {
  const [todosCount, setTodosCount] = useState(0);
  const [notificationsCount, setNotificationsCount] = useState(0);

  const getTodosCount = async () => {
    try {
      const apiUrl = config.apiUrl || 'http://localhost:3000/api';
      const fullUrl = `${apiUrl}/todos/count`;

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch todos count: ${response.status} ${response.statusText}`
        );
      }

      const data = (await response.json()) as { count?: number };
      setTodosCount(data.count || 0);
    } catch (error) {
      console.error('Error fetching todos count:', error);
      return 0;
    }
  };

  const getNotificationsCount = async () => {
    try {
      const apiUrl = config.apiUrl || 'http://localhost:3000/api';
      const fullUrl = `${apiUrl}/notifications/count`;

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch notifications count: ${response.status} ${response.statusText}`
        );
      }

      const data = (await response.json()) as { count?: number };
      setNotificationsCount(data.count || 0);
    } catch (error) {
      console.error('Error fetching notifications count:', error);
      return 0;
    }
  };

  useEffect(() => {
    getTodosCount();
    getNotificationsCount();
  }, []);

  return (
    <div className={styles['container']}>
      <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
        <div
          style={{
            flex: 1,
            padding: '16px',
            background: '#f5f5f5',
            borderRadius: '8px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}
        >
          <h2>Todos</h2>
          <p>{todosCount}</p>
        </div>
        <div
          style={{
            flex: 1,
            padding: '16px',
            background: '#f5f5f5',
            borderRadius: '8px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}
        >
          <h2>Commits</h2>
          <p>{/* Replace with actual commits count */}0</p>
        </div>
        <div
          style={{
            flex: 1,
            padding: '16px',
            background: '#f5f5f5',
            borderRadius: '8px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}
        >
          <h2>Notifications</h2>
          <p>{notificationsCount}</p>
        </div>
      </div>
      <div style={{ marginTop: '24px' }}>
        <h2>Recent Activity</h2>
        <ul>
          {/* Replace with actual activity items */}
          <li>No recent activity</li>
        </ul>
      </div>
      <div style={{ marginTop: '24px' }}>
        <h2>Jobs</h2>
        <p>Running Jobs</p>
      </div>
    </div>
  );
}

export default UiDashboard;
