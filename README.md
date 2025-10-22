<<<<<<< HEAD
# 🏋️ Class Booking API

A complete backend API for fitness class booking system built with NestJS, MongoDB, and JWT authentication.

## 🚀 Features

- **🔐 Authentication** - JWT-based user registration and login
- **👥 User Management** - User profiles and credit system
- **📚 Class Management** - Full CRUD operations for fitness classes
- **🎫 Booking System** - Book and cancel classes with business rules
- **💳 Credit System** - Purchase and use credits for bookings
- **📊 Health Monitoring** - Real-time API health checks
- **📈 Metrics** - Performance monitoring with Prometheus
- **📖 API Documentation** - Interactive Swagger documentation

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Deployment**: PM2, Nginx

## 📋 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Users
- `GET /users/profile` - Get user profile (Protected)
- `PATCH /users/credits` - Add credits to user (Protected)
- `GET /users/credits` - Get user credits (Protected)

### Classes
- `GET /classes` - Get all active classes
- `GET /classes/:id` - Get specific class
- `POST /classes` - Create new class (Protected)
- `PATCH /classes/:id` - Update class (Protected)
- `DELETE /classes/:id` - Delete class (Protected)
- `GET /classes/available` - Get available classes
- `GET /classes/:id/participants` - Get class participants

### Bookings
- `POST /bookings` - Book a class (Protected)
- `GET /bookings` - Get user bookings (Protected)
- `GET /bookings/:id` - Get specific booking (Protected)
- `DELETE /bookings/:id` - Cancel booking (Protected)

### App & Monitoring
- `GET /health` - Health check
- `GET /health/detailed` - Detailed health information
- `GET /metrics` - Prometheus metrics
- `GET /info` - API information

## 🏗️ Installation

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm or yarn

### 1. Clone the repository
```bash
git clone <repository-url>
cd class-booking-api

=======
# Class-Booking-API
NestJS backend for fitness class booking. Features user auth, credit system, class management, and booking with business rules. MongoDB, JWT, Swagger docs.
>>>>>>> da73b9c93eb62f6b3ec2030d1c5008f234e8f869
