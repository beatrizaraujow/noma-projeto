# SECURITY POLICIES FOR DEMO/STUDY DEPLOYMENT

## ⚠️ Important Notice

This project contains demo/study deployment configurations. **DO NOT use these settings in production environments.**

## 🔒 What's Safe in This Repository

### ✅ Included (Safe for Public Repo)
- Source code
- `.env.example` files with fake/example values
- Documentation
- Configuration files without secrets
- Database schema (without data)
- Example data seeds (fake data only)

### ❌ Excluded (Never in Git)
- `.env` files with real credentials
- `node_modules/`
- Build artifacts (`.next/`, `dist/`)
- User uploads (`uploads/`)
- Real database files
- Production secrets
- OAuth credentials (real)
- API keys (real)
- Private keys

## 🔐 Security Best Practices

### For Study/Demo Deployment

1. **Use Separate OAuth Apps**
   - Create dev/demo apps on Google/GitHub/etc
   - Use localhost URLs for development
   - Use test/staging URLs for demo deployment

2. **Generate Strong Secrets**
   ```bash
   # Generate JWT secret
   openssl rand -base64 32
   
   # Or use Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Use Fake Data**
   - Never use real user emails
   - Use faker.js for seed data
   - Clear data between demos if needed

4. **Environment Variables**
   ```bash
   # .env.example (Safe - commit to Git)
   DATABASE_URL="postgresql://user:pass@localhost:5432/noma"
   
   # .env (Private - NEVER commit)
   DATABASE_URL="postgresql://real_user:real_pass@real_host:5432/noma"
   ```

5. **Configure .gitignore**
   ```gitignore
   # Secrets
   .env
   .env.local
   .env*.local
   
   # Builds
   node_modules/
   .next/
   dist/
   
   # Data
   uploads/
   *.db
   *.log
   ```

## 🚨 What to Do If You Accidentally Committed Secrets

1. **Immediately rotate the compromised credentials**
2. **Remove from Git history:**
   ```bash
   # Remove file from all commits
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push
   git push origin --force --all
   ```
3. **Report to security team if applicable**

## 📞 Reporting Security Issues

If you find a security vulnerability, please email: [security contact]

**Do NOT create public issues for security problems.**

## ✅ Pre-Deployment Checklist

Before deploying or sharing this repository:

- [ ] `.env` is in `.gitignore`
- [ ] No real secrets in code
- [ ] `.env.example` has only fake values
- [ ] OAuth apps are dev/demo instances
- [ ] Database has fake seed data
- [ ] README warns about study/demo nature
- [ ] Production settings are documented separately
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled (for public demos)

## 📚 Related Documentation

- [Deploy Study Guide](DEPLOY_STUDY.md)
- [Quick Deploy](README_DEPLOY.md)
- [Security Best Practices](https://owasp.org/www-project-top-ten/)

---

**Remember:** This is a STUDY/DEMO project. For production deployment, implement proper security measures, monitoring, and follow industry best practices.
