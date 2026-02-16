# Domain Setup: sparkgood.io → Vercel

This guide walks through connecting the sparkgood.io domain to your Vercel deployment.

---

## Step 1: Add Custom Domain in Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your **sparkgood** project
3. Click **Settings** in the top navigation
4. Click **Domains** in the left sidebar
5. In the "Add Domain" field, enter: `sparkgood.io`
6. Click **Add**

Vercel will show you the DNS records you need to configure. Keep this page open.

---

## Step 2: Configure DNS Records

Go to your domain registrar (where you purchased sparkgood.io) and add these DNS records:

### Option A: Using Vercel's Nameservers (Recommended)

This gives Vercel full control over DNS, enabling automatic SSL and optimal routing.

1. In your registrar's dashboard, find **Nameservers** or **DNS Settings**
2. Replace the existing nameservers with Vercel's:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
3. Save changes

**Note:** Nameserver changes can take up to 48 hours to propagate globally.

---

### Option B: Using A and CNAME Records

If you want to keep your current DNS provider, add these records:

#### For the root domain (sparkgood.io):

| Type | Name | Value |
|------|------|-------|
| A | @ | `76.76.21.21` |

#### For the www subdomain (www.sparkgood.io):

| Type | Name | Value |
|------|------|-------|
| CNAME | www | `cname.vercel-dns.com` |

**Common registrar instructions:**

- **Namecheap:** Advanced DNS → Add New Record
- **GoDaddy:** DNS Management → Add Record
- **Google Domains:** DNS → Custom Records
- **Cloudflare:** DNS → Add Record (set Proxy Status to "DNS only" for initial setup)

---

## Step 3: Verify Domain Configuration

### In Vercel Dashboard

1. Return to **Settings → Domains** in your Vercel project
2. You should see sparkgood.io listed
3. Vercel will show one of these statuses:
   - **Valid Configuration** (green checkmark) - You're done!
   - **Pending Verification** - DNS is still propagating, wait 5-30 minutes
   - **Invalid Configuration** - Check your DNS records match exactly

### Test in Browser

Once Vercel shows "Valid Configuration":

1. Open a new browser tab
2. Go to: `https://sparkgood.io`
3. Verify:
   - The site loads correctly
   - The URL shows `https://` (SSL certificate is active)
   - No security warnings appear

### Command Line Verification

Check DNS propagation:

```bash
# Check A record
dig sparkgood.io A +short
# Should return: 76.76.21.21

# Check CNAME for www
dig www.sparkgood.io CNAME +short
# Should return: cname.vercel-dns.com

# Check SSL certificate
curl -I https://sparkgood.io
# Should return: HTTP/2 200
```

---

## Step 4: Configure Redirects (Optional but Recommended)

In Vercel Dashboard → Settings → Domains:

1. Set **sparkgood.io** as the primary domain
2. Configure www.sparkgood.io to redirect to sparkgood.io (or vice versa)
3. This ensures all traffic goes to a single canonical URL

---

## Troubleshooting

### "DNS not configured correctly"

- Double-check the A record value is exactly `76.76.21.21`
- Ensure there are no conflicting A records for the same domain
- Wait up to 48 hours for DNS propagation (usually 5-30 minutes)

### "SSL certificate pending"

- Vercel automatically provisions SSL via Let's Encrypt
- This happens after DNS is verified
- Usually takes 1-5 minutes after DNS verification

### Site shows old content or different site

- Clear your browser cache
- Try an incognito/private window
- Check if there's a cached DNS entry: `sudo dscacheutil -flushcache` (macOS)

### Using Cloudflare?

If your DNS is managed by Cloudflare:
1. Set the proxy status to **DNS only** (gray cloud) initially
2. After Vercel verifies the domain, you can enable the proxy (orange cloud)
3. In Cloudflare SSL/TLS settings, set encryption mode to **Full (strict)**

---

## Quick Reference

| What | Value |
|------|-------|
| Domain | sparkgood.io |
| A Record IP | 76.76.21.21 |
| CNAME Target | cname.vercel-dns.com |
| Vercel Nameservers | ns1.vercel-dns.com, ns2.vercel-dns.com |
| Vercel Dashboard | vercel.com/dashboard → sparkgood → Settings → Domains |

---

## Next Steps After Domain Setup

1. Update any hardcoded localhost URLs in the codebase to use sparkgood.io
2. Set up environment variables in Vercel for production API keys
3. Configure Supabase to allow sparkgood.io as an authorized domain
4. Test authentication flows on the production domain
