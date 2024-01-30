/**
 * @license
 * Copyright (c) 2023 Valentin Degenne
 * SPDX-License-Identifier: MIT
 *
 * Thanks to Steve Orvell for helping me find a solution (Proxy).
 */
import {
	LitElement,
	ReactiveController as LitReactiveController,
	ReactiveControllerHost,
	ReactiveElement,
} from 'lit';
import {PropertyValues, ReactiveObject} from 'snar';

const hostedMethods = new Set([
	'hostConnected',
	'hostDisconnected',
	'hostUpdate',
	'hostUpdated',
]);

interface MultiHostReactiveController {
	hostConnected(host: ReactiveControllerHost): void;
	hostDisconnected(host: ReactiveControllerHost): void;
}

export class ReactiveController<Interface = unknown>
	extends ReactiveObject<Interface>
	implements MultiHostReactiveController
{
	protected _hosts: ReactiveControllerHost[];

	constructor(
		host?: ReactiveControllerHost,
		defaultState?: Partial<Interface>
	) {
		super(defaultState);
		if (host) {
			this.bind(host);
		}
	}

	bind(host: ReactiveControllerHost, target?: PropertyKey) {
		if (!this.hasHost(host)) {
			const proxy = new Proxy(this as {} as LitReactiveController, {
				get(target, prop, receiver) {
					return hostedMethods.has(String(prop))
						? () => target[prop]?.(host)
						: Reflect.get(target, prop, receiver);
				},
			});

			host.addController(proxy);
			if (target) {
				host[target] = this;
			}
		}
		return this;
	}

	protected __update(_changedProperties: PropertyValues) {
		this._hosts?.forEach((host) => host.requestUpdate());
	}

	addHost(host: ReactiveControllerHost) {
		(this._hosts ??= []).push(host);
	}

	removeHost(host: ReactiveControllerHost) {
		this._hosts?.splice(this._hosts.indexOf(host) >>> 0, 1);
	}

	hasHost(host: ReactiveControllerHost) {
		return (this._hosts ?? []).indexOf(host) >= 0;
	}

	hostConnected(host: ReactiveControllerHost) {
		this.addHost(host);
	}

	hostDisconnected(host: ReactiveControllerHost) {
		this.removeHost(host);
	}

	remoteUpdateComplete() {
		return Promise.all(this._hosts?.map((host) => host.updateComplete));
	}

	/**
	 * Unattach controller from all disconnected hosts
	 * and remove them from the list, so the garbage-collector
	 * can potentially suppresses them if they are not
	 * used anymore.
	 */
	flushDisconnectedHosts() {
		for (const host of this._hosts) {
			if ((host as ReactiveElement).isConnected === false) {
				host.removeController(this as {} as LitReactiveController);
				this.removeHost(host);
			}
		}
	}
}

export class LitElementControllerHost<
	T = ReactiveController
> extends LitElement {
	controller: T;
}
