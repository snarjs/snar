var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { state } from 'snar';
import { ReactiveLocalStorage } from 'snar/lib/localstorage.js';
import { SingleHostController } from '@snar/lit';
console.log(SingleHostController);
class LS1 extends ReactiveLocalStorage {
    constructor() {
        super(...arguments);
        this.foo = 'foo';
    }
}
__decorate([
    state()
], LS1.prototype, "foo", void 0);
class LS2 extends ReactiveLocalStorage {
    constructor() {
        super(...arguments);
        this.bar = 'bar';
    }
}
__decorate([
    state()
], LS2.prototype, "bar", void 0);
await new LS1('same-handler').updateComplete;
try {
    await new LS2('same-handler').updateComplete;
}
catch (e) {
    console.log('lol');
}
