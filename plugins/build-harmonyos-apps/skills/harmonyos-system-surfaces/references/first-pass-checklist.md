# System Surfaces First Pass Checklist

## Choose Actions
Pick 1-3 user-visible actions that make sense outside the main app surface.

## Choose Surface
- UIAbility route: user should land in the app.
- Widget/card: user needs glanceable status or quick action.
- ExtensionAbility-style surface: only when the SDK feature requires it.

## Define Contract
- Keep Want parameters small, stable, and versionable.
- Validate parameters before routing.
- Define fallback when required data is missing or stale.

## Verify
Build, launch with representative parameters where possible, and confirm the app routes to the expected page.
