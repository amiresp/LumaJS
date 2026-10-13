# Shared Logger

`js/shared/Logger.js` is a dependency-free logging utility. It is **not** a Caller, a UI component, or part of Core. Import it directly wherever application orchestration needs diagnostics.

```js
import {logger,Logger} from "/js/shared/Logger.js";

logger.info("Application started");
logger.warn("No results");
logger.error("Request failed",new Error("offline"));

const ordersLog=new Logger({prefix:"Orders",level:"debug"});
ordersLog.debug("state",{page:1});
ordersLog.setLevel("warn"); // suppress debug and info
ordersLog.setLevel("silent"); // suppress all
ordersLog.setEnabled(false); // force disable
```

The default singleton `logger` is prefixed `[LumaJS]`, filters at `info` (so debug is off by default), and writes to `console`. Levels are `debug`, `info`, `warn`, `error`, `silent`. This is deliberately a configurable runtime setting, not automatic detection of production builds (there is no required build system).

For production deployments, set `logger.setLevel("warn")` or `logger.setLevel("silent")` during app bootstrap. To enable debug in a development environment, explicitly call `logger.setLevel("debug")`. The `Logger` constructor accepts `{level,sink,prefix,enabled}`; use `sink` to integrate approved telemetry. `logger.child("Orders")` creates a scoped logger with a copied configuration; it does not create a Caller or a new architectural layer.

`log(level,...args)` and each severity method return true when forwarded, false when filtered. Structured arguments and Error objects are passed through unchanged; never log passwords, tokens, private user data or sensitive payloads. Console transport is synchronous and best-effort; it does not retain log history or automatically send logs to a server.

Luma's existing `onError(error,host)` and `luma:error` hooks still exist. Optionally wire them to this Logger **at application bootstrap**, avoiding a Core dependency:

```js
import {Luma} from "/js/core/Luma.js";
import {logger} from "/js/shared/Logger.js";
const runtime=new Luma({onError:(error,host)=>logger.error(host?.dataset?.luma??"runtime",error)});
```

See `tests/logger.test.js` for filtering, logger scopes, custom sink and error cases.
