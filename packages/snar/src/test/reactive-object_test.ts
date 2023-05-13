import {assert} from '@esm-bundle/chai';
import {ReactiveObject} from '../reactive-object.js';
import {state} from '../decorators/state.js';
import type {PropertyValues} from '../types.js';
import {state as litStateDecorator} from 'lit/decorators.js';
import {LitElement} from 'lit';
import {generateElementName} from './test-helpers.js';

suite('ReactiveObject', () => {
  test('does not update when no state defined', async () => {
    class O extends ReactiveObject {
      wasUpdated = false;

      override updated() {
        this.wasUpdated = true;
      }
    }
    const o = new O();
    await o.updateComplete;
    assert.equal(o.wasUpdated, false);
  });

  test('does not update when initial state is undefined', async () => {
    class O extends ReactiveObject {
      @state() prop = undefined;
      @state() prop2?: undefined;

      wasUpdated = false;

      override updated() {
        this.wasUpdated = true;
      }
    }

    const o = new O();
    await o.updateComplete;
    assert.equal(o.wasUpdated, false);
  });

  test('does not updates when a non-reactive property changes', async () => {
    class O extends ReactiveObject {
      prop = 'prop';

      wasUpdated = false;

      override updated() {
        this.wasUpdated = true;
      }
    }
    const o = new O();
    await o.updateComplete;
    assert.equal(o.wasUpdated, false);
    o.prop = 'change';
    await o.updateComplete;
    assert.equal(o.wasUpdated, false);
  });

  test('updates when a reactive property changes', async () => {
    class O extends ReactiveObject {
      @state() prop = 'prop';

      updateCount = 0;

      override updated() {
        this.updateCount++;
      }
    }

    const o = new O();
    await o.updateComplete;
    assert.equal(o.updateCount, 1);
    o.prop = 'change';
    await o.updateComplete;
    assert.equal(o.updateCount, 2);
  });

  test('`firstUpdated` is not called twice', async () => {
    class O extends ReactiveObject {
      @state() prop = 'prop';

      firstUpdatedCount = 0;

      override firstUpdated() {
        this.firstUpdatedCount++;
      }
    }

    const o = new O();
    await o.updateComplete;
    assert.equal(o.firstUpdatedCount, 1);
    o.prop = 'change';
    await o.updateComplete;
    assert.equal(o.firstUpdatedCount, 1);
  });

  test('uses hasChanged', async () => {
    const hasChanged = (value: any, old: any) =>
      old === undefined || value > old;

    class O extends ReactiveObject {
      @state({hasChanged}) hasChangedProp = 9;
      updateCount = 0;

      override updated() {
        this.updateCount++;
      }
    }

    const o = new O();
    await o.updateComplete;
    assert.equal(o.updateCount, 1);
    o.hasChangedProp = 99;
    await o.updateComplete;
    assert.equal(o.updateCount, 2);
    o.hasChangedProp = 0;
    await o.updateComplete;
    assert.equal(o.updateCount, 2);
  });

  test('batches updates', async () => {
    class O extends ReactiveObject {
      @state() reactiveProp1 = 'prop';
      @state() reactiveProp2 = 'prop';

      updateCount = 0;

      override updated() {
        this.updateCount++;
      }
    }

    const o = new O();
    await o.updateComplete;
    assert.equal(o.updateCount, 1);
    o.reactiveProp1 = 'change';
    o.reactiveProp2 = 'change';
    await o.updateComplete;
    assert.equal(o.updateCount, 2);
  });

  test('passes batched property values', async () => {
    class O extends ReactiveObject {
      @state() prop1 = 'prop';
      @state() prop2 = 'prop';

      updateCount = 0;

      batchedUpdatedProperties: string[] = [];

      override updated(props: PropertyValues) {
        this.batchedUpdatedProperties = [...props.keys()] as string[];
        this.updateCount++;
      }
    }

    const o = new O();
    await o.updateComplete;
    assert.equal(o.updateCount, 1);
    o.prop1 = 'change';
    o.prop2 = 'change';
    await o.updateComplete;
    assert.equal(o.updateCount, 2);
    assert.deepEqual(o.batchedUpdatedProperties, ['prop1', 'prop2']);
  });

  test('`updateComplete` waits for `requestUpdate` but does not trigger update, async', async () => {
    class O extends ReactiveObject {
      updateCount = 0;

      override updated() {
        this.updateCount++;
      }
    }
    const o = new O();
    await o.updateComplete;
    assert.equal(o.updateCount, 0);
    await o.updateComplete;
    assert.equal(o.updateCount, 0);
    o.requestUpdate();
    await o.updateComplete;
    assert.equal(o.updateCount, 1);
    await o.updateComplete;
    assert.equal(o.updateCount, 1);
  });

  test('`shouldUpdate` is respected', async () => {
    class O extends ReactiveObject {
      @state() prop = 'prop';

      updateCount = 0;

      override shouldUpdate(props: PropertyValues) {
        return !(props.get('prop') == 'change');
      }

      override updated() {
        this.updateCount++;
      }
    }

    const o = new O();
    await o.updateComplete;
    assert.equal(o.updateCount, 1);
    o.prop = 'change';
    await o.updateComplete;
    assert.equal(o.updateCount, 2);
    o.prop = 'prop';
    await o.updateComplete;
    assert.equal(o.updateCount, 2);
  });

  test('`shouldUpdate` controls update', async () => {
    class O extends ReactiveObject {
      needsUpdate = true;
      willUpdateCount = 0;
      updateCount = 0;
      updatedCount = 0;

      override shouldUpdate() {
        return this.needsUpdate;
      }

      override willUpdate() {
        this.willUpdateCount++;
      }

      override update(props: PropertyValues) {
        super.update(props);
        this.updateCount++;
      }

      override updated() {
        this.updatedCount++;
      }
    }
    const o = new O();
    await o.updateComplete;
    assert.equal(o.willUpdateCount, 0);
    assert.equal(o.updateCount, 0);
    assert.equal(o.updatedCount, 0);
    o.needsUpdate = false;
    o.requestUpdate();
    await o.updateComplete;
    assert.equal(o.willUpdateCount, 0);
    assert.equal(o.updateCount, 0);
    assert.equal(o.updatedCount, 0);
    o.needsUpdate = true;
    o.requestUpdate();
    await o.updateComplete;
    assert.equal(o.willUpdateCount, 1);
    assert.equal(o.updateCount, 1);
    assert.equal(o.updatedCount, 1);
    o.requestUpdate();
    await o.updateComplete;
    assert.equal(o.willUpdateCount, 2);
    assert.equal(o.updateCount, 2);
    assert.equal(o.updatedCount, 2);
  });

  suite('with Lit', () => {
    let container: HTMLElement;

    setup(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    teardown(() => {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    });

    test('`@state` from `lit` can be used in `snar`', async () => {
      class O extends ReactiveObject {
        @litStateDecorator() reactiveProp = 'foo';

        updateCount = 0;

        override update() {
          this.updateCount++;
        }
      }

      const o = new O();
      await o.updateComplete;
      assert.equal(o.updateCount, 1);
      o.reactiveProp = 'bar';
      await o.updateComplete;
      assert.equal(o.updateCount, 2);
    });

    test('`@state` from `snar` can be used in `lit`', async () => {
      class E extends LitElement {
        @state() prop = 'prop';

        updateCount = 0;

        override updated() {
          this.updateCount++;
        }
      }

      customElements.define(generateElementName(), E);
      const e = new E();
      container.appendChild(e);
      await e.updateComplete;
      assert.equal(e.updateCount, 1);
      e.prop = 'change';
      await e.updateComplete;
      assert.equal(e.updateCount, 2);
    });
  });

  suite('`getLocalStatePropertyNames`', () => {
    test('returns the list of defined properties', () => {
      class O extends ReactiveObject {
        @state() hello = '';
        @state() world = '';
      }
      const o = new O();
      assert.deepEqual(o.getLocalStatePropertyNames(), ['hello', 'world']);
    });

    test("returns only current class's properties", async () => {
      class O extends ReactiveObject {
        prop = 'foo';
      }
      const o = new O();
      await o.updateComplete;

      class O1 extends ReactiveObject {
        @state() hello = 'hello';
        @state() world = 'world';
      }
      class O2 extends O1 {
        @state() foo = 'foo';
        @state() bar = 'bar';
      }
      const o2 = new O2();
      await o2.updateComplete;
      assert.deepEqual(o2.getLocalStatePropertyNames(), ['foo', 'bar']);
    });
  });

  suite('`getLineageStatePropertyNames`', () => {
    test('returns the list of defined properties', () => {
      class O extends ReactiveObject {
        @state() hello = '';
        @state() world = '';
      }
      const o = new O();
      assert.deepEqual(o.getLineageStatePropertyNames(), ['hello', 'world']);
    });

    test("returns lineage class's properties", async () => {
      class O extends ReactiveObject {
        prop = 'foo';
      }
      const o = new O();
      await o.updateComplete;

      class O1 extends ReactiveObject {
        @state() hello = 'hello';
        @state() world = 'world';
      }
      class O2 extends O1 {
        @state() foo = 'foo';
        @state() bar = 'bar';
      }
      const o2 = new O2();
      await o2.updateComplete;
      assert.deepEqual(o2.getLineageStatePropertyNames(), [
        'hello',
        'world',
        'foo',
        'bar',
      ]);
    });
  });

  suite('toJSON', () => {
    test('implicitely converts to local state object', async () => {
      class O1 extends ReactiveObject {
        @state() parentProp = 'foo';
      }
      class O2 extends O1 {
        @state() prop1 = 'foo';
        @state() prop2 = 'bar';
      }
      const o = new O2();
      assert.isFalse(o.lineageToJSON);
      assert.deepEqual(JSON.parse(JSON.stringify(o)), {
        prop1: 'foo',
        prop2: 'bar',
      });
      o.prop1 = 'bar';
      o.prop2 = 'baz';
      assert.deepEqual(JSON.parse(JSON.stringify(o)), {
        prop1: 'bar',
        prop2: 'baz',
      });
    });

    test('`lineageToJSON` switch to lineage state object JSON conversion', async () => {
      class O1 extends ReactiveObject {
        @state() parentProp = 'foo';
      }
      class O2 extends O1 {
        @state() prop1 = 'bar';
        @state() prop2 = 'baz';
      }
      const o = new O2();
      o.lineageToJSON = true;
      assert.deepEqual(JSON.parse(JSON.stringify(o)), {
        parentProp: 'foo',
        prop1: 'bar',
        prop2: 'baz',
      });
    });
  });

  suite('default state', () => {
    test('is set from constructor, object updates once.', async () => {
      interface OInterface {
        prop1: string;
        prop2: string;
      }
      class O extends ReactiveObject<OInterface> implements OInterface {
        @state() prop1!: string;
        @state() prop2!: string;

        updateCount = 0;

        override updated() {
          this.updateCount++;
        }
      }

      const o = new O({prop1: 'bar', prop2: 'baz'});
      await o.updateComplete;
      assert.equal(o.prop1, 'bar');
      assert.equal(o.prop2, 'baz');
      assert.equal(o.updateCount, 1);
    });

    test('it replaces field values, object updates once.', async () => {
      interface OInterface {
        prop1: string;
        prop2: string;
      }
      class O extends ReactiveObject<OInterface> implements OInterface {
        @state() prop1 = 'foo';
        @state() prop2 = 'bar';

        updateCount = 0;

        override updated() {
          this.updateCount++;
        }
      }

      const o = new O({prop1: 'bar', prop2: 'baz'});
      await o.updateComplete;
      assert.equal(o.prop1, 'bar');
      assert.equal(o.prop2, 'baz');
      assert.equal(o.updateCount, 1);
    });

    test('replaces lineage properties', async () => {
      class Parent extends ReactiveObject {
        @state() propFromParent = 'foo';
      }
      class O extends Parent {
        @state() prop = 'bar';

        updateCount = 0;

        override updated() {
          this.updateCount++;
        }
      }

      const o = new O({propFromParent: 'bar', prop: 'foo'});
      await o.updateComplete;
      assert.equal(o.propFromParent, 'bar');
      assert.equal(o.prop, 'foo');
      assert.equal(o.updateCount, 1);
    });
  });
});
