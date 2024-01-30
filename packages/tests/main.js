var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
// lit
import { LitElement, html } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { choose } from 'lit/directives/choose.js';
// snar
import { ReactiveController } from '@snar/lit';
/**
 * Reactive controller,
 * automatically updates connected hosts
 * when its state changes (syntax similar to LitElement!)
 */
class Timer extends ReactiveController {
    constructor() {
        super(...arguments);
        this.state = Timer.STATES.IDLE;
        this.value = 0;
        this._interval = null;
    }
    static { this.STATES = { IDLE: 0, PAUSED: 1, RUNNING: 2 }; }
    start() {
        this.state = Timer.STATES.RUNNING;
        this._createInterval();
    }
    stop() {
        this._clearInterval();
        this.state = Timer.STATES.IDLE;
        this.value = 0;
    }
    pause() {
        this.state = Timer.STATES.PAUSED;
        this._clearInterval();
    }
    _createInterval() {
        this._clearInterval();
        this._interval = setInterval(() => (this.value += 1), 1000);
    }
    _clearInterval() {
        clearInterval(this._interval);
    }
    /**
     * When the state changes, it updates hosts,
     * and you can also write extra logic in this function.
     */
    updated() {
        console.log('Timer value changed!');
        // e.g. save state in localstorage.
    }
}
__decorate([
    state()
], Timer.prototype, "state", void 0);
__decorate([
    state()
], Timer.prototype, "value", void 0);
let TimerButtons = class TimerButtons extends LitElement {
    render() {
        return choose(this.timer.state, [
            [
                Timer.STATES.IDLE,
                () => html ` <button @click=${() => this.timer.start()}>Start</button> `,
            ],
            [
                Timer.STATES.RUNNING,
                () => html `
					<button @click=${() => this.timer.stop()}>Stop</button>
					<button @click=${() => this.timer.pause()}>Pause</button>
				`,
            ],
            [
                Timer.STATES.PAUSED,
                () => html `
					<button @click=${() => this.timer.stop()}>Stop</button>
					<button @click=${() => this.timer.start()}>Resume</button>
				`,
            ],
        ]);
    }
};
TimerButtons = __decorate([
    customElement('timer-buttons')
], TimerButtons);
let TimerDisplay = class TimerDisplay extends LitElement {
    constructor() {
        super(...arguments);
        this.render = () => html `${this.timer.value}
			<button @click=${() => this.timer.stop()}>stop (from display)</button>`;
    }
};
TimerDisplay = __decorate([
    customElement('timer-display')
], TimerDisplay);
let AppContainer = class AppContainer extends LitElement {
    constructor() {
        super(...arguments);
        // timer reactive controller
        this.timer = new Timer(this);
    }
    render() {
        return html ` <header>Timer App</header>
			<navigation></navigation>
			<content>
				<timer-buttons></timer-buttons><br /><br />
				<timer-display></timer-display>
			</content>
			<footer></footer>`;
    }
    // "consumers"
    firstUpdated() {
        this.timerButtons.timer = this.timer.bind(this.timerButtons);
        this.timerDisplay.timer = this.timer.bind(this.timerDisplay);
    }
};
__decorate([
    query('timer-buttons')
], AppContainer.prototype, "timerButtons", void 0);
__decorate([
    query('timer-display')
], AppContainer.prototype, "timerDisplay", void 0);
AppContainer = __decorate([
    customElement('app-container')
], AppContainer);
