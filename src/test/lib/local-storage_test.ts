import {assert} from 'chai'
import {ReactiveLocalStorage} from '../../lib/localstorage.js'
import {state} from '../../reactive-object.js'

suite('ReactiveLocalStorage', () => {
	function getLocalStorageValue(handler: string) {
		const content = localStorage.getItem(handler)
		if (content == null) return content
		return JSON.parse(content)
	}

	teardown(() => {
		localStorage.clear()
	})

	test("handler name can't be empty", () => {
		assert.throws(() => {
			new ReactiveLocalStorage('')
		}, /specify a localstorage handler name/)
	})

	test('expects a handler name', () => {
		assert.doesNotThrow(() => {
			new ReactiveLocalStorage('test')
		})
	})

	test('data is saved if there is a default state', async () => {
		class LS extends ReactiveLocalStorage {
			@state() prop = 'foo'
		}
		const ls = new LS('test')
		await ls.updateComplete
		assert.equal(getLocalStorageValue('test').prop, 'foo')
	})

	test('data is saved when state changes', async () => {
		class LS extends ReactiveLocalStorage {
			@state() prop = 'foo'
		}
		const ls = new LS('test')
		await ls.updateComplete
		assert.equal(getLocalStorageValue('test').prop, 'foo')
		ls.prop = 'bar'
		await ls.updateComplete
		assert.equal(getLocalStorageValue('test').prop, 'bar')
	})

	test('data is retrieved when object is constructed, and do not replace defaults', async () => {
		class LS extends ReactiveLocalStorage {
			@state() prop1 = 'foo'
			@state() prop2 = 'foo'
		}
		const ls = new LS('test')
		await ls.updateComplete
		assert.equal(getLocalStorageValue('test').prop1, 'foo')
		assert.equal(getLocalStorageValue('test').prop2, 'foo')
		assert.equal(ls.prop1, 'foo')
		assert.equal(ls.prop2, 'foo')
		ls.prop1 = 'bar'
		ls.prop2 = 'baz'
		await ls.updateComplete
		assert.equal(getLocalStorageValue('test').prop1, 'bar')
		assert.equal(getLocalStorageValue('test').prop2, 'baz')
		const ls2 = new LS('test')
		await ls2.updateComplete
		assert.equal(ls2.prop1, 'bar')
		assert.equal(ls2.prop2, 'baz')
	})

	test.skip("doesn't replace unmatched data", async () => {
		class LS1 extends ReactiveLocalStorage {
			@state() foo = 'foo'
		}
		class LS2 extends ReactiveLocalStorage {
			@state() bar = 'bar'
		}

		const ls1 = new LS1('same-handler')
		await ls1.updateComplete
		assert.equal(getLocalStorageValue('same-handler').foo, 'foo')
		let threw = false
		try {
			await new LS2('same-handler').updateComplete
		} catch (err) {
			threw = true
		}

		assert.isTrue(threw)
		assert.equal(getLocalStorageValue('same-handler').foo, 'foo')
	})

	test.skip('replace unmatched data if told to', async () => {
		class LS1 extends ReactiveLocalStorage {
			@state() foo = 'foo'
		}
		class LS2 extends ReactiveLocalStorage {
			@state() bar = 'bar'
		}
		const ls1 = new LS1('same-handler')
		await ls1.updateComplete
		assert.equal(ls1.foo, 'foo')
		assert.equal(getLocalStorageValue('same-handler').foo, 'foo')
		assert.isUndefined(getLocalStorageValue('same-handler').bar)
		const ls2 = new LS2('same-handler', true)
		let threw = false
		try {
			await ls2.updateComplete
		} catch (e) {
			threw = true
		}
		assert.isFalse(threw)
		assert.equal(ls2.bar, 'bar')
		assert.isUndefined(getLocalStorageValue('same-handler').foo)
		assert.equal(getLocalStorageValue('same-handler').bar, 'bar')
	})

	test('`updated` is called once on initialization, array', async () => {
		class LS extends ReactiveLocalStorage {
			@state() prop1 = [{a: 1}]

			updateCount = 0

			override updated() {
				this.updateCount++
			}
		}
		assert.equal(getLocalStorageValue('localstorage-handler'), null)
		const ls1 = new LS('localstorage-handler')
		await ls1.updateComplete
		assert.deepEqual(ls1.prop1, [{a: 1}])
		assert.deepEqual(getLocalStorageValue('localstorage-handler').prop1, [
			{a: 1},
		])
		assert.equal(ls1.updateCount, 1)

		const ls2 = new LS('localstorage-handler')
		await ls2.updateComplete
		assert.deepEqual(ls2.prop1, [{a: 1}])
		assert.deepEqual(getLocalStorageValue('localstorage-handler').prop1, [
			{a: 1},
		])
		assert.equal(ls2.updateCount, 1)
	})
})
