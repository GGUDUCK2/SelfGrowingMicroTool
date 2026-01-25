
export function generateNginxLog(): string {
  const ips = ['192.168.1.1', '10.0.0.1', '172.16.0.5', '203.0.113.195', '198.51.100.1'];
  const methods = ['GET', 'POST', 'PUT', 'DELETE'];
  const paths = ['/api/users', '/api/auth/login', '/dashboard', '/assets/style.css', '/api/data'];
  const agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'curl/7.64.1'
  ];

  const lines: string[] = [];
  const now = new Date();

  for (let i = 0; i < 100; i++) {
    const time = new Date(now.getTime() - (100 - i) * 60000); // Past 100 minutes
    const ip = ips[Math.floor(Math.random() * ips.length)];
    const method = methods[Math.floor(Math.random() * methods.length)];
    const path = paths[Math.floor(Math.random() * paths.length)];
    const agent = agents[Math.floor(Math.random() * agents.length)];

    let status = 200;
    if (Math.random() > 0.8) status = 404;
    if (Math.random() > 0.9) status = 500;
    if (path.includes('login') && Math.random() > 0.7) status = 401;

    const size = Math.floor(Math.random() * 5000) + 200;

    // Nginx combined format
    // 127.0.0.1 - - [10/Oct/2000:13:55:36 -0700] "GET /apache_pb.gif HTTP/1.0" 200 2326 "http://www.example.com/start.html" "Mozilla/4.08 [en] (Win98; I ;Nav)"

    const dateStr = time.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '/');
    const timeStr = time.toLocaleTimeString('en-GB', { hour12: false });
    const timestamp = `[${dateStr}:${timeStr} +0000]`;

    lines.push(`${ip} - - ${timestamp} "${method} ${path} HTTP/1.1" ${status} ${size} "-" "${agent}"`);
  }
  return lines.join('\n');
}

export function generateSyslog(): string {
  const hosts = ['web-01', 'db-primary', 'worker-node-1', 'auth-service'];
  const procs = ['sshd', 'nginx', 'kernel', 'cron'];
  const messages = [
    'Connection closed by authenticating user root',
    'Failed password for invalid user admin from 192.168.1.50 port 49202 ssh2',
    'Disk usage exceeded 90% on /dev/sda1',
    'Starting session clean-up',
    'Memory pressure detected, invoking OOM killer',
    'Service restarted successfully',
    'Connection refused to database:5432'
  ];

  const lines: string[] = [];
  const now = new Date();

  for (let i = 0; i < 80; i++) {
    const time = new Date(now.getTime() - (80 - i) * 120000);
    const host = hosts[Math.floor(Math.random() * hosts.length)];
    const proc = procs[Math.floor(Math.random() * procs.length)];
    const pid = Math.floor(Math.random() * 30000) + 100;
    const msg = messages[Math.floor(Math.random() * messages.length)];

    // Syslog format: Month Day HH:MM:SS Hostname Process[PID]: Message
    const month = time.toLocaleDateString('en-US', { month: 'short' });
    const day = time.getDate().toString().padStart(2, ' ');
    const timeStr = time.toLocaleTimeString('en-GB', { hour12: false });

    lines.push(`${month} ${day} ${timeStr} ${host} ${proc}[${pid}]: ${msg}`);
  }
  return lines.join('\n');
}

export function generateJsonLog(): string {
  const levels = ['info', 'info', 'info', 'warn', 'error'];
  const msgs = [
    'Request received',
    'Processing payment',
    'User logged in',
    'Database connection timeout',
    'Invalid payload received',
    'Cache miss',
    'External API rate limit exceeded'
  ];

  const lines: string[] = [];
  const now = new Date();

  for (let i = 0; i < 60; i++) {
    const time = new Date(now.getTime() - (60 - i) * 30000);
    const level = levels[Math.floor(Math.random() * levels.length)];
    let levelVal = 30; // info
    if (level === 'warn') levelVal = 40;
    if (level === 'error') levelVal = 50;

    const msg = msgs[Math.floor(Math.random() * msgs.length)];

    const entry = {
      level: levelVal,
      time: time.getTime(),
      pid: process.pid || 1234,
      hostname: 'app-container-x89',
      msg: msg,
      v: 1,
      reqId: `req-${Math.floor(Math.random() * 10000)}`
    };

    lines.push(JSON.stringify(entry));
  }
  return lines.join('\n');
}
