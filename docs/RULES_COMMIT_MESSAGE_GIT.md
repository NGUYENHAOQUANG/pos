# Git Commit Message Rules - Mebione Mobile App

## 📋 Commit Message Structure

```
<type>(<scope>): <subject>

[body - optional]

[footer - optional]
```

## 🏷️ Types (Commit Types)

| Type | Description | Example |
|------|-------------|---------|
| `feat` | Add new feature | `feat(auth): add registration screen` |
| `fix` | Fix bug | `fix(login): fix email validation error` |
| `ui` | Update user interface | `ui(home): improve home page layout` |
| `style` | Format code, missing semicolons (no code logic change) | `style(components): format code with prettier` |
| `refactor` | Refactor code (no new feature, no bug fix) | `refactor(api): optimize API calls` |
| `perf` | Improve performance | `perf(list): optimize FlatList render` |
| `test` | Add or fix tests | `test(auth): add unit test for login` |
| `docs` | Update documentation | `docs(readme): update installation guide` |
| `build` | Change build system or dependencies | `build: update expo sdk 52` |
| `ci` | Change CI/CD config | `ci: add github actions workflow` |
| `chore` | Other maintenance tasks | `chore: update gitignore` |
| `revert` | Revert previous commit | `revert: revert "feat(auth): add login"` |

## 📂 Scopes

### Authentication & User
- `auth` - Authentication flows (login, register, OTP)
- `user` - User profile, settings
- `password` - Password creation, reset

### Main Features
- `home` - Home page
- `booking` - Appointment booking
- `appointment` - Appointment management
- `doctor` - Doctor list, doctor information
- `hospital` - Hospital information, clinics
- `profile` - Personal profile
- `health-record` - Health records

### Technical
- `api` - API integration, services
- `store` - State management (Zustand)
- `navigation` - Routing, navigation
- `components` - UI components
- `utils` - Utility functions
- `types` - TypeScript types/interfaces
- `config` - App configuration
- `i18n` - Internationalization

### UI/UX
- `ui` - Common UI components
- `theme` - Theme, colors, styling
- `layout` - Layout components
- `animation` - Animations, transitions

## ✍️ Subject

### Principles:
1. **Write in English** - clear and understandable for the team
2. **Start with a verb** - add, fix, remove, update, optimize
3. **Do not capitalize the first letter** (after the colon)
4. **Do not end with a period**
5. **Maximum 72 characters**
6. **Briefly describe what changed**

### Common Verbs:
- `add` - add new feature/file
- `fix` - fix bug
- `remove` - remove code/file
- `update` - update existing code
- `optimize` - optimize performance
- `improve` - improve UX/UI
- `refactor` - refactor code
- `move` - move file/folder
- `rename` - rename
- `integrate` - integrate service/library

## 📝 Body (Optional)

Use when detailed explanation is needed:
- **Why** was this change made?
- **What problem** was solved?
- **What approach** was taken?
- **Side effects** or **breaking changes**

Each line should be maximum 72 characters.

## 🔗 Footer (Optional)

Use to reference issues, tickets:
- `Refs: #123` - Reference issue
- `Closes: #123` - Close issue
- `Breaking Change:` - Breaking API change

## ✅ Good Examples

### Simple examples:
```
feat(auth): add user registration screen
```

```
fix(login): fix phone number validation error
```

```
ui(home): improve doctor list layout
```

### Examples with body:
```
feat(booking): add online appointment booking feature

Users can:
- Select doctor from list
- Choose appointment date and time
- Confirm booking information
- Receive booking code via SMS

Refs: #45
```

```
fix(api): fix timeout error when fetching hospital list

Increase timeout from 5s to 10s and add retry logic.
Handle slow network in remote areas.

Closes: #89
```

```
refactor(store): restructure Zustand store by modules

Split large store into smaller modules:
- authStore: manage authentication
- bookingStore: manage booking
- userStore: manage user data

Breaking Change: import path changed from @/store to @/store/modules
```

### Examples for other types:
```
perf(appointment): optimize appointment list render with React.memo
```

```
docs(architecture): update project architecture diagram
```

```
build: update react-native to version 0.76.1
```

```
chore(deps): update dependencies to latest versions
```

```
test(utils): add unit test for formatPhoneNumber function
```

```
style(components): format code according to ESLint rules
```

## ❌ Bad Examples

```
❌ update code
→ Too generic, unclear what was updated

✅ feat(auth): add validation for registration form
```

```
❌ Fix bug
→ No scope, no bug description

✅ fix(login): fix crash when entering invalid email format
```

```
❌ feat(auth): Add registration screen.
→ Capitalized first letter, ends with period

✅ feat(auth): add registration screen
```

```
❌ WIP
→ No description at all

✅ feat(booking): add date/time picker UI (WIP)
```

## 🔄 Commit Workflow

### 1. Commit Code Frequently
- Commit after each small feature is completed
- Don't include too many changes in 1 commit
- 1 commit = 1 idea/logical change

### 2. Before Committing
```bash
# Check changed files
git status

# View detailed changes
git diff

# Stage files to commit
git add <files>

# Or stage all
git add .
```

### 3. Write Commit Message
```bash
# Commit with short message
git commit -m "feat(auth): add registration screen"

# Commit with body message (opens editor)
git commit
```

### 4. Push Code
```bash
# Push to current branch
git push origin <branch-name>
```

## 🌿 Branch Rules

### Branch Naming Convention:
```
<type>/<scope>-<short-description>

Examples:
- feature/auth-register-screen
- fix/login-validation-error
- hotfix/api-timeout-issue
- refactor/store-structure
```

### Branch Types:
- `feature/` - New feature
- `fix/` - Bug fix
- `hotfix/` - Urgent production bug fix
- `refactor/` - Code refactoring
- `docs/` - Documentation update
- `test/` - Add tests

## 📚 References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit)

## 💡 Tips

1. **Commit early, commit often** - Don't wait until you have too much code
2. **Each commit should pass CI/CD** - Code should be runnable
3. **Don't commit debug code** - console.log, debugger, TODO comments
4. **Review code before committing** - Use `git diff`
5. **Write messages as if talking to teammates** - Clear and understandable

---

**Note:** The entire team must follow these rules to ensure clean and trackable Git history! 🚀
