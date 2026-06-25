# System Surface Templates

## Open App Route
- External input: small route id plus scalar parameters.
- Boundary: validate and map to internal route.
- Page: load domain data by id and handle missing data.

## Quick Action
- External input: action id plus minimal payload.
- Handler: call a service method, then report success/failure.
- UI fallback: open the app when the action needs more context.

## Widget/Card
- Data source: cached or lightweight service data.
- Action: route to a stable app destination or execute a small action.
- Failure: show stale/empty state rather than crashing the surface.
