import { HelmetOptions } from 'helmet';

export const helmetConfig: HelmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
      scriptSrc: ["'self'", "https:'unsafe-inline'"],
    },
  },
  crossOriginEmbedderPolicy: false,
};

export const corsConfig = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
};
