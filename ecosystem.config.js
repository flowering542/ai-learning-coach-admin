module.exports = {
  apps: [
    {
      name: 'coach-admin',
      script: './node_modules/.bin/next',
      args: 'start',
      env: {
        PORT: 3002,
        NODE_ENV: 'production'
      }
    }
  ]
}
