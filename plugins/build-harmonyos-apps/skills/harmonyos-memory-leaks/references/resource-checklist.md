# Memory Resource Checklist

## Common Retainers
- Event listeners not removed when page or ability ends.
- Timers, intervals, workers, subscriptions, or async tasks outliving their owner.
- Global stores retaining page-specific closures or objects.
- Media, file, sensor, location, network, or native handles not released.
- Large caches without bounds or lifecycle policy.

## Proof Standard
Tie each fix to an intended lifetime and a retaining edge. Do not claim success from a smaller total memory number alone.
