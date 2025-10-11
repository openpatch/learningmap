# Quick Start Guide

This guide will help you get the LearningMap application up and running quickly.

## Prerequisites

- Go 1.23.4 or higher
- Node.js 18+ 
- pnpm (install with `npm install -g pnpm`)

## Installation

### 1. Clone and Setup

```bash
git clone https://github.com/openpatch/learningmap.git
cd learningmap
make setup
```

Or manually:

```bash
go mod tidy
cd ui
pnpm install
```

### 2. Configure Environment

Create `ui/.env` file:

```bash
cd ui
cp .env.example .env
```

The default configuration should work for local development:
```env
PUBLIC_POCKETBASE_URL=http://localhost:8090
```

### 3. Run the Application

```bash
make run
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **PocketBase Admin**: http://localhost:8090/_/

## Initial Setup

### Create a Teacher Account

1. Open http://localhost:8090/_/ in your browser
2. Create an admin account when prompted
3. Navigate to "Collections" → "users"
4. Click "New record" and create a user with:
   - **email**: your email address
   - **password**: your password
   - **role**: teacher
   - **displayName**: your name
5. Click "Create"

### Login as Teacher

1. Go to http://localhost:5173
2. Click "Teacher Login"
3. Use your email and password to login
4. You'll be redirected to the teacher dashboard

## First Steps

### 1. Create a Learning Map

1. Click "Learning Maps" in the navigation
2. Click "Create New Map"
3. Enter a name (e.g., "Introduction to JavaScript")
4. Design your learning map using the visual editor
5. Click "Create Learning Map"

### 2. Create a Group

1. Click "Groups" in the navigation
2. Click "Create New Group"
3. Enter a name (e.g., "Class 10A")
4. Click "Create Group"

### 3. Add Students

1. Open the group you just created
2. Click "Add Student" multiple times to add students
3. Each student gets a unique display name (e.g., "LuckyTiger") and a 6-character code

### 4. Assign a Learning Map

1. On the group detail page, select a learning map from the dropdown
2. Click "Assign"
3. The map is now available to all students in the group

### 5. Print Student Codes

1. On the group detail page, click "Print QR Codes"
2. Print the page or save as PDF
3. Distribute the codes to your students

## Student Login

Students can login in two ways:

### Option 1: Enter Code
1. Go to http://localhost:5173/student/login
2. Enter the 6-character code
3. Click "Login"

### Option 2: Scan QR Code
1. Scan the QR code with a phone/tablet
2. Automatically redirected to login

## Troubleshooting

### Port Already in Use

If port 8090 or 5173 is already in use:

```bash
# Find and kill the process
lsof -ti:8090 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Build Errors

Make sure you have the correct versions:

```bash
go version    # Should be 1.23.4+
node --version # Should be 18+
pnpm --version # Should be 9+
```

### Database Issues

Delete the database and restart:

```bash
rm -rf pb_data
make run
```

This will create a fresh database with all migrations applied.

## Production Deployment

### Build for Production

```bash
make build
```

This creates a single `learningmaps` binary with the frontend embedded.

### Run in Production

```bash
./learningmaps serve --http=0.0.0.0:8090
```

Access the application at `http://your-server-ip:8090`

### Environment Variables

For production, update `ui/.env` before building:

```env
PUBLIC_POCKETBASE_URL=https://your-domain.com
```

Then rebuild the frontend:

```bash
cd ui
pnpm run build
cd ..
go build
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the [project structure](README.md#project-structure)
- Check out [CONTRIBUTING.md](CONTRIBUTING.md) to contribute

## Getting Help

- Open an issue on GitHub for bugs or feature requests
- Check the PocketBase documentation at https://pocketbase.io/docs/
- Check the SvelteKit documentation at https://kit.svelte.dev/

## Tips

- Use Chrome DevTools to debug the frontend
- Check PocketBase logs in the terminal for backend issues
- Student codes are case-insensitive
- Progress is saved automatically every time a student interacts with a map
- You can edit maps even after they're assigned (students will see the updates)
