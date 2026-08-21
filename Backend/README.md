# FloodGuard Backend

Member 2 backend scaffold for the hackathon.

## Run

```bash
npm install
npm run dev
```

## Endpoints

- `GET /api/health`
- `GET /api/weather?lat=&lng=`
- `GET /api/risk?lat=&lng=`
- `GET /api/zones?lat=&lng=`
- `GET /api/route?from=lat,lng&to=lat,lng`
- `POST /api/routes/safe`
- `GET /api/shelters`
- `GET /api/shelters/safe-route?lat=&lng=`
- `GET /api/alerts?lat=&lng=`
- `POST /api/sensors/simulate`

## Notes

- `GET /api/route` remains available for transition support.
- `POST /api/routes/safe` is the preferred integration endpoint for the frontend and matches the team handoff docs.
- Route responses include both the newer contract fields and compatibility aliases while the team finalizes frontend integration.
- `GET /api/zones` returns demo flood zones for the current integration stage.
- `GET /api/shelters/safe-route` returns the safest available shelter and its route.
