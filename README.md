<<<<<<< HEAD
# Ant Support

A comprehensive diagnostic and support system for TV interfaces and device management.

## Project Structure

This project consists of two main parts:

### Backend (`/backend`)
- Node.js/Express server
- SQLite database with Prisma ORM
- RESTful API endpoints
- Device management and diagnostic sessions
- TV interface management system

### Frontend (`/frontend`)
- React + TypeScript application
- Vite build system
- Tailwind CSS for styling
- Shadcn UI components
- Admin dashboard and user interfaces

## Features

- **Device Management**: Add, edit, and manage diagnostic devices
- **Problem Tracking**: Create and track diagnostic problems
- **Session Management**: Manage diagnostic sessions with steps
- **TV Interface Builder**: Visual interface for creating TV remote layouts
- **Admin Dashboard**: Comprehensive admin interface for system management
- **Real-time Sync**: Live synchronization between frontend and backend

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Firuz1313/ant-support.git
   cd ant-support
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up the database**
   ```bash
   cd ../backend
   npm run migrate
   npm run seed
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## API Endpoints

### Devices
- `GET /api/devices` - Get all devices
- `POST /api/devices` - Create new device
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device

### Problems
- `GET /api/problems` - Get all problems
- `POST /api/problems` - Create new problem
- `PUT /api/problems/:id` - Update problem
- `DELETE /api/problems/:id` - Delete problem

### Sessions
- `GET /api/sessions` - Get all sessions
- `POST /api/sessions` - Create new session
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session

### TV Interfaces
- `GET /api/tv-interfaces` - Get all TV interfaces
- `POST /api/tv-interfaces` - Create new TV interface
- `PUT /api/tv-interfaces/:id` - Update TV interface
- `DELETE /api/tv-interfaces/:id` - Delete TV interface

## Technologies Used

### Backend
- Node.js
- Express.js
- SQLite
- Prisma ORM
- CORS middleware
- Error handling middleware

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI
- React Router
- SWR for data fetching
- React Hook Form

## Development

### Code Style
- Prettier for code formatting
- ESLint for code linting
- TypeScript for type safety

### Database
- SQLite for development
- Prisma migrations for schema changes
- Seed data for testing

## Deployment

The project is configured for deployment on Netlify with the following configuration:

- Build command: `cd frontend && npm run build`
- Publish directory: `frontend/dist`
- Environment variables configured for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Author

Firuz1313

## Support

For support and questions, please open an issue on GitHub. 
=======
# ant-support
>>>>>>> 360f9eddece7f214db92b156a425dbae1d2c0ff3
