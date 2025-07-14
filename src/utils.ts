import type {PropertyValues} from './types.js'

export function propertyValuesToJson<T>(
	changed: PropertyValues,
	object: any,
): Partial<T> {
	return Object.fromEntries(
		[...changed.keys()].map((key) => [key, object[key]]),
	) as Partial<T>
}
