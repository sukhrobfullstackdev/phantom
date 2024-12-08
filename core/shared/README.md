## "Shared" Code

What is "shared" code in context of Auth Relayer? The answer is utility functions that can be executed in either Node.js or a browser. Sometimes it's ambiguous if code should belong in `shared` or somewhere else. Here's three simple rules to guide you:

1. Is your function universal? Can it be invoked in either browser or server environments? If so, it probably belongs in `shared`.

2. Is your function used across `/app` and `/e2e` code, but not within `/server`? Then `/app` is probably where it belongs, especially if it utilizes browser-exclusive APIs.

3. Does your function have some contextual significance to `/app`, `/e2e`, or `/server` code? Even if the function is universal, keep it in context (this is an exception to rule #1)! An example of this is the `Endpoint` enum, which is used across `/app` and `/server`, but it lives in `/server` next to other routing logic.
