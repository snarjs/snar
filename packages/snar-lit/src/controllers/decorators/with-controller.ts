/**
 * @license
 * Copyright (c) 2023 Valentin Degenne
 * SPDX-License-Identifier: MIT
 */
import {ReactiveElement} from 'lit';
import {ClassDescriptor} from '../../decorators/base.js';
import {LitElementControllerHost} from '../single-host-controller.js';
import {ReactiveController} from '../reactive-controller.js';

// type CustomElementClass = Omit<typeof HTMLElement, 'new'>;

// function hasConstructorNameAsInheritance(
// 	constructor: Function,
// 	needle: string
// ) {
// 	do {
// 		if (!('name' in constructor)) {
// 			return false;
// 		}
// 		if (constructor.name === needle) {
// 			return true;
// 		}
// 	} while ((constructor = Object.getPrototypeOf(constructor)) !== '');
// 	return false;
// }

const legacyWithController = (
	controllerCtorOrObject: ReactiveController | typeof ReactiveController,
	clazz: typeof ReactiveElement
) => {
	// Constructor
	if (typeof controllerCtorOrObject === 'function') {
		// if (
		// 	hasConstructorNameAsInheritance(
		// 		controllerCtorOrObject,
		// 		'SingleHostController'
		// 	)
		// ) {
		clazz.addInitializer((element) => {
			const controller = new controllerCtorOrObject(element);
			if (element instanceof LitElementControllerHost) {
				// Removing the `controller` handler if more than
				// one controller is bind, to avoid ambiguous contract.
				if (element.controller !== undefined) {
					element.controller = undefined;
				} else {
					element.controller = controller;
				}
			}
		});
		// 		} else if (
		// 			hasConstructorNameAsInheritance(
		// 				controllerCtorOrObject,
		// 				'MultiHostController'
		// 			)
		// 		) {
		// 			throw new Error(`\`MultiHostController\` can't be used in decorator.
		// You will have to create an instance outside and pass the instance in.`);
		// 		} else {
		// 			throw new Error('You passed an unknown constructor.');
		// 		}
	}
	// Instance
	else if (typeof controllerCtorOrObject === 'object') {
		// if (controllerCtorOrObject instanceof SingleHostController) {
		clazz.addInitializer((element) => {
			// if (controllerCtorOrObject instanceof SingleHostController) {
			// (controller as SingleHostController).host = element;
			controllerCtorOrObject.bind(element);
			// }
			if (element instanceof LitElementControllerHost) {
				// Removing the `controller` handler if more than
				// one controller is bind, to avoid ambiguous contract.
				if (element.controller !== undefined) {
					element.controller = undefined;
				} else {
					element.controller = controllerCtorOrObject;
				}
			}
		});
		// }
	} else {
		throw new Error('Unknown Type');
	}
	// Cast as any because TS doesn't recognize the return type as being a
	// subtype of the decorated class when clazz is typed as
	// `Constructor<HTMLElement>` for some reason.
	// `Constructor<HTMLElement>` is helpful to make sure the decorator is
	// applied to elements however.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return clazz as any;
};

const standardWithController = (
	controller: ReactiveController | typeof ReactiveController,
	descriptor: ClassDescriptor
) => {
	const {kind, elements} = descriptor;
	return {
		kind,
		elements,
		// This callback is called once the class is otherwise fully defined
		finisher(/*clazz: Constructor<HTMLElement>*/) {
			console.log('we are in standard');
			// customElements.define(tagName, clazz);
		},
	};
};

/**
 * @category Decorator
 * @param controllerClassOrInstance The controller to be used on the custom element
 */
export function withController(
	controllerClassOrInstance: ReactiveController | typeof ReactiveController
) {
	// Decorating function
	return function (
		classOrDescriptor: typeof ReactiveElement | ClassDescriptor
	) {
		// If first argument is a function it's legacy decorator
		// with constructor function
		if (typeof classOrDescriptor === 'function') {
			// Returns a constructor
			return legacyWithController(controllerClassOrInstance, classOrDescriptor);
		}
		// Else we are in the decorator spec and first argument is a descriptor.
		// Returns a descriptor
		return standardWithController(
			controllerClassOrInstance,
			classOrDescriptor as ClassDescriptor
		);
	};
}
