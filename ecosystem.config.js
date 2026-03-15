module.exports = {
  apps: [
    {
      name: 'coach-admin',
      script: './node_modules/.bin/next',
      args: 'dev -H 0.0.0.0 -p 3002',
      env: {
        NODE_ENV: 'development',
        DATA_DIR: '../ai-learning-coach/data',
        JWT_SECRET: 'coach-admin-secret-key-2025'
      },
      log_file: '/var/log/coach-admin.log',
      out_file: '/var/log/coach-admin-out.log',
      error_file: '/var/log/coach-admin-error.log'
    }
  ]
}
