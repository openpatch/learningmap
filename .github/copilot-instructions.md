# Copilot Instructions for Learningmap

## Project Overview

Learningmap is an open-source tool for creating, sharing, and exploring learning pathways. It's a monorepo built with React, TypeScript, and pnpm workspaces.

- **Website**: https://learningmap.app
- **Documentation**: https://learningmap.openpatch.org
- **Repository**: https://github.com/openpatch/learningmap
- **Maintainer**: Mike Barkmin (@mikebarkmin)

## Repository Structure

This is a **pnpm monorepo** with multiple packages and platforms:

```
learningmap/
├── packages/
│   ├── learningmap/          # Core React component library
│   └── web-component/        # Web component wrapper
├── platforms/
│   └── web/                  # Web application (learningmap.app)
├── docs/                     # Documentation (Hyperbook)
└── scripts/                  # Build and development scripts
```

## Tech Stack

- **Language**: TypeScript
- **UI Framework**: React 19
- **Package Manager**: pnpm (required - version >= 8)
- **Build Tool**: Vite + esbuild
- **Visual Editor**: ReactFlow (@xyflow/react)
- **Layout Engine**: ELK.js for auto-layout
- **Testing**: Vitest
- **Documentation**: Hyperbook
- **Version Management**: Changesets
- **Code Quality**: Prettier, Husky

## Development Workflow

### Installation and Setup

```bash
pnpm install        # Install all dependencies
pnpm build          # Build all packages
pnpm test           # Run tests across all packages
pnpm lint           # Type-check with TypeScript
pnpm docs:dev       # Start documentation dev server
pnpm dev            # Watch mode for development
```

### Making Changes

1. **Always use pnpm** - The project enforces pnpm usage via preinstall hook
2. **Build before testing** - Packages depend on each other's built artifacts
3. **Use Changesets** - For version management and changelog generation
4. **Follow existing patterns** - Match code style and structure of existing files

### Package Scripts

Each package has its own scripts defined in its `package.json`:
- `build`: Compiles TypeScript and bundles with esbuild
- `lint`: Type-checks with TypeScript (tsc --noEmit)
- `test`: Runs tests with Vitest

## Code Style and Conventions

### TypeScript

- Use strict TypeScript with proper type definitions
- Prefer interfaces for props and types for unions/intersections
- Export types alongside components
- No implicit `any` - always define types

### React Components

- Use functional components with hooks
- Prefer named exports for components
- Use TypeScript interfaces for component props
- Follow existing patterns for event handlers (e.g., `on` prefix)
- Keep components focused and modular

### File Organization

- Components in PascalCase (e.g., `EditorToolbar.tsx`)
- Utilities and helpers in camelCase (e.g., `helper.ts`, `translations.ts`)
- Index files export public API
- Keep related code together

### Translations

The project supports internationalization (i18n):
- Translations are defined in `packages/learningmap/src/translations.ts`
- Use the `getTranslations(language)` helper
- Default language is English (`en`), German (`de`) is also supported
- Always add translations for both languages when adding new strings

## Common Tasks

### Adding a New Feature

1. Implement the feature in the appropriate package
2. Add TypeScript types for all new props/interfaces
3. Update translations if adding user-facing text
4. Consider both editor and viewer modes
5. Test in both debug and preview modes
6. Update documentation if it's a public API change

### Working with the Editor

The core editor (`LearningMapEditor`) has two modes:
- **Edit Mode**: Full editing capabilities with toolbar
- **Preview Mode**: View-only mode for testing the learner experience

Key components:
- `EditorToolbar`: Main menu and controls
- `EditorDrawer`: Side panel for node/edge editing
- Node types: `TopicNode`, `TaskNode`, `TextNode`, `ImageNode`
- Edge types: Regular edges, completion edges, unlock edges

### Styling

- CSS is bundled with components
- Use existing CSS classes and patterns
- Follow the visual design of existing components
- Test in both light and dark modes (if applicable)

## Testing

- Tests are run with Vitest
- Test files should be placed alongside source files
- Currently minimal test coverage - focus on core functionality
- Run tests with `pnpm test` before submitting PRs

## Documentation

Documentation is built with Hyperbook and located in the `docs/` directory:
- `docs/book/index.md`: Main documentation entry
- `docs/book/development.md`: Development guide
- `docs/book/contributing.md`: Contribution guidelines
- Update docs when adding features that affect the public API

## CI/CD

GitHub Actions workflows:
- `pull-request.yml`: Runs tests and build on PRs
- `changeset-version.yml`: Manages version bumps and releases
- `docs.yml`: Deploys documentation

All PRs must pass:
1. TypeScript type checking (`pnpm lint`)
2. Tests (`pnpm test`)
3. Build (`pnpm build`)

## Important Notes

- **No force pushes** - Git force push is disabled
- **No rebase** - Use merge commits for combining branches
- **Minimal changes** - Make the smallest possible changes to achieve goals
- **Preserve working code** - Don't remove or modify working code unless necessary
- **Follow existing patterns** - Match the style and structure of existing code
- **Use ecosystem tools** - Prefer pnpm scripts and package tools over manual changes

## Dependencies

When adding new dependencies:
- Add to the appropriate package's `package.json`
- Use `pnpm add <package>` in the package directory
- Consider bundle size impact for the web component
- Prefer peer dependencies for React and related packages

## Common Pitfalls

- ❌ Don't use `npm` or `yarn` - always use `pnpm`
- ❌ Don't commit built artifacts (`dist/` folders)
- ❌ Don't modify `node_modules` or `pnpm-lock.yaml` manually
- ❌ Don't skip the build step - packages depend on each other
- ❌ Don't add tests that don't exist - follow existing test patterns
- ✅ Do run `pnpm install` after pulling changes
- ✅ Do run `pnpm build` before running tests
- ✅ Do commit your changes using the Changesets workflow
- ✅ Do test in both editor and preview modes

## Getting Help

- **Issues**: Open an issue on GitHub for bugs or feature requests
- **Community**: Join the Matrix community at https://matrix.to/#/#openpatch:matrix.org
- **Contact**: Reach out to contact@openpatch.org for support

## License

MIT License - maintained by OpenPatch (https://openpatch.org)
