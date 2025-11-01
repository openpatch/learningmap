---
name: Contributing
index: 2
---

# Contributing

Thank you for your interest in contributing to Learningmap! This guide will help you get started.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](https://github.com/openpatch/learningmap/blob/main/CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the [existing issues](https://github.com/openpatch/learningmap/issues) to avoid duplicates.

When creating a bug report, include:
- A clear and descriptive title
- Steps to reproduce the behavior
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Your environment (browser, OS, Node.js version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:
- A clear and descriptive title
- A detailed description of the proposed feature
- Explain why this enhancement would be useful
- If possible, provide examples of how it would work

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Set up your development environment** (see [Development](/development))
3. **Make your changes** following our coding standards
4. **Add tests** if you're adding functionality
5. **Run linting and tests**:
   ```bash
   pnpm lint
   pnpm test
   pnpm build
   ```
6. **Create a changeset**:
   ```bash
   pnpm exec changeset
   ```
   Follow the prompts to describe your changes
7. **Commit your changes** with a clear commit message
8. **Push to your fork** and submit a pull request

## Development Guidelines

### Code Style

- Follow the existing code style in the repository
- Use TypeScript with proper type definitions
- Run Prettier before committing (automatic with Husky)
- Keep components focused and modular

### Commit Messages

- Use clear and descriptive commit messages
- Start with a verb in present tense (e.g., "Add", "Fix", "Update")
- Reference issues and PRs when relevant

### Testing

- Write tests for new features
- Ensure existing tests pass
- Follow existing test patterns
- Run `pnpm test` before submitting

### Documentation

- Update documentation when adding features
- Add JSDoc comments for public APIs
- Update the changelog via changesets

## Project Structure

```
learningmap/
├── packages/
│   ├── learningmap/          # Core React component library
│   └── web-component/        # Web component wrapper
├── platforms/
│   └── web/                  # Web application
├── docs/                     # Documentation
└── scripts/                  # Build scripts
```

## Making Your First Contribution

Not sure where to start? Look for issues labeled:
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed

## Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Matrix Community**: Join us at https://matrix.to/#/#openpatch:matrix.org
- **Email**: contact@openpatch.org

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
