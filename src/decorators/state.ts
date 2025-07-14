import {ReactiveObject} from '../reactive-object.js'
import type {PropertyDeclaration} from '../types.js'
import {ClassElement} from './base.js'

const standardProperty = (
	options: PropertyDeclaration,
	element: ClassElement,
) => {
	// When decorating an accessor, pass it through and add property metadata.
	// Note, the `hasOwnProperty` check in `createProperty` ensures we don't
	// stomp over the user's accessor.
	if (
		element.kind === 'method' &&
		element.descriptor &&
		!('value' in element.descriptor)
	) {
		return {
			...element,
			finisher(clazz: typeof ReactiveObject) {
				clazz.createProperty(element.key, options)
			},
		}
	} else {
		// createProperty() takes care of defining the property, but we still
		// must return some kind of descriptor, so return a descriptor for an
		// unused prototype field. The finisher calls createProperty().
		return {
			kind: 'field',
			key: Symbol(),
			placement: 'own',
			descriptor: {},
			// store the original key so subsequent decorators have access to it.
			originalKey: element.key,
			// When @babel/plugin-proposal-decorators implements initializers,
			// do this instead of the initializer below. See:
			// https://github.com/babel/babel/issues/9260 extras: [
			//   {
			//     kind: 'initializer',
			//     placement: 'own',
			//     initializer: descriptor.initializer,
			//   }
			// ],
			initializer(this: {[key: string]: unknown}) {
				if (typeof element.initializer === 'function') {
					this[element.key as string] = element.initializer.call(this)
				}
			},
			finisher(clazz: typeof ReactiveObject) {
				clazz.createProperty(element.key, options)
			},
		}
	}
}

const legacyProperty = (
	options: PropertyDeclaration,
	proto: Object,
	name: PropertyKey,
) => {
	;(proto.constructor as typeof ReactiveObject).createProperty(name, options)
}

export function state(options?: PropertyDeclaration) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (protoOrDescriptor: Object | ClassElement, name?: PropertyKey): any =>
		name !== undefined
			? legacyProperty(options!, protoOrDescriptor as Object, name)
			: standardProperty(options!, protoOrDescriptor as ClassElement)
}
