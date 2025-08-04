import styles from './ui-dashboard.module.scss';

export function UiDashboard() {
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
          <p>{/* Replace with actual todos count */}0</p>
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
          <p>{/* Replace with actual notifications count */}0</p>
        </div>
      </div>
    </div>
  );
}

export default UiDashboard;
