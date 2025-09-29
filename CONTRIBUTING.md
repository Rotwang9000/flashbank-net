# Contributing to FlashBank.net

Thank you for your interest in contributing to FlashBank.net! This project aims to create the world's first truly immutable flash loan network.

## 🎯 Project Goals

- **Immutable Security**: No upgrades, no rug pulls, maximum trust
- **MEV Efficiency**: 44% lower fees than existing solutions
- **Zero Risk**: ETH only at risk for microseconds during flash loans
- **Community Driven**: Open source and transparent development

## 🛡️ Security First

This project handles real user funds. All contributions must prioritise security:

- **Smart Contract Changes**: Require extensive testing and review
- **Test Coverage**: All new features must include comprehensive tests
- **Audit Trail**: Major changes need security audit consideration
- **Documentation**: Security implications must be clearly documented

## 🚀 Getting Started

### Prerequisites

- Node.js v18+ (though v21.7.3 works with warnings)
- npm or yarn
- Git
- Understanding of Solidity and DeFi concepts

### Setup Development Environment

```bash
git clone https://github.com/flashbank-net/flashbank
cd flashbank
npm install
```

### Run Tests

```bash
# Run all tests
npm test

# Run security tests specifically
npx hardhat test test/SecurityTests.test.js

# Run with gas reporting
REPORT_GAS=true npm test
```

### Local Development

```bash
# Start local hardhat network
npx hardhat node

# Deploy contracts locally
npx hardhat run scripts/deploy-immutable.js --network localhost

# Start website development server
cd website && npm run dev
```

## 📝 Contribution Guidelines

### Smart Contract Contributions

1. **Security Review Required**: All smart contract changes must be reviewed by core team
2. **Test Coverage**: Minimum 95% test coverage for new features
3. **Immutability**: Changes should not compromise the immutable nature
4. **Gas Optimisation**: Code should be gas-efficient
5. **Documentation**: Comprehensive NatSpec comments required

### Website/Frontend Contributions

1. **Responsive Design**: Must work on mobile and desktop
2. **Web3 Integration**: Proper error handling for wallet interactions
3. **Accessibility**: Follow WCAG guidelines
4. **Performance**: Optimise for fast loading times
5. **User Experience**: Clear, intuitive interfaces

### Testing Contributions

1. **Security Tests**: Focus on attack vectors and edge cases
2. **Integration Tests**: End-to-end functionality testing
3. **Fuzz Testing**: Random input testing for robustness
4. **Performance Tests**: Gas usage and optimization testing

## 🔍 Code Review Process

1. **Fork & Branch**: Create feature branch from `main`
2. **Implement**: Make your changes with appropriate tests
3. **Test**: Ensure all tests pass including new ones
4. **Document**: Update documentation and comments
5. **Pull Request**: Submit PR with detailed description
6. **Review**: Address feedback from maintainers
7. **Merge**: Approved PRs merged to `main`

### Pull Request Requirements

- [ ] All tests pass
- [ ] Security implications documented
- [ ] Gas costs considered and optimised
- [ ] Documentation updated
- [ ] Breaking changes highlighted

## 🐛 Bug Reports

### Security Vulnerabilities

**DO NOT** open public issues for security vulnerabilities. Email: security@flashbank.net

### Regular Bugs

Use GitHub issues with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Screenshots if applicable

## 💡 Feature Requests

We welcome feature suggestions! Please:
- Check existing issues to avoid duplicates
- Provide detailed use case description
- Consider security and immutability implications
- Discuss implementation approach

## 📋 Development Priorities

### High Priority
- Security audits and fixes
- Gas optimisation
- Multi-chain deployment
- Advanced testing

### Medium Priority  
- Analytics dashboard
- MEV strategy templates
- Documentation improvements
- Community tools

### Low Priority
- UI/UX enhancements
- Marketing materials
- Integration examples
- Performance monitoring

## 🧪 Testing Standards

### Required Tests
- Unit tests for all functions
- Integration tests for workflows
- Security tests for vulnerabilities
- Edge case testing
- Failure mode testing

### Test Categories
- **Security Tests**: Attack resistance, access control
- **Functional Tests**: Core functionality verification
- **Integration Tests**: Contract interaction testing
- **Performance Tests**: Gas usage and limits
- **Edge Cases**: Boundary conditions and error handling

## 🏗️ Architecture Principles

### Immutability
- No proxy patterns
- No upgrade mechanisms
- Hardcoded security limits
- Transparent operations

### Security
- Reentrancy protection
- Access control
- Input validation
- Error handling
- Event logging

### Efficiency
- Gas optimisation
- Minimal external calls
- Efficient data structures
- Batch operations where possible

## 📚 Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh/)

## 📞 Community

- **Discord**: [discord.gg/flashbank](https://discord.gg/flashbank)
- **Twitter**: [@FlashBankNet](https://twitter.com/FlashBankNet)
- **GitHub**: [github.com/flashbank-net](https://github.com/flashbank-net)
- **Email**: contribute@flashbank.net

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Together, let's build the most secure and efficient flash loan network in DeFi! 🚀**
