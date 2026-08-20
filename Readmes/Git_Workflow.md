# 🌊 FloodGuard AI — Git & Collaboration Workflow

> **Purpose:** This document defines exactly how all 4 members will work together in the same GitHub repository without overwriting each other's work or creating integration problems.

---

## 1. 🏗️ Repository Structure

We use **ONE GitHub repository** for the entire project.

```text
floodguard-ai/
│
├── README.md
│
├── docs/
│   ├── TEAM_ROLES.md
│   ├── ARCHITECTURE.md
│   ├── API_CONTRACT.md
│   ├── GIT_WORKFLOW.md
│   ├── INTEGRATION_PLAN.md
│   ├── DEMO_DATA.md
│   ├── DEFINITION_OF_DONE.md
│   └── HACKATHON_RULES.md
│
├── frontend/          # Member 3
├── backend/           # Member 4
├── ml/                # Member 1
├── routing/           # Member 2
│
└── data/               # Shared demo/static data
```

Each member works **primarily inside their own folder**. This keeps merge conflicts rare — most conflicts happen when two people edit the same file, not when they edit files in different folders.

---

## 2. 👥 Ownership Map

| Folder | Owner | Touches other folders? |
|---|---|---|
| `ml/` | Member 1 | Only reads `data/`, never edits others |
| `routing/` | Member 2 | Only reads `data/`, never edits others |
| `frontend/` | Member 3 | Calls backend API, never edits `ml/`/`routing/`/`backend/` |
| `backend/` | Member 4 | Integrates `ml/` + `routing/` outputs, exposes API to `frontend/` |
| `data/` | Shared | Anyone can add files, but **check with the team first** — treat as append-only during the hackathon |
| `docs/` | Shared | Anyone can edit, but keep changes to your own sections when possible |

**Rule of thumb:** if you need to edit a file outside your folder, message the team first or open a PR so the owner can review it.

---

## 3. 🌿 Branching Strategy

We use a simple **feature-branch workflow** off `main`. No `develop` branch — for a hackathon timeline, one integration branch (`main`) is enough as long as everyone branches off it and merges back through PRs.

| Branch | Purpose |
|---|---|
| `main` | Always working/demo-able. Protected — no direct pushes. |
| `ml/*` | Member 1's work |
| `routing/*` | Member 2's work |
| `frontend/*` | Member 3's work |
| `backend/*` | Member 4's work |
| `fix/*` | Bug fixes, any member |
| `docs/*` | Documentation-only changes |

**Branch naming convention:**
```
<folder>/<short-description>
```

Examples:
```
ml/flood-prediction-model
routing/shortest-safe-path
frontend/live-map-view
backend/predict-endpoint
fix/cors-error-on-api-call
docs/update-api-contract
```

---

## 4. 📝 Commit Messages

We follow **Conventional Commits** — short, consistent, and easy to scan in history.

```
<type>(<folder>): <short summary>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**
```
feat(ml): add rainfall prediction model
feat(routing): implement Dijkstra for safe-path routing
feat(frontend): add live flood risk map
feat(backend): connect ML model output to /predict endpoint
fix(backend): handle missing sensor data in request
docs(api-contract): document /predict response schema
```

Guidelines:
- Imperative mood: "add", not "added".
- One logical change per commit — easier to debug and revert during a hackathon crunch.
- Commit often. Small commits > one giant commit at the deadline.

---

## 5. 🔁 Standard Daily Workflow

1. **Sync with `main` before starting work**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create your branch**
   ```bash
   git checkout -b ml/flood-prediction-model
   ```

3. **Work and commit inside your folder**
   ```bash
   git add ml/
   git commit -m "feat(ml): add rainfall prediction model"
   ```

4. **Push your branch**
   ```bash
   git push origin ml/flood-prediction-model
   ```

5. **Open a Pull Request into `main`**
   - Title: same convention as commits, e.g. `feat(ml): add rainfall prediction model`
   - Description: what it does, how to test/run it
   - Tag the relevant teammate as reviewer (e.g. Member 4 reviews `backend`-facing changes from `ml`/`routing`)

6. **Review & merge**
   - At least a quick glance/approval from one other member before merging (fast is fine — this is a hackathon, not a full audit).
   - **Squash and merge** into `main` to keep history clean.

7. **Clean up**
   ```bash
   git checkout main
   git pull origin main
   git branch -d ml/flood-prediction-model
   ```

8. **Pull `main` regularly** (at least every time before you start a new work session) so integration issues surface early, not the night before the demo.

---

## 6. 🔗 Integration Points (Where Conflicts Are Likely)

These are the places where two members' work touches — pay extra attention here:

| Integration Point | Between | Coordinate via |
|---|---|---|
| ML model output → Backend | Member 1 ↔ Member 4 | `docs/API_CONTRACT.md` — agree on input/output JSON shape early |
| Routing output → Backend | Member 2 ↔ Member 4 | `docs/API_CONTRACT.md` |
| Backend API → Frontend | Member 4 ↔ Member 3 | `docs/API_CONTRACT.md` |
| Shared demo data | Everyone | `docs/DEMO_DATA.md` — don't rename/move files others depend on without a heads-up |

**Golden rule:** if your change affects `docs/API_CONTRACT.md`, update the doc **in the same PR** and ping the affected teammate directly (Slack/Discord/WhatsApp — don't rely on them seeing the PR).

---

## 7. ⚠️ Handling Merge Conflicts

1. Rebase (or merge) the latest `main` into your branch before opening/updating a PR:
   ```bash
   git fetch origin
   git rebase origin/main
   ```
2. Conflicts inside your own folder → resolve yourself.
3. Conflicts touching another member's folder or `data/`/`docs/` → resolve together, don't just pick a side.
4. Test locally after resolving, before pushing.

---

## 8. ✅ Pull Request Checklist

Before opening a PR, confirm:

- [ ] Code runs locally without errors
- [ ] Only touches your folder (or was pre-agreed with the folder owner)
- [ ] Commit messages follow convention
- [ ] `docs/API_CONTRACT.md` updated if input/output shape changed
- [ ] No secrets/API keys committed
- [ ] Branch is up to date with `main`

---

## 9. 🚫 Hard Rules

- ❌ No direct pushes to `main`.
- ❌ No force-pushing to `main` or shared branches.
- ❌ No committing API keys, `.env` files, or credentials (add to `.gitignore`).
- ❌ Don't rename or delete files in `data/` without telling the team.
- ✅ Commit and push early and often — don't sit on uncommitted work, especially close to the deadline.

---

## 10. 🚀 Quick Reference

```bash
# Start new work
git checkout main && git pull && git checkout -b <folder>/<short-description>

# Save progress
git add <folder>/ && git commit -m "feat(<folder>): message"

# Update branch with latest main
git fetch origin && git rebase origin/main

# Push
git push origin <folder>/<short-description>

# After PR is merged, clean up
git checkout main && git pull && git branch -d <folder>/<short-description>
```

---

*This workflow is optimized for a 4-person hackathon team shipping fast without stepping on each other. Keep it simple, communicate integration points early, and pull `main` often.*