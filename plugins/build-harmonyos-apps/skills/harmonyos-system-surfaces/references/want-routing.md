# Want Routing

## Defaults
- Decode external Want parameters at the boundary.
- Convert valid parameters into the app's internal route model.
- Reject or default invalid parameters before page construction.
- Keep route constants in one place.

## Pitfalls
- Passing full internal objects through Want parameters.
- Letting every page parse external parameters differently.
- Triggering hidden global side effects instead of explicit routing.
