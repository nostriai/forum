# Forum - a digital marketplace on nostr protocol

Forum is a digital marketplace built on the Nostr protocol, envisioned as a place to exchange model parameters that are trained using federated inference over relays (FIOR). It is developed using React, Vite, and Docker.

## Project Overview

The digital marketplace serves as a platform where users can browse, exchange, and manage model parameters.

## Architectural Overview

The repository is organized to separate concerns and improve maintainability:

- **/src**
  - **components/**: Contains reusable UI components (e.g., Header, Footer, Layout, RequireAuth).
  - **pages/**: Contains page-level components (e.g., Home, Marketplace, NotFound, Unauthorized).
  - **context/**: Holds React context providers (e.g., AuthManager).
  - **services/**: Contains business logic and service integrations (e.g., nostrService for interacting with the Nostr protocol).
  - **hooks/**: Contains custom React hooks (e.g., useNostr for encapsulating Nostr data fetching).

## Setup and Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Start the development server**
   ```bash
   npm run dev
   ```
4. **Docker Deployment**
   - Use the provided `docker-compose.yml` and `Dockerfile` for containerized deployment.

## Testing & Quality Assurance

### Running Tests
```bash
# Run all tests with coverage reporting
npm test -- --coverage

# Run specific test file
npm test src/services/nostrService.test.js

# Watch mode during development
npm test -- --watch
```

### Code Quality Tools
```bash
# Lint check
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Format code
npm run format

# Check formatting without changes
npm run format:check
```

### Pre-commit Hooks
The project uses Husky to ensure:
- Code passes ESLint checks
- Tests for staged files pass
- Consistent code formatting with Prettier
- Commit messages follow conventional format

### Test Case Strategy
- **Unit Tests:** Service layer and utility functions
  - Services (nostrService)
  - Hooks (useNostr)
  - Utility functions
- **Component Tests:** Individual React components
  - Layout components (Header, Footer, Layout)
  - Page components (Home, Marketplace, NotFound)
  - Auth components (RequireAuth)
- **Integration Tests:** Component interactions and context
  - Authentication flows
  - Routing behaviors
  - Context providers
- **Coverage Requirements:**
  - Global threshold: 80%+ (enforced in CI)
  - Branches: 80%
  - Functions: 80%
  - Lines: 80%
  - Statements: 80%

### Testing Tools & Setup
- **Jest:** Test runner and assertion library
- **React Testing Library:** Component testing
- **Jest DOM:** DOM testing utilities
- **Mock Service Worker:** API mocking (planned)
- **Cypress:** E2E testing (planned)

### Reporting & Monitoring
- Coverage reports: `/coverage`
  - HTML report: `/coverage/lcov-report/index.html`
  - Cobertura: `/coverage/cobertura-coverage.xml`
  - JSON: `/coverage/coverage-final.json`
- Test results: Stored as GitHub Actions artifacts
- Codecov integration: Automated coverage tracking

## CI/CD Pipeline

### Workflows

1. **Test Workflow** (.github/workflows/test.yml)
   - Runs on push and pull requests
   - Executes test suite with coverage
   - Performs linting and format checks
   - Uploads coverage reports
   - Enforces coverage thresholds

2. **Build & Deploy** (.github/workflows/build-deploy.yml)
   - Builds production assets
   - Performs security audit
   - Stores build artifacts
   - Deployment configuration (customizable)

3. **Version Management** (.github/workflows/version-bump.yml)
   - Automated version bumping
   - Conventional commit enforcement
   - Release notes generation
   - Git tag management

### Environment Management
- Development: Local development environment
- Staging: Pre-production verification
- Production: Live deployment
- Environment-specific configurations via GitHub Secrets

### Security
- Dependency scanning
- Code security analysis
- npm audit checks
- Protected branch policies

## Coding Guidelines

- **Consistency:**  
  Follow the coding standards enforced by ESLint and Prettier.
  
- **Documentation:**  
  Use inline comments and JSDoc to document non-trivial logic.
  
- **Modularity:**  
  Ensure components are small, focused, and reusable.

## Contribution Guidelines

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/new-feature
   ```
3. Commit your changes:
   ```bash
   git commit -am 'Add new feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/new-feature
   ```
5. Create a Pull Request.

## Future Enhancements

- Enhancing marketplace features, such as filtering and detailed model views.
- Increasing test coverage and introducing further modularization as the project scales.
