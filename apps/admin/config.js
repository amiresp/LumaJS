// Example administration shell, deliberately domain-neutral.
export const config = Object.freeze({
  name: "admin",
  theme: "core-default",
  fallback: "core-default",
  routes: [
    { path: "/admin", page: "Dashboard" }
  ]
});
