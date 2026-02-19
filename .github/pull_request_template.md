---
name: Pull Request Template
about: Standard PR template for VocalScale development
title: '[type]: brief description'
labels: ''
assignees: ''
---

## 📋 Description
<!-- Provide a brief description of changes -->
- What does this PR do?
- Why is it needed?
- What problem does it solve?

## 🆔 Related Issues/Closes
<!-- Link related issues or use `Closes #issue-number` -->
Closes #issue-number
Related to #issue-number

## 📸 Screenshots/Videos
<!-- Add screenshots or videos if applicable -->
<!-- Use drag and drop to upload -->
![screenshot](url)

## 🔄 Type of Change
<!-- Check all that apply -->
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] ♻️ Refactor (code improvement without changing functionality)
- [ ] 📚 Documentation (documentation changes)
- [ ] 🎨 UI/UX (visual or user experience improvements)
- [ ] ⚡ Performance (performance improvements)
- [ ] 🔒 Security (security improvements)

## ✅ Testing
<!-- Describe how you tested this PR -->
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Screenshots/videos added

## 🧪 Checklist
<!-- Make sure all items are completed before submitting -->
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested my changes locally
- [ ] New and existing unit tests pass locally
- [ ] No TypeScript errors
- [ ] No ESLint warnings

## 🚀 Deployment Notes
<!-- Any special instructions for deployment -->
- Database migrations: [ ] Yes [ ] No
- Environment variables: [ ] Yes [ ] No (specify below)
- Service restarts: [ ] Yes [ ] No
- Other: _____________

## 📊 Performance Impact
<!-- Impact on build time, bundle size, runtime performance -->
- Build time impact: (e.g., +5s, -2s, no change)
- Bundle size impact: (e.g., +10KB, -5KB, no change)
- Runtime performance: (e.g., faster, slower, no change)

## 🔐 Security Considerations
<!-- Address any security implications -->
- [ ] No security implications
- [ ] Security review needed: (describe)
- [ ] Requires changes to environment variables: (specify)

## 📚 Documentation
<!-- Links to documentation changes -->
- [ ] Documentation updated
- [ ] API documentation updated
- [ ] README updated
- [ ] No documentation needed

## 💬 Additional Context
<!-- Any additional information that might be helpful -->
**Testing Instructions:**
1.
2.
3.

**Known Limitations:**
- Limitation 1
- Limitation 2

**Future Improvements:**
- Improvement 1
- Improvement 2

---

## 🎯 Deployment Decision

### **Merge to devagent** (Feature Integration)
- ✅ Ready for devagent
- ⚠️ Requires fixes (describe above)
- ❌ Not ready (describe blockers)

### **Merge to main** (Production Deployment)
- ✅ Ready for production
- 🔄 Merge to devagent first
- ⚠️ Requires testing before production
- ❌ Not ready for production

---

## 📢 Reviewer Notes

**Priority:** [🔴 High / 🟡 Medium / 🟢 Low]

**Review Focus Areas:**
- [ ] Code logic and correctness
- [ ] Security implications
- [ ] Performance impact
- [ ] Testing coverage
- [ ] Documentation completeness

**Special Instructions for Reviewers:**
- Focus on: ________
- Look out for: ________
- Testing environment: ________

---

*Template Version: 1.0 | Last Updated: 2024-02-18*
