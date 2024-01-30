var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * @license
 * Copyright (c) 2023 Valentin Degenne
 * SPDX-License-Identifier: MIT
 */
import { LitElement } from 'lit';
import { when } from 'lit/directives/when.js';
import { state } from 'snar';
import { ReactiveController, withController } from '@snar/lit';
class TrafficLightSys extends ReactiveController {
    constructor() {
        super(...arguments);
        this.red = true;
        this.green = false;
    }
    updated(changed) {
        if (changed.has('green')) {
            this.red = !this.green;
        }
        else {
            this.green = !this.red;
        }
    }
}
__decorate([
    state()
], TrafficLightSys.prototype, "red", void 0);
__decorate([
    state()
], TrafficLightSys.prototype, "green", void 0);
const ctrl = new TrafficLightSys();
let GreenLight = class GreenLight extends LitElement {
    constructor() {
        super(...arguments);
        this.render = () => when(ctrl.green, () => `green`);
    }
};
GreenLight = __decorate([
    withController(ctrl)
], GreenLight);
let RedLight = class RedLight extends LitElement {
    constructor() {
        super(...arguments);
        this.render = () => when(ctrl.red, () => `red`);
    }
};
RedLight = __decorate([
    withController(ctrl)
], RedLight);
window.customElements.define('green-light', GreenLight);
window.customElements.define('red-light', RedLight);
document.body.appendChild(new GreenLight());
document.body.appendChild(new RedLight());
console.log(ctrl);
