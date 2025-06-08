# Campus Event Management Frontend

This is the frontend for the Campus Event Management system, built with React, TypeScript, and TailwindCSS.

## Features

- View upcoming and past events
- Event details with registration capability
- User authentication (login/register)
- User profile with booking history
- Admin dashboard for event management

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Running instances of the following microservices:
  - Event Service (port: 5075)
  - User Service (port: 5002)
  - Booking Service (port: 5003)

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
cd EventManagement-Frontend
npm install
```

3. Configure the API endpoints:

Create a `.env` file in the root directory with the following content:

```
REACT_APP_EVENT_SERVICE_URL=http://localhost:5075/api
REACT_APP_USER_SERVICE_URL=http://localhost:5002/api
REACT_APP_BOOKING_SERVICE_URL=http://localhost:5003/api
```

4. Start the development server:

```bash
npm start
```

The application will be available at http://localhost:3000

## Connecting to Microservices

The frontend is configured to connect to the following microservices:

- **Event Service (port 5075)**: Manages events (create, read, update, delete)
- **User Service (port 5002)**: Handles user authentication and profile management
- **Booking Service (port 5003)**: Manages event bookings

Make sure all three microservices are running before using the frontend.

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm build`: Builds the app for production
- `npm test`: Runs the test suite

## Project Structure

- `src/components`: Reusable UI components
- `src/pages`: Page components
- `src/services`: API service clients for microservices
- `src/context`: React context for state management
- `src/types`: TypeScript type definitions 