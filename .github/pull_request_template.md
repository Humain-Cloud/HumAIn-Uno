## Summary

<!-- Provide a clear and concise description of the changes in this PR. What does it do and why? -->

## Related Issues

<!-- Link to any related issues. Use "Closes #123" or "Fixes #456" to auto-close issues on merge. -->

- Closes #
- Related to #

## Type of Change

<!-- Check all that apply -->

- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 🔧 Refactor (code change that neither fixes a bug nor adds a feature)
- [ ] ⚡ Performance improvement
- [ ] 📝 Documentation update
- [ ] 🎨 Style/UI change (visual improvements, no logic changes)
- [ ] 🧪 Test addition or update
- [ ] 🔒 Security fix
- [ ] 📦 Dependency update
- [ ] 🏗️ Build/CI change

## Affected Areas

<!-- Check all components affected by this change -->

- [ ] Home Page
- [ ] Browse / Knowledge Hub
- [ ] Agent Detail Page
- [ ] Agent Creation Wizard
- [ ] LLM Model Finder
- [ ] User Dashboard
- [ ] Authentication / Sign-in
- [ ] Search
- [ ] Notifications
- [ ] Collections
- [ ] Settings
- [ ] API / Backend
- [ ] Database / Prisma Schema
- [ ] Supabase / Auth
- [ ] AI Chat Assistant
- [ ] Shared Components
- [ ] Infrastructure / Deployment
- [ ] Documentation

## Changes Made

<!-- Describe the specific changes you made. Be thorough but concise. -->

1.
2.
3.

## How Has This Been Tested?

<!-- Describe how you tested your changes. Include test environment, test cases, and any manual testing steps. -->

- [ ] Verified the development server starts without errors (`bun run dev`)
- [ ] Tested the affected feature(s) manually in the browser
- [ ] Verified no TypeScript errors (`bun run lint` passes)
- [ ] Tested responsive design (mobile, tablet, desktop)
- [ ] Tested dark mode / light mode
- [ ] Verified API endpoints return correct responses
- [ ] Tested edge cases and error handling
- [ ] Verified authentication flow (if applicable)

### Test Environment

- **Browser**: <!-- e.g., Chrome 131, Firefox 133, Safari 18 -->
- **OS**: <!-- e.g., macOS 15.2, Windows 11, Ubuntu 24.04 -->
- **Node.js/Bun**: <!-- e.g., Bun 1.1.38 -->
- **Database**: <!-- e.g., SQLite (dev) / Supabase PostgreSQL (prod) -->

### Test Cases

<!-- List the specific test scenarios you verified -->

1.
2.
3.

## Screenshots / Recordings

<!-- For UI changes, add screenshots or screen recordings showing the before and after states. -->

### Before

<!-- Screenshot or description of the previous state -->

### After

<!-- Screenshot or description of the new state -->

## Database Changes

<!-- If this PR includes database schema changes, describe them here. -->

- [ ] No database changes
- [ ] Prisma schema updated (run `bun run db:push`)
- [ ] Supabase migration required
- [ ] Data migration script included

### Schema Changes

<!-- Describe any changes to the Prisma schema or Supabase schema -->

## API Changes

<!-- If this PR introduces or modifies API endpoints, describe the changes. -->

- [ ] No API changes
- [ ] New endpoint(s) added
- [ ] Existing endpoint(s) modified
- [ ] Breaking API change

### Endpoint Details

<!-- List any new or modified endpoints -->

| Endpoint | Method | Change | Breaking? |
|---|---|---|---|
| | | | |

## Checklist

<!-- Go through each item and check it off. If something doesn't apply, leave it unchecked and add a comment explaining why. -->

### Code Quality

- [ ] My code follows the project's coding standards and TypeScript conventions
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have removed any debug logging, commented-out code, or unused imports
- [ ] My changes generate no new TypeScript errors or lint warnings

### Documentation

- [ ] I have updated the README if necessary
- [ ] I have updated API documentation if I changed endpoints
- [ ] I have added or updated JSDoc comments for new functions/types
- [ ] I have updated the Prisma schema documentation if applicable

### Testing

- [ ] I have tested my changes locally and they work as expected
- [ ] I have verified that existing functionality is not broken
- [ ] I have tested error scenarios and edge cases
- [ ] I have verified responsive design and cross-browser compatibility (for UI changes)

### Security

- [ ] My changes do not introduce any security vulnerabilities
- [ ] User inputs are properly validated (using Zod schemas)
- [ ] Authentication checks are in place for protected routes
- [ ] No sensitive data (API keys, tokens, passwords) is exposed in client-side code
- [ ] No SQL injection vectors introduced (using Prisma parameterized queries)

### Performance

- [ ] My changes do not significantly degrade performance
- [ ] Database queries are optimized (no N+1 queries)
- [ ] Large lists use virtualization where appropriate
- [ ] Images and assets are optimized

## Additional Notes

<!-- Any additional information that reviewers should know about. Context, design decisions, trade-offs, etc. -->

## Reviewer Notes

<!-- Optional: Specific areas where you'd like reviewer attention -->

- Please pay special attention to:
- I'm unsure about:
- I'd like feedback on:

---

**By submitting this pull request, I confirm that:**

- [ ] I have read the [Contributing Guidelines](./CONTRIBUTING.md)
- [ ] I have read the [Code of Conduct](./CODE_OF_CONDUCT.md)
- [ ] I agree to follow the project's [Security Policy](./SECURITY.md)
- [ ] My contribution is licensed under the same license as the project (MIT)
