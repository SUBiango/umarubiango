# Website Testing Guide

## Manual Testing Checklist

### Contact Form Validation
- [x] Open contact page
- [x] Try submitting empty form → Should show validation errors
- [x] Enter invalid email → Should show "valid email" error
- [x] Fill all fields correctly → Should submit successfully
- [x] Check that error states clear on input
- [x] Verify terminal-style error messages appear (not browser alerts)

### Navigation
- [x] Test mobile menu toggle on small screens
- [x] Verify all nav links work
- [x] Check active page highlighting
- [x] Test skip-to-content link (Tab key)
- [x] Verify keyboard navigation works

### Loading States
- [x] Homepage: Check lab/notes/now previews load
- [x] Verify animated "loading..." dots appear
- [x] Check error states if API fails (network throttle)
- [x] Test offline behavior

### Accessibility
- [ ] Run Lighthouse accessibility audit (should be >95)
- [ ] Check color contrast ratios
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Verify all images have alt text
- [ ] Test keyboard-only navigation

### Notes System
- [x] Click on a note from list
- [x] Verify URL hash updates
- [x] Click browser back button → Should return to list
- [x] Open note directly via URL with hash
- [x] Check that notes render correctly

### Performance
- [ ] Run Lighthouse performance audit
- [ ] Check typewriter animation speed on first visit
- [ ] Refresh page → Animation should be faster (localStorage check)
- [ ] Test on slow 3G connection
- [ ] Verify fonts load properly

### SEO & Metadata
- [ ] View page source → Check all meta tags present
- [ ] Verify OG image meta tags on all pages
- [ ] Check robots.txt is accessible
- [ ] Check sitemap.xml is accessible
- [ ] Test social media sharing preview

### Cross-Browser Testing
- [x] Chrome/Edge (latest)
- [x] Firefox (latest)
- [x] Safari (latest)
- [x] Mobile Safari (iOS)
- [x] Chrome Mobile (Android)

## Automated Testing (Future)

For automated E2E testing, consider:
- Playwright or Cypress for form validation
- Lighthouse CI for performance regression testing
- Pa11y for accessibility monitoring

## Critical Paths to Test

1. **Homepage Load**
   - Typewriter animation completes
   - All previews load successfully
   - Navigation works

2. **Contact Form**
   - Validation works
   - Submission to Netlify Forms
   - Error handling

3. **Notes System**
   - List view loads
   - Individual notes load
   - Browser history works
   - Back button functions

## Test on Deployment

After deploying to Netlify:
- [ ] Verify all assets load (no 404s)
- [ ] Test contact form submission
- [ ] Check Netlify Forms dashboard for submissions
- [ ] Verify redirects work (_redirects file)
- [ ] Test HTTPS certificate
- [ ] Check sitemap.xml indexing in Google Search Console
