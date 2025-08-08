import type { PlasmoCSConfig } from 'plasmo';

export const config: PlasmoCSConfig = {
  matches: ['<all_urls>'],
  run_at: 'document_start',
};

class DevPulseTaskbar {
  private taskbar: HTMLElement | null = null;
  private commitCount: number = 0;

  public async init(): Promise<void> {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.createTaskbar());
    } else {
      this.createTaskbar();
    }

    await this.fetchCommitCount();
    this.setupPeriodicUpdate();
  }

  private createTaskbar(): void {
    // Remove existing taskbar if present
    const existing = document.getElementById('devpulse-taskbar');
    if (existing) {
      existing.remove();
    }

    // Create taskbar container
    this.taskbar = document.createElement('div');
    this.taskbar.id = 'devpulse-taskbar';
    this.taskbar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      padding: 0 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 999999;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      transition: transform 0.3s ease;
    `;

    // Add content
    this.updateTaskbarContent();

    // Adjust page content to avoid overlap
    document.body.style.marginTop = '40px';
    document.body.style.transition = 'margin-top 0.3s ease';

    // Insert at the beginning of body
    document.body.insertBefore(this.taskbar, document.body.firstChild);
  }

  private updateTaskbarContent(): void {
    if (!this.taskbar) return;

    this.taskbar.innerHTML = `
      <div style="display: flex; align-items: center; gap: 15px; width: 100%;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          <span>DevPulse</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1.643 3.143L.427 1.927A.25.25 0 000 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 00.177-.427L2.715 4.215a6.5 6.5 0 11-1.18 4.458.75.75 0 10-1.493.154 8.001 8.001 0 101.6-5.684zM7.75 4a.75.75 0 01.75.75v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5A.75.75 0 017.75 4z"/>
          </svg>
          <span>Commits: ${this.commitCount}</span>
        </div>
        <div style="margin-left: auto; display: flex; align-items: center; gap: 8px;">
          <button id="devpulse-refresh" style="
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          ">Refresh</button>
          <span style="font-size: 12px; opacity: 0.8;">
            ${new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    `;

    // Add refresh button functionality
    const refreshBtn = this.taskbar.querySelector('#devpulse-refresh');
    refreshBtn?.addEventListener('click', () => this.fetchCommitCount());
  }

  private async fetchCommitCount(): Promise<void> {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_COMMIT_COUNT',
      });

      if (response?.error) {
        throw new Error(response.error);
      }

      this.commitCount = response?.count || 0;
      this.updateTaskbarContent();
    } catch (error) {
      console.error('Error fetching commit count:', error);
      this.commitCount = 0;
      this.updateTaskbarContent();
    }
  }

  private setupPeriodicUpdate(): void {
    // Update commit count every 5 minutes
    setInterval(() => {
      this.fetchCommitCount();
    }, 5 * 60 * 1000);
  }

  public destroy(): void {
    if (this.taskbar) {
      this.taskbar.remove();
      document.body.style.marginTop = '';
    }
  }
}

// Initialize taskbar
const taskbar = new DevPulseTaskbar();
taskbar.init();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  taskbar.destroy();
});
