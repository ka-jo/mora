import { $flags, $store, $subscribers, $value } from "@/common/symbols";
import { currentContext } from "@/common/tracking-context";
import { Observable, Observer } from "@/common/types";
import { Subscription } from "@/common/Subscription";
import { getPropertyDescriptor, isObject, isSymbol } from "@/common/util";
import type { Store } from "@/Store/Store";
import type { Ref, WritableComputedRefOptions } from "@/Ref";
import { isRef } from "@/Ref/isRef";
import { ComputedRef } from "@/Ref/core/ComputedRef";
import { BaseRef } from "@/Ref/core/BaseRef";

/**
 * The base store class enables the creation of a reactive object with automatic ref unwrapping via
 * the Proxy API. The store instance itself acts as the proxy handler. In reactive contexts, the
 * store will create refs for each property in the original object and further reads/writes to that
 * property will be delegated to the property ref. This means that over time, the original object's
 * properties will be replaced with refs as needed, so it's important to note that the consumer
 * should not keep references to nor interact with the original object directly. We could
 * technically avoid defining refs on the original object because after a property ref is created,
 * further reads/writes will go through it, but I don't like the idea of a store's object falling
 * out of sync with the store's refs.
 *
 * The store currently keeps a map of refs for each property to act as a hot path in reads/writes:
 * if the property ref already exists, we can skip quite a few conditions (e.g. checking if the
 * property in the original object is a ref, checking if the new value is a ref, etc.)
 *
 * Unlike other "Base" classes, the BaseStore is a bit different in that the consumer won't
 * directly interact with it. The consumer will interact with a proxy and the store is created
 * behind the scenes as the handler.
 *
 * @internal
 */
export class BaseStore<T extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>>
	implements ProxyHandler<T>, Observable<T>
{
	declare [$flags]: number;
	declare [$value]: T;
	declare [$subscribers]: Subscription[];
	declare [$store]: BaseStore<T>;

	declare proxy: Store<T>;
	declare refs: Record<PropertyKey, Ref>;

	// Because the proxy must be created after the store, a BaseStore instance must be created via
	// the static create method, so the constructor is private.
	private constructor(object: T) {
		this[$flags] = 0;
		this[$value] = object;
		this[$subscribers] = [];
		this[$store] = this;
		Object.defineProperty(object, $store, {
			value: this,
			enumerable: false,
			configurable: false,
			writable: false,
		});

		this.refs = Object.create(null);
	}

	subscribe(
		onNextOrObserver: Partial<Observer<T>> | Observer<T>["next"],
		onError?: Observer<T>["error"],
		onComplete?: Observer<T>["complete"]
	): Subscription {
		return Subscription.init(this, onNextOrObserver, onError, onComplete);
	}

	[Symbol.observable](): Observable<T> {
		return this;
	}

	get(target: T, prop: PropertyKey, receiver: T) {
		if (this.refs[prop]) return this.refs[prop].get();

		if (isSymbol(prop)) return target[prop];

		// If it's a tracking context, we need to ensure that the property ref is initialized
		if (currentContext) return BaseStore.initPropertyRef(this, prop).get();

		const targetValue = target[prop];
		if (isRef(targetValue)) {
			// If the property used to create the store is a ref, we'll use it as the property ref
			// to ensure that it remains stable
			this.refs[prop] = targetValue;
			return targetValue.get();
		}

		if (isObject(targetValue)) return BaseStore.initPropertyRef(this, prop).get();

		return targetValue;
	}

	set(target: T, prop: PropertyKey, value: unknown, receiver: T): boolean {
		if (this.refs[prop]) return this.refs[prop].set(value);

		if (isRef(value)) {
			// We've already established a ref doesn't exist for this property, and if a ref is
			// assigned to a store, we need to ensure the store has a property ref to link to it.
			BaseStore.initPropertyRef(this, prop, value);
			return true;
		}

		const targetValue = target[prop];
		if (isRef(targetValue)) {
			// If the property used to create the store is a ref, we'll use it as the property ref
			// to ensure that it remains stable
			this.refs[prop] = targetValue;
			return targetValue.set(value);
		}

		return Reflect.set(target, prop, value, receiver);
	}

	static create<T extends Record<PropertyKey, unknown>>(object: T): Store<T> {
		if (object[$store]) {
			return (object[$store] as BaseStore<T>).proxy;
		}
		const store = new BaseStore(object);
		const proxy = new Proxy(object, store) as Store<T>;
		store.proxy = proxy;
		return proxy;
	}

	/**
	 * This function initializes a store ref for a given store and property key. This function
	 * assumes that the store doesn't already have a ref for the property key, so it should only
	 * be called once determined that a store's ref map doesn't have the property key.
	 *
	 * @param store
	 * @param prop
	 * @param value - (optional) The value to use for the ref. If not provided, the value will be taken from the store's value object.
	 * @returns a ref instance for the property key.
	 */
	private static initPropertyRef(store: BaseStore, prop: PropertyKey, value?: unknown): Ref {
		const storeValue = store[$value][prop];
		if (isRef(storeValue)) {
			store.refs[prop] = storeValue;

			if (arguments.length > 2) storeValue.set(value);

			return storeValue;
		}

		const descriptor = getPropertyDescriptor(store[$value], prop);
		if (descriptor && (descriptor.get || descriptor.set)) {
			const ref = new ComputedRef({
				get: descriptor.get?.bind(store),
				set: descriptor.set?.bind(store),
			} as WritableComputedRefOptions<unknown>);

			store[$value][prop] = store.refs[prop] = ref;

			if (arguments.length > 2) ref.set(value);

			return ref;
		}

		if (arguments.length > 2) {
			return (store[$value][prop] = store.refs[prop] = new BaseRef(value, { shallow: false }));
		} else {
			return (store[$value][prop] = store.refs[prop] = new BaseRef(storeValue, { shallow: false }));
		}
	}
}
