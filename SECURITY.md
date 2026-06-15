# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions of Humain-Uno:

| Version | Supported | Status |
|---|---|---|
| 0.2.x | ✅ | Active development |
| 0.1.x | ⚠️ | Critical fixes only |
| < 0.1 | ❌ | End of life |

> **Note**: Humain-Uno is currently in active development (pre-1.0). While we strive to maintain security across all versions, we recommend always using the latest release for the most up-to-date security patches.

---

## Reporting a Vulnerability

### ⚠️ Important: Do Not Report Security Vulnerabilities Through Public GitHub Issues

Publicly disclosing a vulnerability before it has been addressed puts all users at risk. We take security seriously and ask that you follow our responsible disclosure process.

### How to Report

If you discover a security vulnerability in Humain-Uno, please report it through one of the following channels:

1. **GitHub Security Advisories (Preferred)**
   - Navigate to the [Security tab](https://github.com/Humain-Cloud/HumAIn-Uno/security/advisories)
   - Click "Report a vulnerability"
   - Fill in the advisory form with details about the vulnerability

2. **Email**
   - Send a detailed report to **security@humain-uno.dev**
   - Use a descriptive subject line (e.g., "Security Vulnerability: XSS in Agent Detail Page")
   - Encrypt sensitive information using our PGP key (available upon request)

3. **Direct Contact**
   - Reach out to any project maintainer directly via private message
   - Include the details outlined below

### What to Include in Your Report

To help us assess and address the vulnerability quickly, please include:

- **Vulnerability Type**: e.g., XSS, SQL injection, CSRF, authentication bypass, data exposure
- **Affected Component**: e.g., API route, page, component, database query
- **Attack Vector**: How the vulnerability can be exploited
- **Impact**: What an attacker could achieve (data theft, privilege escalation, DoS, etc.)
- **Steps to Reproduce**: Detailed, step-by-step instructions
- **Proof of Concept**: Code, screenshots, or logs demonstrating the vulnerability
- **Suggested Fix**: If you have ideas for how to fix the issue
- **Your Contact Information**: So we can follow up with questions

### Response Timeline

We are committed to responding to security reports promptly:

| Milestone | Target Time |
|---|---|
| **Acknowledgment** | Within 48 hours of report |
| **Initial Assessment** | Within 5 business days |
| **Status Update** | Every 7 days until resolution |
| **Fix Development** | Depends on severity (see below) |
| **Disclosure** | After fix is released and users have had time to update |

### Severity Classification

We use the following severity levels to prioritize security fixes:

| Severity | Description | Target Fix Time |
|---|---|---|
| **🔴 Critical** | Remote code execution, authentication bypass, data exfiltration without auth | 24–48 hours |
| **🟠 High** | Privilege escalation, significant data exposure, authenticated RCE | 3–5 business days |
| **🟡 Medium** | Limited data exposure, CSRF, DoS with significant impact | 1–2 weeks |
| **🟢 Low** | Information disclosure, minor DoS, non-exploitable issues | Next scheduled release |

---

## Security Best Practices

### For Developers

When contributing to Humain-Uno, please follow these security best practices:

#### Authentication & Authorization

- **Always verify authentication** in API routes that require it
- **Use NextAuth.js session checks** on the server side
- **Validate user permissions** before performing privileged operations
- **Never expose** Supabase service role keys to the client
- **Use RLS policies** in Supabase for defense in depth

```typescript
// ✅ Good — Verify session before sensitive operations
import { getServerSession } from 'next-auth';

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... proceed with authenticated operation
}
```

#### Input Validation

- **Validate all inputs** using Zod schemas
- **Sanitize user-generated content** before rendering (use `react-markdown` with sanitization)
- **Never trust** client-side validation alone — always re-validate on the server
- **Use parameterized queries** via Prisma (never raw SQL with string interpolation)

```typescript
// ✅ Good — Zod validation
const Schema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(5000),
});

// ❌ Bad — No validation
const body = await request.json();
await db.agent.create({ data: body });
```

#### Data Protection

- **Environment variables**: Never commit secrets to the repository
- **API keys**: Always hash before storing; never return raw keys in responses
- **PII handling**: Minimize personal data collection; respect privacy preferences
- **HTTPS**: Always use HTTPS in production (enforced by deployment configuration)
- **CORS**: Restrict cross-origin access to trusted domains only

#### Frontend Security

- **No `dangerouslySetInnerHTML`** without proper sanitization
- **Use `rel="noopener noreferrer"`** for external links with `target="_blank"`
- **Avoid inline scripts** that could be manipulated
- **Content Security Policy**: Configure appropriate CSP headers

#### Dependencies

- **Keep dependencies updated** — regularly audit for known vulnerabilities
- **Review new dependencies** for security concerns before adding
- **Use `bun audit`** to check for known vulnerabilities
- **Pin dependency versions** to prevent supply chain attacks

### For Users

When using Humain-Uno:

- **Keep your instance updated** to the latest version
- **Use strong, unique passwords** for your accounts
- **Enable two-factor authentication** when available
- **Rotate API keys** regularly and revoke unused keys
- **Review permissions** granted to API keys
- **Report suspicious activity** to security@humain-uno.dev

---

## Security Architecture

### Authentication Flow

```
User → NextAuth.js → Supabase Auth → Session Token
                                            ↓
                                     Server-side Verification
                                            ↓
                                     RLS Policy Enforcement
                                            ↓
                                     Database Access
```

### Defense in Depth

Humain-Uno employs multiple layers of security:

1. **Application Layer**
   - NextAuth.js session validation on all protected routes
   - Zod input validation on all API endpoints
   - Rate limiting on sensitive endpoints (sign-in, API key generation)

2. **Database Layer**
   - Prisma ORM prevents SQL injection via parameterized queries
   - Supabase Row-Level Security (RLS) policies enforce data access rules
   - GIN indexes with full-text search use safe query parameterization

3. **Infrastructure Layer**
   - HTTPS enforcement in production
   - Secure cookie settings (httpOnly, secure, sameSite)
   - Environment variable isolation
   - CORS configuration for API endpoints

4. **Client Layer**
   - React's built-in XSS protection (JSX auto-escaping)
   - Content sanitization for user-generated markdown
   - Secure token storage (httpOnly cookies, not localStorage)

---

## Responsible Disclosure Policy

We believe in responsible disclosure and are committed to working with security researchers to verify and address potential vulnerabilities.

### Guidelines for Researchers

1. **Do not** access or modify other users' data without their consent
2. **Do not** degrade the performance or availability of the service
3. **Do not** publicly disclose the vulnerability before a fix is available
4. **Do** report the vulnerability as soon as it is discovered
5. **Do** provide sufficient detail for us to reproduce the issue
6. **Do** allow reasonable time for us to address the issue before any disclosure

### Safe Harbor

We will not pursue legal action against security researchers who:

- Make a good faith effort to comply with this policy
- Do not intentionally access or exfiltrate user data
- Do not degrade the service or exploit the vulnerability beyond what is necessary for demonstration
- Give us reasonable time to address the issue before public disclosure
- Report the vulnerability through the channels described above

### Recognition

We appreciate the efforts of security researchers and will:

- Acknowledge researchers in our security advisories (with their permission)
- Provide credit in release notes for reported vulnerabilities
- Work with researchers to coordinate responsible disclosure timelines

---

## Security Audit History

| Date | Scope | Auditor | Result |
|---|---|---|---|
| *Pending* | Full application security audit | — | — |

> Security audits will be conducted before major releases. Results will be summarized here.

---

## Contact

For security-related questions or concerns:

- **Security Email**: security@humain-uno.dev
- **GitHub Security**: [Report a vulnerability](https://github.com/Humain-Cloud/HumAIn-Uno/security/advisories)
- **PGP Key**: Available upon request for encrypted communications

For general questions about the project, please use:

- **General Email**: hello@humain-uno.dev
- **GitHub Discussions**: [Ask a question](https://github.com/Humain-Cloud/HumAIn-Uno/discussions)

---

## Policy Updates

This security policy may be updated from time to time. Significant changes will be communicated through:

- GitHub Security Advisories
- Release notes
- Project announcements

Last updated: 2025
