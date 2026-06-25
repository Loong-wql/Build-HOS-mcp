# App Wiring

## Goal
Keep the app shell, route model, services, and page-local state separate.

## Defaults
- Define route names and route parameters in one place.
- Keep Want/external route decoding at the app boundary, then hand off to the same internal route model used by in-app navigation.
- Inject shared services explicitly through the app root or a narrow store.
- Page components should receive only the data and callbacks they need.

## Checks
- Can a page be opened from internal navigation and from an external entry without duplicate logic?
- Are invalid route parameters handled before page construction?
- Does the app shell own global UI such as tabs, navigation containers, and top-level dialogs?
