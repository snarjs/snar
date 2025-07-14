import {PropertyValues, ReactiveObject} from '../reactive-object.js'

export class ReactiveLocalStorage extends ReactiveObject {
	constructor(
		readonly handler: string,
		readonly overwrite = false,
	) {
		super()
		if (
			this.handler === null ||
			this.handler === undefined ||
			this.handler === ''
		) {
			throw new Error('You need to specify a localstorage handler name.')
		}
	}

	protected override __update(_changedProperties: PropertyValues) {
		if (this.hasUpdated) {
			this.saveData()
			// Only call update if data was loaded from localstorage
			// or if there were any data in the localstorage.
			// if (this.dataFullyLoaded) {
			// super.__update(_changedProperties);
			// }
		} else {
			if (!this.loadData()) {
				// Save default data if localstorage was empty
				this.saveData()
			}
		}
		// super.__update(_changedProperties);
	}

	// override __firstUpdated(_changedProperties: PropertyValues) {
	//   // if (!this.loadData()) {
	//   //   // Save default data if localstorage was empty
	//   //   this.saveData();
	//   // }

	//   // super.__firstUpdated(_changedProperties);
	// }

	/**
	 * Loads the data from the localstorage
	 * @returns true if there were some data, false otherwise
	 */
	protected loadData() {
		// Load information from localstorage if there are
		const localData = localStorage.getItem(this.handler)
		if (localData) {
			const parsedData = JSON.parse(localData)

			//       if (
			//         !this.getLocalStatePropertyNames().every((name) =>
			//           parsedData.hasOwnProperty(name)
			//         )
			//       ) {
			//         if (!this.overwrite) {
			//           throw new Error(`The localstorage doesn't reflect the state of this object.
			// If you know what you are doing, you can pass true as a second argument in the constructor,
			// to override the existing data in the localstorage.`);
			//         } else {
			//           this.saveData();
			//           return;
			//         }
			//       }

			for (const [name, value] of Object.entries(parsedData)) {
				if (this.getLocalStatePropertyNames().includes(name)) {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					;(this as {[key: PropertyKey]: any})[name] = value
				}
			}
			return true
		} else {
			return false
		}
	}

	protected saveData() {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const data: {[key: PropertyKey]: any} = {}
		for (const name of this.getLocalStatePropertyNames()) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			data[name] = (this as {[key: PropertyKey]: any})[name]
		}
		localStorage.setItem(this.handler, JSON.stringify(data))
	}
}

// TODO: Make a mixin
// export function withLocalStorage(superClass: typeof ReactiveObject) {
//   return class extends superClass {}
// }
