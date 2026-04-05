import { defineConfig } from 'vite';
import { spawn, exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let currentProgress = 0;

const zeroInboxPlugin = () => ({
  name: 'zero-inbox-bridge',
  configureServer(server) {
    // Correct relative path to the engine since they are now in separate folders
    const engineDir = path.resolve(__dirname, '../zero-inbox-engine');
    const dashboardPublicData = path.resolve(__dirname, './public/data');

    server.middlewares.use((req, res, next) => {
      // 1. SSE for Progress
      if (req.url === '/api/progress-events') {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        const interval = setInterval(() => {
          res.write(`data: ${JSON.stringify({ progress: currentProgress })}\n\n`);
        }, 100);

        req.on('close', () => clearInterval(interval));
        return;
      }

      if (req.url === '/api/ping') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: "alive" }));
        return;
      }

      if (req.url === '/api/select-file') {
        console.log("📂 File Selection Triggered...");
        const osaCmd = `osascript -e 'POSIX path of (choose file with prompt "Select MBOX file")'`;
        exec(osaCmd, (err, stdout, stderr) => {
          res.setHeader('Content-Type', 'application/json');
          if (err) {
            res.end(JSON.stringify({ error: "Cancelled", path: null }));
            return;
          }
          res.end(JSON.stringify({ path: stdout.trim() }));
        });
        return;
      }

      if (req.url.startsWith('/api/process')) {
        const mboxPath = new URL(req.url, `http://${req.headers.host}`).searchParams.get('path');
        const rootDir = path.resolve(__dirname, '..');
        currentProgress = 0;
        
        res.setHeader('Content-Type', 'application/json');
        console.log(`🚀 Processing Started: ${mboxPath}`);
        
        // 1. Immediately tell the browser we started (no timeout!)
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: "started" }));

        // 2. Run the process in the background
        const child = spawn('cargo', ['run', '--release', '--bin', 'zero-inbox-engine', '--', '--mbox-path', mboxPath], { 
          cwd: engineDir,
          stdio: ['inherit', 'pipe', 'inherit']
        });

        child.stdout.on('data', (data) => {
          const lines = data.toString().split('\n');
          for (const line of lines) {
            try {
              const msg = JSON.parse(line.trim());
              if (msg.type === 'progress') {
                currentProgress = msg.val;
              }
            } catch (e) {
              if (line.trim()) console.log(line.trim());
            }
          }
        });

        child.on('close', (code) => {
          currentProgress = 100; // Trigger completion UI
          exec(`cp output/*.json "${dashboardPublicData}/"`, { cwd: engineDir }, () => {
            console.log("✅ Analysis & Sync Complete!");
            // No res.end here as we already sent it!
          });
        });
        return;
      }

      next();
    });
  }
});

export default defineConfig({
  root: '.',
  plugins: [zeroInboxPlugin()],
  server: {
    port: 5173,
    host: true,
    strictPort: true
  }
});
