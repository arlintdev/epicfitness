# 🏋️ Epic Fitness Platform

The most comprehensive physical training website designed to help users focus on different muscle groups with a fully customizable admin interface. Built with modern technologies and featuring an extensive set of tools for fitness enthusiasts, trainers, and gym owners.

## 🚀 Features

### Core Features
- **Workout Management**: Create, edit, and organize workouts with rich descriptions (Markdown support)
- **Exercise Library**: Comprehensive database with form tips and video demonstrations
- **Admin Dashboard**: Full control over content creation and management
- **Image Storage**: Base64 encoded images stored directly in the database
- **Responsive Design**: Mobile-first approach for use during workouts

### 💪 Training & Progress Features
- **Workout Programs**: Multi-week structured training plans
- **Progress Tracking**: Track weights, reps, and personal records
- **Exercise Timer**: Built-in timer for sets and rest periods
- **Interactive Muscle Map**: Click on muscle groups to find targeted exercises
- **AI Workout Generator**: Custom workout creation based on goals
- **Body Measurements**: Track body composition changes over time
- **Before/After Photos**: Secure photo comparison tool

### 👥 Community & Social
- **User Profiles**: Personal dashboards with statistics
- **Achievement System**: Earn badges for milestones
- **Social Features**: Follow users, share workouts
- **Comments & Ratings**: Community feedback on workouts
- **Leaderboards**: Weekly/monthly challenges

### 📊 Analytics & Tracking
- **Progress Charts**: Visualize strength gains over time
- **Workout Calendar**: Schedule and track completed sessions
- **Nutrition Integration**: Basic macro tracking
- **Real-time Sync**: Multi-device synchronization

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js and TypeScript
- **PostgreSQL** database with Prisma ORM
- **JWT** authentication with refresh tokens
- **Redis** for caching and session management
- **Socket.io** for real-time features
- **Docker** for containerization

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** with custom fitness theme
- **React Query** for server state management
- **Zustand** for client state management
- **Framer Motion** for animations
- **React Hook Form** with Zod validation

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm 9+
- Docker and Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/casey-training.git
cd casey-training
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend (if needed)
cp frontend/.env.example frontend/.env
```

4. **Start Docker services**
```bash
docker-compose up -d
```

5. **Run database migrations**
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

6. **Seed the database (optional)**
```bash
npm run db:seed
```

7. **Start development servers**
```bash
# From root directory
npm run dev

# Or separately:
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `REDIS_URL`: Redis connection string
- `PORT`: Server port (default: 5000)

See `backend/.env.example` for all configuration options.

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user

### Workout Endpoints
- `GET /api/v1/workouts` - List all workouts (with filters)
- `GET /api/v1/workouts/:id` - Get workout by ID
- `POST /api/v1/workouts` - Create new workout (auth required)
- `PUT /api/v1/workouts/:id` - Update workout (auth required)
- `DELETE /api/v1/workouts/:id` - Delete workout (auth required)
- `POST /api/v1/workouts/:id/favorite` - Add to favorites
- `POST /api/v1/workouts/:id/rate` - Rate workout

## 🏗️ Project Structure

```
casey-training/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── stores/         # State management
│   │   └── utils/          # Utility functions
│   └── package.json
├── shared/                 # Shared types and utilities
├── docker-compose.yml      # Docker configuration
└── package.json           # Root package.json
```

## 🎯 Key Features Implementation

### Admin Interface
The admin interface allows complete control over:
- Creating and editing workouts
- Managing exercise database
- User management
- Content moderation
- Analytics dashboard

### Workout Cards
Beautiful, responsive cards displaying:
- Workout image
- Difficulty level
- Duration and calories
- Target muscle groups
- Creator information
- Ratings and favorites count

### Progress Tracking
Comprehensive tracking system:
- Personal records detection
- Progress graphs and charts
- Body measurements
- Photo comparisons
- Achievement notifications

## 🔐 Security Features

- **JWT Authentication** with refresh tokens
- **Password hashing** with bcrypt
- **Rate limiting** on API endpoints
- **Input validation** and sanitization
- **SQL injection protection** via Prisma ORM
- **XSS protection** with proper React rendering
- **CORS configuration** for API security

## 🚢 Deployment

### Docker Deployment
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment
1. Build the frontend: `cd frontend && npm run build`
2. Build the backend: `cd backend && npm run build`
3. Set production environment variables
4. Run migrations: `npx prisma migrate deploy`
5. Start the server: `npm run start`

## 📈 Performance Optimizations

- **Redis caching** for frequently accessed data
- **Database indexing** for optimal query performance
- **Image optimization** with base64 encoding
- **Code splitting** in React application
- **Lazy loading** for components and images
- **PWA support** for offline functionality

## 🧪 Testing

```bash
# Run all tests
npm test

# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Icons from [React Icons](https://react-icons.github.io/react-icons/)
- UI components inspired by [Radix UI](https://www.radix-ui.com/)
- Animation library [Framer Motion](https://www.framer.com/motion/)

## 📧 Contact

For questions or support, please contact the development team.

---

**Built with ❤️ for fitness enthusiasts worldwide**