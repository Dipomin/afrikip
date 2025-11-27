module.exports = {
  apps: [
    {
      name: 'afrikipresse',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/afrikipresse',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/pm2/afrikipresse-error.log',
      out_file: '/var/log/pm2/afrikipresse-out.log',
      log_file: '/var/log/pm2/afrikipresse-combined.log',
      time: true,
      // Stratégie de restart
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      // Monitoring
      instance_var: 'INSTANCE_ID',
      // Gestion des signaux
      kill_timeout: 5000,
      wait_ready: false, // Désactivé car Next.js n'envoie pas de signal ready
      listen_timeout: 10000
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: process.env.VPS_HOST || 'your-vps-ip',
      ref: 'origin/main',
      repo: 'git@github.com:your-org/afrikipresse.git',
      path: '/var/www/afrikipresse',
      'post-deploy': 'npm ci --legacy-peer-deps && npx prisma generate && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-deploy-local': 'git push origin main',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    staging: {
      user: 'deploy',
      host: process.env.VPS_HOST || 'your-vps-ip',
      ref: 'origin/staging',
      repo: 'git@github.com:your-org/afrikipresse.git',
      path: '/var/www/afrikipresse-staging',
      'post-deploy': 'npm ci --legacy-peer-deps && npx prisma generate && npm run build && pm2 reload ecosystem.config.js --env staging',
      env: {
        NODE_ENV: 'staging',
        PORT: 3002
      }
    }
  }
};
