# Contributing to A Plus+ 🤝

Thank you for your interest in contributing to A Plus+! We welcome contributions from the community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:

- Age, body size, disability
- Ethnicity, gender identity and expression
- Level of experience
- Nationality, personal appearance
- Race, religion, sexual orientation

### Our Standards

**Positive behavior includes:**

- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards others

**Unacceptable behavior includes:**

- Harassment, trolling, or insulting comments
- Publishing others' private information
- Any conduct inappropriate in a professional setting

---

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/a-plus-laptops.git
   cd a-plus-laptops
   ```
3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/original-owner/a-plus-laptops.git
   ```
4. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## 💻 Development Workflow

### 1. Keep Your Fork Updated

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### 2. Make Your Changes

- Write clean, maintainable code
- Follow the coding standards below
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Test build
npm run build
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add amazing feature"
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Open a Pull Request

Go to the original repository and click "New Pull Request"

---

## 📝 Coding Standards

### JavaScript/React

- **Use functional components** with hooks
- **Use descriptive variable names**
- **Keep functions small** and focused
- **Avoid nested ternaries** - use early returns instead
- **Use PropTypes** or TypeScript for type checking
- **Extract reusable logic** into custom hooks

**Good Example:**
```jsx
// ✅ Good
function ProductCard({ product }) {
  if (!product) return null;
  
  const handleAddToCart = () => {
    // Logic here
  };
  
  return (
    <div className="product-card">
      {/* JSX */}
    </div>
  );
}
```

**Bad Example:**
```jsx
// ❌ Bad
function ProductCard(props) {
  return props.product ? (
    <div>
      {/* lots of nested JSX */}
    </div>
  ) : null;
}
```

### CSS

- **Use BEM naming convention** for CSS classes
- **Keep specificity low** - avoid deep nesting
- **Use CSS variables** for theming
- **Mobile-first approach** - use `min-width` media queries

**Example:**
```css
/* ✅ Good */
.product-card {
  /* styles */
}

.product-card__image {
  /* styles */
}

.product-card__title {
  /* styles */
}

.product-card--featured {
  /* modifier */
}
```

### File Organization

- **One component per file**
- **Name files same as component**: `ProductCard.jsx`
- **Co-locate tests**: `ProductCard.test.jsx`
- **Co-locate styles**: `ProductCard.css`

### Imports

Keep imports organized:
```javascript
// 1. React imports
import { useState, useEffect } from 'react';

// 2. Third-party imports
import { motion } from 'framer-motion';

// 3. Internal imports
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

// 4. Styles
import './MyComponent.css';
```

---

## 📝 Commit Messages

We follow the **Conventional Commits** specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(cart): add product quantity selector

- Added increment/decrement buttons
- Updated cart total calculation
- Added validation for max quantity

Closes #123
```

```
fix(checkout): prevent duplicate orders

Fixed issue where clicking submit multiple times
created duplicate orders in Firestore.

Fixes #456
```

---

## 🔄 Pull Request Process

### Before Opening a PR

- [ ] Code follows style guidelines
- [ ] Added tests for new features
- [ ] All tests pass locally
- [ ] Updated documentation
- [ ] No console errors/warnings
- [ ] Tested in multiple browsers
- [ ] Tested on mobile devices

### PR Title

Use the same format as commit messages:
```
feat: add product comparison feature
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where needed
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests
- [ ] All tests pass locally
```

### Review Process

1. **Automated checks** must pass (linting, tests)
2. **At least one maintainer** must approve
3. **All comments** must be resolved
4. **No merge conflicts** with main branch

---

## 🧪 Testing Guidelines

### Unit Tests

Write unit tests for:
- Utility functions
- Context providers
- Custom hooks

**Example:**
```javascript
describe('productUtils', () => {
  it('should calculate discount correctly', () => {
    const result = calculateDiscount(100, 10);
    expect(result).toBe(90);
  });
});
```

### Component Tests

Test user interactions:
```javascript
import { render, screen, fireEvent } from '@testing-library/react';

test('adds product to cart when button clicked', () => {
  render(<ProductCard product={mockProduct} />);
  
  const button = screen.getByRole('button', { name: /add to cart/i });
  fireEvent.click(button);
  
  expect(screen.getByText(/added to cart/i)).toBeInTheDocument();
});
```

### Coverage Requirements

- **Minimum coverage**: 50%
- **Critical paths**: 80%+ (checkout, auth, payment)
- **Utility functions**: 100%

---

## 🐛 Reporting Bugs

**Before reporting:**
1. Check if the bug was already reported
2. Try to reproduce with latest version
3. Collect error messages and logs

**Bug report should include:**
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/videos if applicable
- Browser/OS information
- Error messages/logs

---

## 💡 Suggesting Features

**Feature requests should include:**
- Clear use case
- Why it's beneficial
- Proposed implementation (optional)
- Mockups/examples (if applicable)

---

## 📞 Contact

Questions? Reach out:
- **Email**: mhamed.saad.ibrahim@gmail.com
- **GitHub Issues**: For bug reports and features
- **GitHub Discussions**: For questions and ideas

---

## 🙏 Thank You!

Every contribution, no matter how small, is valuable. Thank you for helping make A Plus+ better!

---

**Happy Coding! 🚀**
