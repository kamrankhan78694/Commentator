# 🚀 Production Deployment Checklist

## Pre-Deployment

### Security Verification
- [ ] Run `npm audit` — no critical or high vulnerabilities
- [ ] Run CodeQL security scan — no new alerts
- [ ] Verify Firebase security rules are deployed
- [ ] Confirm CSRF protection is enabled
- [ ] Verify input sanitization is active
- [ ] Check for hardcoded secrets in codebase

### Environment Variables
- [ ] `FIREBASE_API_KEY` is set from environment (not hardcoded fallback)
- [ ] `FIREBASE_AUTH_DOMAIN` is configured
- [ ] `FIREBASE_DATABASE_URL` points to production project
- [ ] `FIREBASE_PROJECT_ID` is correct for production
- [ ] All sensitive tokens are in GitHub Secrets (not committed)

### Testing
- [ ] All unit tests pass (`npm run test:unit`)
- [ ] All integration tests pass (`npm run test:integration`)
- [ ] All security tests pass (`npm run test:security`)
- [ ] Manual smoke test of comment submission
- [ ] Manual smoke test of authentication flow
- [ ] Manual smoke test of real-time comment updates

### Build & Configuration
- [ ] `npm run build:config:prod` completes successfully
- [ ] Production config validates (`npm run config:validate`)
- [ ] ESLint passes with no errors (`npm run lint`)
- [ ] All required files exist (package.json, firebase.json, database.rules.json)

---

## Deployment

### Staging Deploy
- [ ] Deploy to staging: `npm run deploy:staging`
- [ ] Verify staging URL is accessible
- [ ] Run smoke tests against staging
- [ ] Check Firebase console for errors

### Production Deploy
- [ ] Deploy to production: `npm run deploy:prod`
- [ ] Verify production URL is accessible
- [ ] Run smoke tests against production
- [ ] Monitor Firebase console for 15 minutes

---

## Post-Deployment

### Verification
- [ ] Homepage loads correctly
- [ ] Comment submission works
- [ ] Authentication (anonymous + email) works
- [ ] Real-time updates function
- [ ] No console errors in browser

### Rollback Procedures
1. **Immediate Rollback**: `firebase hosting:rollback --project production`
2. **Database Rules Rollback**: Deploy previous `database.rules.json` from git history
3. **Full Rollback**: Revert git commit and redeploy

### Monitoring
- [ ] Check error rates in Firebase console
- [ ] Verify database read/write operations
- [ ] Monitor authentication success rates
- [ ] Check hosting bandwidth and response times

---

*Last updated: February 2026*
