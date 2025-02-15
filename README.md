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

## Code Quality and Testing

- **Linting and Formatting:**  
  The project uses ESLint and Prettier to maintain code quality. Configuration files (`.eslintrc.js` and `.prettierrc`) are provided to enforce consistency.

- **Type Checking and Documentation:**  
  Consider using PropTypes or TypeScript, along with JSDoc annotations, to further improve code quality and maintainability.

- **Testing:**  
  Unit tests and integration tests can be implemented using Jest and React Testing Library to ensure robustness.

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
