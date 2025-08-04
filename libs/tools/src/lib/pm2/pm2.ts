import pm2 from 'pm2';

/**
 * Connects to the PM2 daemon.
 */
export function connect(): Promise<void> {
  return new Promise((resolve, reject) => {
    pm2.connect((err) => {
      if (err)
        return reject(
          new Error(typeof err === 'string' ? err : err?.message || String(err))
        );
      resolve();
    });
  });
}

/**
 * Disconnects from the PM2 daemon.
 */
export function disconnect(): void {
  pm2.disconnect();
}

/**
 * Starts a process with PM2.
 * @param options PM2 start options
 */
export function start(
  options: pm2.StartOptions
): Promise<pm2.ProcessDescription[]> {
  return new Promise((resolve, reject) => {
    pm2.start(options, (err, proc) => {
      if (err)
        return reject(
          new Error(typeof err === 'string' ? err : err?.message || String(err))
        );
      resolve(proc as pm2.ProcessDescription[]);
    });
  });
}

/**
 * Stops a process by name or id.
 * @param process Name or id of the process
 */
export function stop(process: string | number): Promise<void> {
  return new Promise((resolve, reject) => {
    pm2.stop(process, (err) => {
      if (err)
        return reject(
          new Error(typeof err === 'string' ? err : err?.message || String(err))
        );
      resolve();
    });
  });
}

/**
 * Lists all processes managed by PM2.
 */
export function list(): Promise<pm2.ProcessDescription[]> {
  return new Promise((resolve, reject) => {
    pm2.list((err, list) => {
      if (err)
        return reject(
          new Error(typeof err === 'string' ? err : err?.message || String(err))
        );
      resolve(list);
    });
  });
}

/**
 * Deletes a process by name or id.
 * @param process Name or id of the process
 */
export function del(process: string | number): Promise<void> {
  return new Promise((resolve, reject) => {
    pm2.delete(process, (err) => {
      if (err)
        return reject(
          new Error(typeof err === 'string' ? err : err?.message || String(err))
        );
      resolve();
    });
  });
}
