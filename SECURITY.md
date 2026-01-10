# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of A Plus+ seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please do NOT:

- Open a public GitHub issue
- Disclose the vulnerability publicly before it has been addressed

### Please DO:

1. **Email us directly** at: mhamed.saad.ibrahim@gmail.com
2. **Include in your report:**
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact
   - Suggested fix (if any)

### What to expect:

- **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
- **Updates**: We will keep you informed about our progress
- **Resolution**: We aim to resolve critical issues within 7 days
- **Credit**: With your permission, we will credit you in our CHANGELOG

## Security Best Practices

### For Contributors:

1. **Never commit sensitive data:**
   - API keys
   - Passwords
   - Private keys
   - Access tokens
   - `.env` files

2. **Use environment variables:**
   - Store all secrets in `.env` (excluded from Git)
   - Use `.env.example` as a template
   - Never hardcode credentials

3. **Keep dependencies updated:**
   - Regularly run `npm audit`
   - Update vulnerable packages promptly
   - Review security advisories

4. **Follow secure coding practices:**
   - Validate all user input
   - Sanitize data before database queries
   - Use HTTPS for all external requests
   - Implement proper authentication & authorization

### For Users:

1. **Keep your installation secure:**
   - Use strong passwords
   - Enable two-factor authentication (when available)
   - Keep your Firebase credentials private
   - Regularly update to the latest version

2. **Report suspicious activity:**
   - If you notice unusual behavior, report it immediately
   - Contact us at: mhamed.saad.ibrahim@gmail.com

## Security Measures in Place

- ✅ Firebase Authentication for secure user login
- ✅ Firestore Security Rules to protect data
- ✅ Environment variable protection
- ✅ Input validation on forms
- ✅ HTTPS enforcement
- ✅ Regular security audits

## Third-Party Services

This project uses the following third-party services:

- **Firebase** (Authentication, Firestore, Hosting)
- **EmailJS** (Email notifications)
- **Google Analytics** (Usage tracking)
- **reCAPTCHA** (Bot protection)
- **Vercel** (Hosting)

Please refer to their respective security policies for more information.

## License

This security policy is licensed under [MIT License](LICENSE).

---

**Last Updated**: January 10, 2026
