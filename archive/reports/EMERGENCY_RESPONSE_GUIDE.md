# 🚨 Emergency Response Guide

## Incident Classification

### Severity Levels
| Level | Description | Response Time | Examples |
|-------|------------|---------------|----------|
| **P0 — Critical** | Service completely down | < 15 minutes | Database unreachable, hosting down |
| **P1 — High** | Major feature broken | < 1 hour | Auth failures, comment submission broken |
| **P2 — Medium** | Partial degradation | < 4 hours | Slow response times, UI rendering issues |
| **P3 — Low** | Minor issue | < 24 hours | Cosmetic bugs, non-critical warnings |

---

## Security Incident Response

### 1. Identification
- Check Firebase console for unusual activity
- Review error logs for suspicious patterns
- Monitor for unauthorized database access

### 2. Containment
- **Disable write access**: Update Firebase rules to read-only mode
- **Rotate keys**: Generate new Firebase API keys if compromised
- **Block IPs**: Use Firebase App Check to block suspicious origins

### 3. Investigation
- Review Firebase audit logs
- Check GitHub Actions logs for unauthorized deployments
- Analyze database access patterns

### 4. Resolution
- Fix the vulnerability
- Deploy security patch
- Restore normal access controls

### 5. Post-Incident
- Document the incident timeline
- Update security rules if needed
- Conduct post-mortem review

---

## Recovery Procedures

### Database Recovery
1. Check Firebase console for database status
2. If data corruption: restore from automated daily backup
3. Verify data integrity after restoration

### Hosting Recovery
1. Check Firebase Hosting status
2. If deployment broken: `firebase hosting:rollback`
3. If CDN issues: clear Firebase hosting cache

### Authentication Recovery
1. Check Firebase Auth console for status
2. If auth service down: enable anonymous fallback mode
3. Verify auth tokens are being issued correctly

---

## Contact & Escalation

### On-Call Responsibilities
- **First responder**: Assess severity, begin containment
- **Project lead**: Coordinate response, communicate status
- **Security lead**: Handle security-specific incidents

### Communication
- Post status updates to GitHub Issues
- Notify affected users if data was impacted
- Document all actions taken during response

---

*Last updated: February 2026*
