/**
 * @license
 * Copyright (c) 2023 Valentin Degenne
 * SPDX-License-Identifier: MIT
 *
 * Thanks to Steve Orvell for helping me find a solution (Proxy).
 */
import {
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
	#hosts: ReactiveControllerHost[];

	constructor(host?: ReactiveControllerHost, defaultState?: Partial<Interface>) {
		super(defaultState);
		if (host) {
			this.bind(host);
		}
	}

	bind(host: ReactiveControllerHost) {
		const proxy = new Proxy(this as {} as LitReactiveController, {
			get(target, prop, receiver) {
				return hostedMethods.has(String(prop))
					? () => target[prop]?.(host)
					: Reflect.get(target, prop, receiver);
			},
		});

		host.addController(proxy);
		return this;
	}

	protected __update(_changedProperties: PropertyValues) {
		this.#hosts?.forEach((host) => host.requestUpdate());
	}

	addHost(host: ReactiveControllerHost) {
		(this.#hosts ??= []).push(host);
	}

	removeHost(host: ReactiveControllerHost) {
		this.#hosts?.splice(this.#hosts.indexOf(host) >>> 0, 1);
	}

	hostConnected(host: ReactiveControllerHost) {
		this.addHost(host);
	}

	hostDisconnected(host: ReactiveControllerHost) {
		this.removeHost(host);
	}

	remoteUpdateComplete() {
		return Promise.all(this.#hosts?.map((host) => host.updateComplete));
	}

	/**
	 * Unattach controller from all disconnected hosts
	 * and remove them from the list, so the garbage-collector
	 * can potentially suppresses them if they are not
	 * used anymore.
	 */
	flushDisconnectedHosts() {
		for (const host of this.#hosts) {
			if ((host as ReactiveElement).isConnected === false) {
				host.removeController(this as {} as LitReactiveController);
				this.removeHost(host);
			}
		}
	}
}
