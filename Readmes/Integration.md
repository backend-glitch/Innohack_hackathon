# 🔗 FloodGuard AI — Integration Plan

> **Purpose:** This document explains how the 4 separate parts of the project (`ml/`, `routing/`, `frontend/`, `backend/`) come together into one working system, and the exact process each member follows to integrate their work safely.

---

## 1. 🏗️ Integration Architecture

```text
                    USER
                      │
                      ▼
              ┌───────────────┐
              │ React Frontend│
              │   Member 3    │
              └───────┬───────┘
                      │
                  HTTP / JSON
                      │
                      ▼
              ┌───────────────┐
              │ Express API   │
              │   Member 4    │
              └───────┬───────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
   ┌────────┐   ┌──────────┐  ┌──────────┐
   │   ML   │   │ Routing  │  │ Weather  │
   │Member 1│   │ Member 2 │  │ External │
   └────────┘   └──────────┘  └──────────┘
```

Only the **Backend** talks to ML, Routing, and Weather directly. The **Frontend** only ever talks to the **Backend**. This keeps integration simple — each person only needs to agree on a contract with one other person (usually Member 4).

---

## 2. 👥 Who Integrates With Whom

| From | To | What's exchanged | Contract |
|---|---|---|---|
| Member 1 (ML) | Member 4 (Backend) | `POST /predict` request/response | `API_CONTRACT.md` §9–11 |
| Member 2 (Routing) | Member 4 (Backend) | Route + shelter data | `API_CONTRACT.md` §12–17 |
| Member 4 (Backend) | Member 3 (Frontend) | `/risk`, `/route`, `/weather`, `/shelters`, `/alerts`, `/zones` | `API_CONTRACT.md` (full) |
| External Weather API | Member 4 (Backend) | Weather data | `API_CONTRACT.md` §5 |

**Golden rule:** `docs/API_CONTRACT.md` is the single source of truth for every field name, type, and format used above. If your code and the contract disagree, the contract wins — update your code, or propose a contract change first (see §7).

---

## 3. 🌿 Branching for Integration Work

Use the same branch convention as normal work, just named around the integration:

```
integration/<what-is-being-connected>
```

Examples:
```
integration/ml-to-backend-predict
integration/routing-to-backend-route
integration/backend-to-frontend-risk
```

Workflow is the same as your regular folder work:
```bash
git checkout main && git pull
git checkout -b integration/ml-to-backend-predict

# work together (Live Share optional here — see docs/GIT_WORKFLOW.md)
git add backend/ ml/
git commit -m "feat(integration): connect ML predict to backend /risk"
git push origin integration/ml-to-backend-predict

git checkout main && git pull
git merge integration/ml-to-backend-predict
git push origin main
git branch -d integration/ml-to-backend-predict
```

---

## 4. 🧩 Integration Order

Recommended sequence so nobody is blocked waiting on someone else with nothing to do:

| Stage | What happens | Who's involved |
|---|---|---|
| 1 | Backend stands up all endpoints with **mock/demo data** (`DEMO_MODE=true`) | Member 4 alone |
| 2 | Frontend builds against the mocked backend endpoints | Member 3 + Member 4's mock |
| 3 | ML finishes `/predict`, connects it to backend's `/risk` | Member 1 + Member 4 |
| 4 | Routing finishes `/route` + shelters, connects to backend | Member 2 + Member 4 |
| 5 | Backend swaps mock data for real ML + Routing + Weather responses | Member 4 |
| 6 | Full end-to-end test: Frontend → Backend → ML/Routing/Weather | Everyone |
| 7 | Demo Mode kept as fallback in case a live service fails during the actual demo | Member 4 |

This means Member 3 (frontend) is never blocked waiting for Member 1/2 to finish — they build against demo data from day one.

---

## 5. ✅ Integration Checklist (per connection)

Before marking any integration as "done," confirm:

- [ ] Endpoint/field names match `API_CONTRACT.md` exactly
- [ ] Data types match (numbers are numbers, not strings, etc.)
- [ ] `lat` / `lng` format used consistently (not `latitude`/`longitude` or `lat`/`lon`)
- [ ] Route coordinates use backend `lat` / `lng` objects, with Leaflet conversion handled in the frontend
- [ ] Error responses follow the standard `{ success: false, error: { code, message } }` shape
- [ ] Correct HTTP status codes returned
- [ ] Demo/fallback data works if the real service is down
- [ ] No API keys exposed to the frontend
- [ ] Tested with `curl` / Postman before frontend consumes it
- [ ] Tested from the actual frontend, not just Postman
- [ ] Both people involved have pulled the merged `main` and confirmed it still works locally

---

## 6. 🐞 Debugging Integration Issues

When something breaks between two parts of the system:

1. **Isolate which side is wrong.** Test the producing side directly first:
   ```bash
   curl http://localhost:5000/api/risk?lat=12.9698&lng=79.1559
   ```
   If the raw response is wrong, the bug is on the producing side (ML/Routing/Backend). If the raw response is correct but the frontend shows something wrong, the bug is in how the frontend consumes it.

2. **Check the contract, not assumptions.** Compare the actual JSON against `API_CONTRACT.md` field by field.

3. **Pair up if needed.** This is the moment where Live Share (see `docs/GIT_WORKFLOW.md`) is actually useful — two people looking at the same request/response live.

4. **Fix, commit, push, and note it** if the fix required changing the contract (see §7 below) — don't silently change a field name.

---

## 7. 🔄 Changing the API Contract Mid-Project

If any integration reveals the contract needs to change (e.g. a field name, type, or endpoint):

```text
Propose Change
      ↓
Inform the whole team (not just the other side of the integration)
      ↓
Update docs/API_CONTRACT.md
      ↓
Update Backend
      ↓
Update Frontend/Consumer
      ↓
Test
      ↓
Merge
```

**Never silently change a response shape** — it will quietly break whoever consumes it and waste time debugging something that isn't actually a bug.

---

## 8. 🚨 Final Integration Test (Before Demo)

Run through this as a team, live, before the demo:

1. Pull latest `main`, everyone.
2. Start backend with real services (`DEMO_MODE=false`).
3. Load the frontend, hit every screen that calls the API.
4. Kill one external service (e.g. weather) and confirm fallback to demo data works, app doesn't crash.
5. Confirm no API keys appear in frontend network tab / browser console.
6. Confirm risk levels, route types, and alert messages render correctly end-to-end.
7. Everyone commits/pushes any last-minute fixes to `main` together, then **freeze `main`** — no more pushes right before presenting.

---

## 9. 📌 Related Docs

- `docs/API_CONTRACT.md` — exact endpoint/field definitions (source of truth)
- `docs/GIT_WORKFLOW.md` — branching, commits, and daily Git process
- `docs/DEMO_DATA.md` — what mock/demo data looks like for each service
- `docs/DEFINITION_OF_DONE.md` — when a feature counts as complete
