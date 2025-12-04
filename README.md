# DeCal

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Fill in your Supabase credentials and email configuration in `.env`

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Environment Variables

### Required
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for server-side operations)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins (e.g., `https://yourdomain.com,https://www.yourdomain.com`)
  - Defaults to `http://localhost:5173,http://localhost:3000` for development
  - **Required for production** - set to your production domain(s)

### Optional
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`: Email configuration for notifications

## Security

This application includes security measures:
- CORS protection with origin whitelisting
- Security headers (helmet.js)
- Input validation and sanitization
- Rate limiting
- File upload validation
- Authentication and authorization middleware

See `SECURITY_AUDIT.md` for detailed security information and deployment checklist.

## API Endpoints

### Course Submission
- `POST /api/course` - Submit a new course (requires authentication)

### Admin Endpoints (require admin permissions)
- `GET /api/unapprovedCourses` - Get all pending courses with cross-validation
- `POST /api/approveCourse` - Approve a pending course
- `POST /api/rejectCourse` - Reject a pending course with feedback

### Public Endpoints
- `GET /api/approvedCourses` - Get all approved courses for the courses dashboard
- `GET /health` - Health check endpoint

## Authentication

All API endpoints (except `/health`) require authentication via Supabase. Include the token in the Authorization header:

```
Authorization: Bearer <supabase_jwt_token>
```

Admin endpoints require the user to have `ReadAll` permission in the users table.

## Database Schema

The backend expects the following Supabase tables:

- `users` - User authentication and permissions
- `courses` - Course submissions
- `approved_courses` - Approved courses from Google Sheets
- `sections` - Course sections
- `facilitators` - Course facilitators

