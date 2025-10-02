# Contributing to SUI Airdrop Tool

Thank you for your interest in contributing to the SUI Airdrop Tool! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- A SUI wallet for testing

### Development Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/sui-airdrop.git
   cd sui-airdrop
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Code Style

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Ensure all code is properly typed

## Testing

- Test your changes thoroughly before submitting
- Test with both testnet and mainnet (be careful with mainnet!)
- Verify CSV parsing works with various formats
- Test wallet connection with different wallet types

## Pull Request Process

1. Create a feature branch from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:

   ```bash
   git add .
   git commit -m "Add: brief description of your changes"
   ```

3. Push your branch to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request on GitHub

### Pull Request Guidelines

- Provide a clear description of what your PR does
- Reference any related issues
- Ensure all CI checks pass
- Request review from maintainers
- Be responsive to feedback

## Issue Reporting

When reporting issues, please include:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS information
- Wallet type and version
- Any error messages or console logs

## Feature Requests

For feature requests, please:

- Check existing issues first
- Provide a clear use case
- Explain the expected behavior
- Consider implementation complexity

## Security

- Do not commit sensitive information (private keys, API keys, etc.)
- Report security vulnerabilities privately to the maintainers
- Follow responsible disclosure practices

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow GitHub's community guidelines

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue for questions or reach out to the maintainers.
