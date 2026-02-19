# Git Workflow Guide - Waey Project

## ✅ Initial Setup (Done)

- [x] Git repository initialized
- [x] .gitignore created
- [x] Initial commit made
- [x] Commit message template configured

---

## 📝 Common Git Commands

### Check Status
```bash
git status          # See changed files
git status --short  # Compact view
```

### View Changes
```bash
git diff            # See unstaged changes
git diff --staged   # See staged changes
git log             # View commit history
git log --oneline   # Compact history
```

### Stage Files
```bash
git add <file>      # Stage specific file
git add .           # Stage all changes
git add -p          # Stage interactively
```

### Commit Changes
```bash
git commit -m "feat: add new feature"
git commit          # Opens editor with template
```

### View History
```bash
git log
git log --graph --oneline --all
git show <commit>
```

---

## 🎯 Commit Message Format

Use conventional commits:

```
<type>: <subject>

Types:
- feat:     New feature
- fix:      Bug fix
- docs:     Documentation
- style:    Formatting
- refactor: Code restructuring
- test:     Tests
- chore:    Maintenance
```

**Examples:**
```bash
git commit -m "feat: add password reset functionality"
git commit -m "fix: resolve login validation error"
git commit -m "docs: update API documentation"
git commit -m "refactor: simplify authentication logic"
```

---

## 📋 Recommended Workflow

### 1. Before Starting Work
```bash
git status              # Check current state
git pull                # Get latest changes (if syncing)
```

### 2. While Working
```bash
git status              # Check what changed
git diff                # Review changes
git add <files>         # Stage relevant files
```

### 3. Commit Changes
```bash
git commit -m "type: description"
```

### 4. After Commit
```bash
git log --oneline -5    # Verify commit
git status              # Ensure clean state
```

---

## 🔍 Useful Aliases (Optional)

Add to `~/.gitconfig` for shortcuts:

```ini
[alias]
    co = checkout
    br = branch
    ci = commit
    st = status
    lg = log --oneline --graph --all
    last = log -1 HEAD
    unstage = reset HEAD --
```

Usage:
```bash
git st      # instead of git status
git lg      # instead of git log --oneline --graph --all
```

---

## 📦 Backup Strategy (Local Only)

Since we're not using GitHub, create periodic backups:

### Option 1: Clone to Backup Location
```bash
git clone /mnt/HDD/Programming/Web/projects/react-waey /path/to/backup/react-waey-backup
```

### Option 2: Create Archive
```bash
git archive --format=zip --output=../backup.zip main
```

### Option 3: Bare Repository
```bash
git clone --bare /mnt/HDD/Programming/Web/projects/react-waey /path/to/react-waey.git
```

---

## 🚨 Undo Changes

### Unstage Files
```bash
git reset HEAD <file>
```

### Discard Local Changes
```bash
git checkout -- <file>
```

### Amend Last Commit
```bash
git commit --amend -m "new message"
```

### Revert Commit
```bash
git revert <commit>
```

---

## 📊 Current Repository Stats

```bash
# Show repository statistics
git shortlog -sn
git count-objects -v
```

---

## 💡 Tips

1. **Commit Often**: Small, focused commits are better
2. **Write Clear Messages**: Explain WHY, not just WHAT
3. **Review Before Commit**: Use `git diff --staged`
4. **Keep Clean State**: Commit or stash before switching tasks
5. **Use Branches**: For major features (optional for solo dev)

---

## 🎨 Example Session

```bash
# Start work
git status

# Make changes to login page...

# Review changes
git diff src/pages/LoginPage.jsx

# Stage and commit
git add src/pages/LoginPage.jsx src/api.js
git commit -m "feat: improve login page with toast notifications"

# Verify
git log --oneline -3
git status
```

---

**Happy Coding! 🚀**
