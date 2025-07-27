# Debugging `createGroup` Failures

This document describes a manual debugging strategy for inspecting WhatsApp Web's
internal `createGroup` implementation and understanding why group creation fails.

## 1. Overview
`Client.createGroup` internally calls `window.Store.GroupUtils.createGroup` from
the WhatsApp Web page. This code is obfuscated and may change across Web
versions, which makes troubleshooting difficult. The strategy below leverages
moduleraid and browser evaluation to capture the raw source of the underlying
function and assists in diagnosing errors.

## 2. Preparation
1. **Install dependencies** – run `npm install` in the repository root.
2. **Provide a valid WhatsApp session** – authentication is required to load the
   web client. Follow the project README for login instructions.
3. **Enable verbose logging** – start your script with the environment variable
   `DEBUG=*` to capture debug output.

## 3. Capturing the Source
1. Modify `src/Client.js` to evaluate `window.Store.GroupUtils.createGroup` in
   the browser context and return its string representation.
2. Log the retrieved string in Node. This exposes the actual implementation
   used by the current WhatsApp Web version and helps compare it with expected
   behaviour.
3. Run your script and invoke `client.createGroup`. The console will print the
   entire obfuscated function for inspection.

## 4. Analysing the Output
1. Check if the returned function contains new arguments or changed behaviour.
2. Compare the code with earlier working versions to spot breaking changes.
3. Look for explicit error throws or conditional branches that might cause the
   observed failure.

## 5. Next Steps
1. Adjust the wrapper code in `createGroup` if WhatsApp Web introduced new
   parameters or response formats.
2. Remove or update the debug logging once the issue is understood.
3. Consider pinning the WhatsApp Web version in `Client` options to reduce the
   impact of future obfuscation changes.
