# Live Artifact Gate

The GitHub Pages deployment is not considered healthy until the public Pages artifact is verified against the current `main` build.

Required sequence:

1. `main` source validation passes.
2. React context import audit passes.
3. Production build succeeds.
4. Pages artifact is uploaded and deployed.
5. The public Pages entrypoint references the newly generated asset hash.
6. The public artifact contains the current `CanonicalAppRuntime` import of `useAppContext`.
7. Only then is feature implementation allowed to resume.

This file exists as a deployment-triggering source change when a live artifact is stale; it contains no runtime code.