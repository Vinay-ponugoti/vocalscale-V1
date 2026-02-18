# Git Workflow for VocalScale

## Branch Strategy

| Branch | Purpose | Protected? |
|--------|---------|------------|
| `main` | Production-ready code | ✅ Yes |
| `devagent` | Automated agent work (blogs, tasks) | ✅ Yes |

---

## DevAgent Branch Workflow

### Purpose
The `devagent` branch is where **automated blog creation** happens. Every Monday, the cron job:

1. Checks out `devagent` branch
2. Creates new blog post in `frontend/src/content/blog/posts.ts`
3. Commits with message: `feat(blog): [title]`
4. Pushes to `devagent` on GitHub
5. Notifies you to review

### Weekly Auto-Blog Workflow

The cron job does this automatically:
```bash
git checkout devagent
git pull origin devagent
# ... writes blog post ...
git add frontend/src/content/blog/posts.ts
git commit -m "feat(blog): [title]"
git push origin devagent
```

### Review & Merge to Main

After each automated blog creation:

1. **Review on GitHub**:
   - Visit: https://github.com/vinay-codess/vocalscale-V1/compare/main...devagent
   - Check the blog post quality
   - Review formatting and content

2. **Create Pull Request** (optional):
   - Click "Compare & pull request" on GitHub
   - Add any review notes
   - Request review if needed

3. **Merge to main**:
   ```bash
   git checkout main
   git pull origin main
   git merge devagent
   git push origin main
   ```

4. **Keep devagent clean** (after merge):
   ```bash
   git checkout devagent
   git merge main
   git push origin devagent
   ```

---

## Manual Workflow: Create Sub-Branch

```bash
cd /home/vinay/.openclaw/workspace/main-vocalscale-frontend
git checkout -b feature/ai-agent-integration
```

## Step 2: Make Your Changes
```bash
# Edit files...
git add .
git commit -m "Add AI agent integration features"
```

## Step 3: Push to GitHub
```bash
git push -u origin feature/ai-agent-integration
```

## Step 4: Create Pull Request
1. Go to GitHub
2. Click "Compare & pull request"
3. Review changes
4. Merge when ready
