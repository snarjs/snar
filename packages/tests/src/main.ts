// lit
import {LitElement, html} from 'lit';
import {customElement, state, query} from 'lit/decorators.js';
import {choose} from 'lit/directives/choose.js';
import {ReactiveController} from '@snar/lit';

class Timer extends ReactiveController {
  static States = {IDLE: 0, PAUSED: 1, RUNNING: 2};

  @state() state = Timer.States.IDLE;
  @state() value = 0;

  start() {
    this.state = Timer.States.RUNNING;
    this._createInterval();
  }

  stop() {
    this._clearInterval();
    this.state = Timer.States.IDLE;
    this.value = 0;
  }

  pause() {
    this.state = Timer.States.PAUSED;
    this._clearInterval();
  }

  _interval = null;
  _createInterval() {
    this._clearInterval();
    this._interval = setInterval(() => (this.value += 1), 1000);
  }
  _clearInterval() { clearInterval(this._interval) }

  updated() {
    console.log('Timer value changed!');
  }
}

@customElement('timer-buttons')
class TimerButtons extends LitElement {
  timer!: Timer;

  render = () => choose(this.timer.state, [
      [Timer.States.IDLE, () => html` <button @click=${() => this.timer.start()}>Start</button> `],
      [Timer.States.RUNNING, () => html`
          <button @click=${() => this.timer.stop()}>Stop</button>
          <button @click=${() => this.timer.pause()}>Pause</button>
      `],
      [Timer.States.PAUSED, () => html`
          <button @click=${() => this.timer.stop()}>Stop</button>
          <button @click=${() => this.timer.start()}>Resume</button>
      `]
    ]);
}

@customElement('timer-display')
class TimerDisplay extends LitElement {
  timer!: Timer;

  render = () => html`${this.timer.value} <button @click=${() => this.timer.stop()}>stop (from TimerDisplay)</button>`;
}

@customElement('app-container')
class AppContainer extends LitElement {
  timer = new Timer(this); // timer reactive controller

  @query('timer-buttons') timerButtons!: TimerButtons;
  @query('timer-display') timerDisplay!: TimerDisplay;

  render() {
    return html` <header>Timer App</header>
      <navigation></navigation>
      <content>
        <timer-buttons></timer-buttons><br /><br />
        <timer-display></timer-display>
      </content>
      <footer></footer>`;
  }

  firstUpdated() { // "consumers"
    this.timer.bind(this.timerButtons, 'timer');
    this.timer.bind(this.timerDisplay, 'timer');
  }
}
