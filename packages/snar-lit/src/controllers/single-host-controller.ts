import { ReactiveObject } from "snar";
import { LitElement, ReactiveController, ReactiveControllerHost } from "lit";

export class SingleHostController extends ReactiveObject {
  protected _$host?: ReactiveControllerHost;

  constructor(host?: ReactiveControllerHost) {
    super();
    this.host = host;
  }

  set host(host: ReactiveControllerHost) {
    if (this._$host) {
      this._$host.removeController(this as ReactiveController);
    }
    this._$host = host;
    if (host) {
      host.addController(this as ReactiveController);
    }
  }

  get host() {
    return this._$host;
  }

  protected override __update() {
    this._$host?.requestUpdate();
  }
}

export class LitElementControllerHost<
  T = SingleHostController
> extends LitElement {
  controller: T;
}
