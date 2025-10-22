module.exports = {
  apps: [
    {
      name: 'class-booking-api',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        MONGODB_URI: 'mongodb://localhost:27017/class-booking-prod',
        JWT_SECRET: 'your-production-jwt-secret',
        CORS_ORIGIN: 'https://your-domain.com',
      },
    },
  ],
};
