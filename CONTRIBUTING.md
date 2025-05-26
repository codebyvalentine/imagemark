# Contributing to ImageMark

Thank you for your interest in contributing to ImageMark! This document provides guidelines and information for contributors.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please treat all contributors with respect and create a welcoming environment for everyone.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm, yarn, or pnpm
- Git

### Development Setup

1. **Fork the repository**
   \`\`\`bash
   git clone https://github.com/codebyvalentine/imagemark.git
   cd imagemark
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Create a feature branch**
   \`\`\`bash
   git checkout -b feature/your-feature-name
   \`\`\`

4. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use semantic HTML and accessible markup
- Follow React best practices and hooks patterns
- Use Tailwind CSS for styling

### Commit Messages

Use conventional commit format:
\`\`\`
type(scope): description

[optional body]

[optional footer]
\`\`\`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
\`\`\`
feat(watermark): add rotation control for image watermarks
fix(upload): resolve drag and drop file validation issue
docs(readme): update installation instructions
\`\`\`

### Testing

- Write unit tests for utility functions
- Test components with React Testing Library
- Ensure cross-browser compatibility
- Test responsive design on multiple screen sizes

### Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure all tests pass**
4. **Update CHANGELOG.md** with your changes
5. **Request review** from maintainers

### Pull Request Template

\`\`\`markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Manual testing completed

## Screenshots
If applicable, add screenshots of UI changes
\`\`\`

## Project Structure

\`\`\`
imagemark/
├── app/                    # Next.js app directory
├── components/            # Reusable components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── public/               # Static assets
└── types/                # TypeScript type definitions
\`\`\`

## Feature Requests

Before submitting a feature request:

1. Check existing issues for duplicates
2. Provide clear use case and rationale
3. Consider implementation complexity
4. Discuss with maintainers if it's a major change

## Bug Reports

Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Screenshots if applicable

## Questions?

Feel free to open an issue for questions or reach out to the maintainers.

Thank you for contributing to ImageMark! 🎉
