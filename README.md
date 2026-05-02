# Team Task Management App

A MERN stack team task management application built for collaborative project and task tracking.

## Features
- Secure signup and login using Passport sessions
- Project creation with creator assigned as project admin
- Admin can add and remove project members
- Members can view assigned projects and work items
- Create tasks with title, description, due date, priority, and assignee
- Update task status: To Do, In Progress, Done
- Dashboard with total tasks, status breakdown, tasks per user, and overdue tasks
- Search projects, project members, and tasks

## Tech Stack
- Backend: Node.js, Express, MongoDB, Mongoose
- Authentication: Passport.js local strategy, express-session, connect-mongo
- Frontend: React, Vite, React Router

## Setup

1. Install dependencies:
   ```bash
   npm run install-all
   ```
2. Create backend env file:
   ```bash
   copy server\.env.example server\.env
   ```
3. Create frontend env file:
   ```bash
   copy client\.env.example client\.env
   ```
4. Update `server/.env` with your MongoDB URI, session secret, and client URL.
5. Start the full application:
   ```bash
   npm run start
   ```

## Usage
- Open the client app in your browser at `http://localhost:5173`
- Signup or login to access dashboard and project pages
- Create a project, invite members using their user ID, and assign tasks
- Use search fields to quickly find projects, members, and tasks

## Deployment

This app is ready for deployment on Railway.
- Backend should use `MONGO_URI`, `SESSION_SECRET`, and `CLIENT_URL`
- Frontend should use `VITE_API_BASE`

## Notes for submission
- Live app URL: [Enter your Railway URL]
- GitHub repository: [Enter your repo URL]
- Demo video: record a short walkthrough showing login, project creation, member management, and task tracking
