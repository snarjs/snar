import { ReactiveObject } from "snar";
import type { PropertyValues } from "snar";
import type { ReactiveControllerHost } from "lit";

export class MultiHostController extends ReactiveObject {
  protected _hosts!: ReactiveControllerHost[];

  addHost(host: ReactiveControllerHost) {
    (this._hosts ??= []).push(host);
  }

  removeHost(host: ReactiveControllerHost) {
    this._hosts.splice(this._hosts.indexOf(host) >>> 1, 1);
  }

  protected override __update(_changedProperties: PropertyValues): void {
    this._hosts?.forEach((host) => host.requestUpdate());
  }
}
