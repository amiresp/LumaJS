import test from "node:test";
import assert from "node:assert/strict";
import { ApplicationRegistry } from "../js/shared/ApplicationRegistry.js";
import { createWebsite } from "../apps/website/bootstrap.js";
import { createAdmin } from "../apps/admin/bootstrap.js";

test("apps isolate routes, registries, themes and runtime instance", async () => {
  const publicSite = createWebsite({ base: "/" });
  const admin = createAdmin({ base: "/" });
  assert.notStrictEqual(publicSite.runtime, admin.runtime);
  assert.notStrictEqual(publicSite.app, admin.app);
  assert.equal(admin.app.resolve("/admin").page, "Dashboard");
  assert.equal(publicSite.app.resolve("/admin"), null);
  publicSite.app.registerFeature("Sample", async () => "public");
  assert.equal(await publicSite.app.loadFeature("Sample"), "public");
  await assert.rejects(admin.app.loadFeature("Sample"), /Unknown feature/);
});
test("features, options and callers are explicit and independent from Core", async () => {
  const app = new ApplicationRegistry({ name: "test", routes: [{ path: "/hello", page: "Hello" }] });
  app.registerFeature("Hello", async () => ({ mounted: true }));
  app.registerOption("Notification", async () => ({ enabled: true }));
  app.registerCaller("fetchItems", async () => [{ text: "One" }]);
  assert.deepEqual(await app.loadFeature("Hello"), { mounted: true });
  assert.deepEqual(await app.loadOption("Notification"), { enabled: true });
  assert.deepEqual(await app.call("fetchItems"), [{ text: "One" }]);
  assert.equal(app.resolve("/hello").page, "Hello");
  assert.throws(() => app.addRoutes([{ path: "/hello" }]), /Duplicate/);
});
