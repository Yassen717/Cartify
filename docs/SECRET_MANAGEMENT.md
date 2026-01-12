# Secret Management Guide

## Generating Secure Secrets

### JWT Secrets

Generate new JWT secrets using Node.js crypto:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Environment Variables

1. Copy `.env.example` to `.env`
2. Generate new secrets using the commands above
3. Replace placeholder values in `.env`
4. **NEVER** commit `.env` to version control

### Production Deployment

1. Generate new secrets for production
2. Store secrets in secure environment variable management system
3. Use different secrets for each environment (dev, staging, production)
4. Rotate secrets periodically (every 90 days recommended)

### Security Best Practices

- Use 64-byte (128 hex characters) secrets minimum
- Never reuse secrets across environments
- Never share secrets via email or chat
- Use environment variable management tools (AWS Secrets Manager, HashiCorp Vault, etc.)
- Rotate secrets if compromised
- Log secret rotation events

## Checking Git History

To check if `.env` was ever committed:

```bash
git log --all --full-history -- "backend/.env"
```

If found, contact your team lead immediately to coordinate secret rotation and git history cleanup.
