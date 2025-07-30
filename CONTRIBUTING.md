# Contributing to Event Mashups

Thank you for your interest in contributing to Event Mashups! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Bugs

1. **Check existing issues** - Search for similar issues before creating a new one
2. **Use the bug report template** - Provide detailed information about the bug
3. **Include steps to reproduce** - Help us understand and fix the issue
4. **Add screenshots/videos** - Visual evidence helps a lot

### Suggesting Features

1. **Check existing feature requests** - Search for similar suggestions
2. **Use the feature request template** - Explain the use case and benefits
3. **Provide mockups** - Visual examples help us understand your vision
4. **Consider implementation** - Think about how it might be implemented

### Code Contributions

1. **Fork the repository** - Create your own copy
2. **Create a feature branch** - Use descriptive branch names
3. **Make your changes** - Follow our coding standards
4. **Test thoroughly** - Ensure your changes work correctly
5. **Submit a pull request** - Use our PR template

## 🛠 Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Git

### Local Development

1. **Fork and clone** the repository
2. **Install dependencies**: `npm install`
3. **Set up environment**: Copy `env.example` to `.env.local`
4. **Set up database**: Run `npm run db:push`
5. **Start development**: `npm run dev`

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type - use proper typing
- Use strict TypeScript configuration

### React/Next.js

- Use functional components with hooks
- Follow Next.js 14 App Router patterns
- Use proper error boundaries
- Implement proper loading states

### Styling

- Use Tailwind CSS for styling
- Follow mobile-first responsive design
- Use consistent spacing and colors
- Maintain accessibility standards

### Database

- Use Drizzle ORM for database operations
- Write proper migrations
- Use proper indexing
- Follow naming conventions

## 🧪 Testing

### Before Submitting

- [ ] Code runs without errors
- [ ] All existing tests pass
- [ ] New functionality is tested
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility checked

### Testing Checklist

- [ ] Unit tests for new functions
- [ ] Integration tests for API endpoints
- [ ] UI tests for new components
- [ ] Database migration tests
- [ ] Payment flow testing (if applicable)

## 📋 Pull Request Process

### PR Checklist

- [ ] Code follows project standards
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console errors or warnings
- [ ] Mobile responsive design
- [ ] Accessibility standards met

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots
Add screenshots if UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

## 🏷 Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high` - Urgent issues
- `priority: low` - Non-urgent issues

## 📞 Getting Help

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and ideas
- **Documentation** - Check our README and docs
- **Community** - Join our community channels

## 🎯 Areas for Contribution

### High Priority
- Bug fixes and performance improvements
- Security enhancements
- Mobile responsiveness improvements
- Payment system enhancements

### Medium Priority
- New features and integrations
- UI/UX improvements
- Documentation updates
- Testing coverage

### Low Priority
- Code refactoring
- Performance optimizations
- Developer experience improvements

## 📄 License

By contributing to Event Mashups, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Contributor hall of fame
- GitHub contributors list

Thank you for contributing to Event Mashups! 🎉 