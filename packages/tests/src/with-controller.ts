/**
 * @license
 * Copyright (c) 2023 Valentin Degenne
 * SPDX-License-Identifier: MIT
 */
import {LitElement} from 'lit';
import {when} from 'lit/directives/when.js';
import {PropertyValues, state} from 'snar';
import {ReactiveController, withController} from '@snar/lit';

class TrafficLightSys extends ReactiveController {
	@state() red = true;
	@state() green = false;

	updated(changed: PropertyValues) {
		if (changed.has('green')) {
			this.red = !this.green;
		} else {
			this.green = !this.red;
		}
	}
}

const ctrl = new TrafficLightSys();

@withController(ctrl)
class GreenLight extends LitElement {
	render = () => when(ctrl.green, () => `green`);
}

@withController(ctrl)
class RedLight extends LitElement {
	render = () => when(ctrl.red, () => `red`);
}

window.customElements.define('green-light', GreenLight);
window.customElements.define('red-light', RedLight);
document.body.appendChild(new GreenLight());
document.body.appendChild(new RedLight());

console.log(ctrl);
