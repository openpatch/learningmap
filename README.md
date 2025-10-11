# LearningMap - Interactive Learning Maps Platform

A **PocketBase + SvelteKit web application** that enables teachers to create, assign, and monitor interactive learning maps, and students to complete them using the `<hyperbook-learningmap>` and `<hyperbook-learningmap-editor>` web components.

## Features

### 👩‍🏫 For Teachers

- **Authentication**: Email and password-based login
- **Dashboard**: Overview of learning maps, groups, and assignments
- **Learning Maps Management**:
  - Create and edit interactive learning maps using the visual editor
  - List all created maps
  - Delete maps when no longer needed
- **Groups Management**:
  - Create groups for organizing students
  - Add/remove students to/from groups
  - Auto-generated student display names (e.g., "LuckyTiger")
  - Auto-generated 8-character login codes
- **Assignments**:
  - Assign learning maps to groups
  - Track which maps are assigned to which groups
- **Student Management**:
  - Print QR codes and login codes for students
  - View student progress on assigned maps

### 👨‍🎓 For Students

- **Authentication**: Simple code-based login (no password required)
- **Dashboard**: View all assigned learning maps with progress tracking
- **Interactive Learning**:
  - Work through learning maps interactively
  - Progress is automatically saved
  - Visual progress indicators
- **Personalized Experience**: Each student gets a unique, friendly display name

## Architecture

### Tech Stack

- **Backend**: PocketBase (Go-based backend)
- **Frontend**: SvelteKit with Svelte 5
- **Styling**: TailwindCSS 4 + DaisyUI
- **Web Components**: `@hyperbook/learningmap` (loaded from CDN)
- **QR Codes**: `qrcode` npm package

### Database Schema

#### Collections

1. **users** (PocketBase auth collection)
   - `role`: "teacher" or "student"
   - `displayName`: Display name (auto-generated for students)
   - `code`: 8-character login code (students only)
   - `email`: Email address (teachers only)
   - `managedBy`: Reference to managing teacher (students only)

2. **groups**
   - `name`: Group name
   - `teacher`: Reference to teacher user
   - `students`: Array of student user references

3. **learningmaps**
   - `name`: Map name
   - `roadmapData`: JSON containing the map structure
   - `teacher`: Reference to teacher user

4. **assignments**
   - `group`: Reference to group
   - `learningmap`: Reference to learning map
   - `teacher`: Reference to teacher user

5. **progress**
   - `student`: Reference to student user
   - `assignment`: Reference to assignment
   - `roadmapState`: JSON containing progress state

## Development

### Prerequisites

- Go 1.23.4 or higher
- Node.js 18+ and pnpm
- Make (optional, but recommended)

### Setup

```bash
# Clone the repository
git clone https://github.com/openpatch/learningmap.git
cd learningmap

# Install dependencies
make setup

# Or manually:
go mod tidy
cd ui && pnpm install
```

### Running in Development

```bash
make run
```

This will:
1. Build the frontend
2. Start the PocketBase server on port 8090
3. Start the Vite dev server on port 5173

Access the application:
- Frontend: http://localhost:5173
- PocketBase Admin: http://localhost:8090/_/

### Environment Variables

Create `ui/.env` file (see `ui/.env.example`):

```env
PUBLIC_POCKETBASE_URL=http://localhost:8090
```

### Build

Build a production-ready binary:

```bash
make build
```

This creates a single executable containing both the backend and frontend.

## Deployment

### Docker

Build the Docker image:

```bash
make build
# This builds the Go binary with embedded frontend

docker build -t learningmap .
docker run -p 8090:8090 -v $(pwd)/pb_data:/pb_data learningmap
```

### Manual Deployment

1. Build the project: `make build`
2. Copy the `learningmaps` binary to your server
3. Run the binary: `./learningmaps serve`
4. Access at `http://your-server:8090`

### Environment Configuration

For production, update the PocketBase URL:

```env
PUBLIC_POCKETBASE_URL=https://your-domain.com
```

## Usage Guide

### For Teachers

1. **First Time Setup**:
   - Create a teacher account via PocketBase Admin UI at `/_/`
   - Set the user's role to "teacher"
   - Login at `/sign-in`

2. **Create a Learning Map**:
   - Navigate to "Learning Maps" → "Create New Map"
   - Design your map using the visual editor
   - Save the map

3. **Create a Group**:
   - Navigate to "Groups" → "Create New Group"
   - Add students (they get auto-generated names and codes)

4. **Assign Maps**:
   - Go to a group's detail page
   - Select a learning map to assign
   - Students will see it on their dashboard

5. **Distribute Student Codes**:
   - On the group detail page, click "Print QR Codes"
   - Print or share the codes with students

### For Students

1. **Login**:
   - Visit `/student/login`
   - Enter your 8-character code
   - Or scan the QR code provided by your teacher

2. **Complete Learning Maps**:
   - View your assigned maps on the dashboard
   - Click "Start" or "Continue" to work on a map
   - Your progress saves automatically

## Project Structure

```
learningmap/
├── main.go                     # Go backend entry point
├── go.mod                      # Go dependencies
├── migrations/                 # PocketBase migrations
│   ├── 1760219460_updated_users_roles.go
│   ├── 1760219470_created_groups.go
│   ├── 1760219480_created_learningmaps.go
│   ├── 1760219490_created_assignments.go
│   └── 1760219500_created_progress.go
├── ui/                         # SvelteKit frontend
│   ├── src/
│   │   ├── lib/
│   │   │   ├── auth.ts         # Authentication helpers
│   │   │   ├── pocketbase.ts   # PocketBase client
│   │   │   ├── types.ts        # TypeScript types
│   │   │   ├── randomName.ts   # Name generation
│   │   │   └── utils/
│   │   │       └── qr.ts       # QR code generation
│   │   ├── routes/
│   │   │   ├── +page.svelte    # Landing page
│   │   │   ├── (auth)/         # Auth routes
│   │   │   │   └── sign-in/
│   │   │   ├── teacher/        # Teacher routes
│   │   │   │   ├── dashboard/
│   │   │   │   ├── maps/
│   │   │   │   ├── groups/
│   │   │   │   └── print/
│   │   │   └── student/        # Student routes
│   │   │       ├── login/
│   │   │       ├── dashboard/
│   │   │       └── map/
│   │   ├── app.css             # Global styles
│   │   └── app.html            # HTML template
│   ├── package.json
│   └── .env.example
├── Makefile                    # Build commands
└── README.md
```

## Web Components

This application integrates with the `@hyperbook/learningmap` web components:

- `<hyperbook-learningmap>`: Interactive learning map viewer
- `<hyperbook-learningmap-editor>`: Visual editor for creating maps

These are loaded from CDN: `https://unpkg.com/@hyperbook/learningmap@latest/dist/index.js`

## Data Flow

1. **Teacher creates a map** → `<hyperbook-learningmap-editor>` emits `roadmapData` → Saved to PocketBase
2. **Teacher assigns map** → Creates `assignment` record
3. **Student logs in** → Views assigned maps → Opens map
4. **Student interacts with map** → `<hyperbook-learningmap>` emits `roadmapState` → Progress saved to PocketBase
5. **Teacher views progress** → Retrieves saved `roadmapState` from PocketBase

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[License information to be added]

## Support

For issues and questions, please open an issue on GitHub.
