# Contributing to Textora

First off, thank you for considering contributing to Textora! It's people like you that make open-source software such a great community.

## How Can I Contribute?

### 1. Reporting Bugs
If you find a bug, please create an issue on GitHub. Include:
- A clear and descriptive title.
- Steps to reproduce the bug.
- Your OS, browser, and version.
- Any relevant logs or screenshots.

### 2. Suggesting Enhancements
Have an idea for a new feature or improvement? We'd love to hear it! Open an issue describing:
- What the feature is.
- Why it would be useful.
- How you think it should be implemented.

### 3. Code Contributions
Ready to write some code? Follow these steps to submit your changes:

#### Step 1: Fork and Clone
1. Fork the repository on GitHub.
2. Clone your forked repository to your local machine:
   ```bash
   git clone https://github.com/YOUR-USERNAME/textora.git
   ```
3. Navigate to the project directory:
   ```bash
   cd textora
   ```

#### Step 2: Branch
Create a new branch for your feature or bugfix. Use a descriptive name:
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bugfix-name
```

#### Step 3: Install Dependencies
Install the required Node.js dependencies:
```bash
npm install
```

#### Step 4: Make Your Changes
Make your changes to the codebase. 
- Try to keep your changes focused and atomic.
- Follow the existing code style (we use standard ESLint and TypeScript rules).
- Test your changes thoroughly. 
  - To run the development server: `npm run dev`
  - To run existing tests: `npm run test`

#### Step 5: Commit
Commit your changes with a clear and descriptive commit message:
```bash
git add .
git commit -m "feat: add support for new translation provider"
```
*(We recommend following the [Conventional Commits](https://www.conventionalcommits.org/) specification).*

#### Step 6: Push and Create a Pull Request
1. Push your branch to your forked repository:
   ```bash
   git push origin your-branch-name
   ```
2. Go to the original Textora repository on GitHub.
3. You'll see a prompt to create a Pull Request (PR). Click it.
4. Fill out the PR template/description explaining what you changed and why.
5. Submit the PR for review!

## Code Style & Guidelines
- **TypeScript**: We use strict TypeScript. Ensure there are no type errors.
- **Components**: We use React functional components with hooks.
- **Styling**: We use Tailwind CSS for styling. Try to use existing design tokens where possible.

Thank you for contributing to Textora!
