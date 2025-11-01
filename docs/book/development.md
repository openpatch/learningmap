---
name: Development
index: 1
---

# Development

This guide will help you set up your development environment for working on Learningmap.

## Prerequisites

- **Node.js**: Version 18 or higher
- **pnpm**: Version 8 or higher (required - the project enforces pnpm usage)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/openpatch/learningmap.git
   cd learningmap
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build all packages:
   ```bash
   pnpm build
   ```

## Repository Structure

Learningmap is a **pnpm monorepo** with the following structure:

```
learningmap/
├── packages/
│   ├── learningmap/          # Core React component library
│   └── web-component/        # Web component wrapper
├── platforms/
│   ├── web/                  # Web application (learningmap.app)
│   └── vscode/               # VS Code extension
├── docs/                     # Documentation (Hyperbook)
└── scripts/                  # Build and development scripts
```

## Development Workflow

### Available Scripts

From the root directory:

- `pnpm dev` - Watch mode for development (rebuilds on file changes)
- `pnpm build` - Build all packages
- `pnpm test` - Run tests across all packages
- `pnpm lint` - Type-check with TypeScript
- `pnpm docs:dev` - Start documentation dev server (http://localhost:3000)
- `pnpm docs:build` - Build documentation

### Working on Packages

Each package has its own scripts:

- `pnpm build` - Build the package
- `pnpm lint` - Type-check with TypeScript
- `pnpm test` - Run tests with Vitest

**Important**: Always build packages before testing, as packages depend on each other's built artifacts.

### Development Mode

For active development with automatic rebuilds:

```bash
pnpm dev
```

This starts a watcher that rebuilds packages when you make changes.

### Documentation

To work on documentation:

```bash
pnpm docs:dev
```

The documentation is built with [Hyperbook](https://hyperbook.openpatch.org) and is located in the `docs/` directory.

### VS Code Extension

To develop the VS Code extension:

1. Build the extension:
   ```bash
   pnpm --filter learningmap-vscode build
   ```

2. Open the `platforms/vscode` directory in VS Code

3. Press F5 to launch the Extension Development Host

4. Open or create a `.learningmap` file to test the editor

See [platforms/vscode/DEVELOPMENT.md](../../platforms/vscode/DEVELOPMENT.md) for more details.

## Testing Your Changes

1. **Type-check**: `pnpm lint`
2. **Run tests**: `pnpm test`
3. **Build**: `pnpm build`

All PRs must pass these checks.

## Tech Stack

- **Language**: TypeScript
- **UI Framework**: React 19
- **Build Tool**: Vite + esbuild
- **Visual Editor**: ReactFlow (@xyflow/react)
- **Layout Engine**: ELK.js for auto-layout
- **Testing**: Vitest
- **Code Quality**: Prettier, Husky

## Version Management

This project uses [Changesets](https://github.com/changesets/changesets) for version management:

1. Make your changes
2. Run `pnpm exec changeset` to create a changeset
3. Follow the prompts to describe your changes
4. Commit the changeset file with your PR

## Common Issues

### pnpm not found
Install pnpm globally:
```bash
npm install -g pnpm
```

### Build failures
Make sure all dependencies are installed:
```bash
pnpm install
pnpm build
```

### TypeScript errors
Run type-checking to see all errors:
```bash
pnpm lint
```
