import {routes} from "./routes.js";
// Public website owns its own routes and theme choices. No business routes in Core.
export const config = Object.freeze({
  name: "website",
  theme: "core-default",
  fallback: "core-default",
  routes
});
