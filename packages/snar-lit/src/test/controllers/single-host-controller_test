import { assert } from "@esm-bundle/chai";
import { LitElement } from "lit";
import { state } from "snar";
import { generateElementName } from "../test-helpers.js";
import { SingleHostController } from "../../controllers/single-host-controller.js";

suite("SingleHostController", () => {
  let container: HTMLElement;

  class E extends LitElement {
    @state() prop = "foo";

    updateCount = 0;

    updated() {
      this.updateCount++;
    }
  }
  customElements.define(generateElementName(), E);

  class Controller extends SingleHostController {
    @state() prop = "foo";
  }

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container?.parentNode?.removeChild(container);
  });

  test("host can be passed in the controller constructor", async () => {
    const el = new E();
    const c = new Controller(el);
    assert.equal(c.host, el);
    // @ts-ignore
    assert.include(el.__controllers, c);
  });

  test("updates host when reactive property changes", async () => {
    const el = new E();
    const c = new Controller(el);
    container.appendChild(el);
    await el.updateComplete;
    assert.equal(el.updateCount, 1);
    c.prop = "bar";
    await c.updateComplete;
    // await el.updateComplete;
    assert.equal(el.updateCount, 2);
  });

  test("can be connected after instanciation", async () => {
    const el = new E();
    container.appendChild(el);
    await el.updateComplete;
    assert.equal(el.updateCount, 1);
    const c = new Controller(el);
    await c.updateComplete;
    // await el.updateComplete;
    assert.equal(el.updateCount, 2);
  });

  test("can't be connected to two hosts at the same time", async () => {
    const e1 = new E();
    const e2 = new E();
    const c = new Controller(e1);
    container.appendChild(e1);
    container.appendChild(e2);
    await e1.updateComplete;
    await e2.updateComplete;
    assert.equal(e1.updateCount, 1);
    assert.equal(e2.updateCount, 1);
    // @ts-ignore
    assert.include(e1.__controllers, c);
    assert.equal(c.host, e1);
    c.prop = "bar";
    await c.updateComplete;
    await e1.updateComplete;
    assert.equal(e1.updateCount, 2);
    assert.equal(e2.updateCount, 1);
    c.host = e2;
    c.prop = "baz";
    await c.updateComplete;
    await e1.updateComplete;
    assert.equal(e1.updateCount, 2);
    assert.equal(e2.updateCount, 2);
    assert.equal(c.host, e2);
    // @ts-ignore
    assert.include(e2.__controllers, c);
    // @ts-ignore
    assert.notInclude(e1.__controllers, c);
  });

  test("base class `SingleHostController` extends `ReactiveObject`", async () => {
    const e = new E();
    container.appendChild(e);
    const controller = new SingleHostController(e);
    // @ts-ignore
    assert.include(e.__controllers, controller);
    assert.equal(controller.host, e);
    await e.updateComplete;
    assert.equal(e.updateCount, 1);
    controller.requestUpdate();
    await controller.updateComplete;
    await e.updateComplete;
    assert.equal(e.updateCount, 2);
  });

  test("batches updates", async () => {
    class Controller extends SingleHostController {
      @state() prop1 = "foo";
      @state() prop2 = "foo";
    }

    const e = new E();
    container.appendChild(e);
    await e.updateComplete;
    assert.equal(e.updateCount, 1);
    const c = new Controller(e);
    await c.updateComplete;
    await e.updateComplete;
    assert.equal(e.updateCount, 2);
    c.prop1 = "bar";
    c.prop2 = "bar";
    await c.updateComplete;
    await e.updateComplete;
    assert.equal(e.updateCount, 3);
  });

  test("batches updates from multiple controllers", async () => {
    const e = new E();
    const c1 = new Controller(e);
    const c2 = new Controller(e);
    const c3 = new Controller(e);
    container.appendChild(e);
    await c1.updateComplete;
    await c2.updateComplete;
    await c3.updateComplete;
    await e.updateComplete;
    assert.equal(e.updateCount, 1);
    assert.equal(c1.host, e);
    assert.equal(c2.host, e);
    assert.equal(c3.host, e);
    c1.prop = "bar";
    c2.prop = "bar";
    c3.prop = "bar";
    await c1.updateComplete;
    await c2.updateComplete;
    await c3.updateComplete;
    await e.updateComplete;
    assert.equal(e.updateCount, 2);
  });
});
