import "symbol-observable";

// Mora Reactivity System - V1 API Types

// === Internal Symbol for Branding ===

declare const StoreSymbol: unique symbol;

// === Core Ref ===

// Note: Mora uses the term `Ref` to describe a reactive value container with `get`, `set`, and `subscribe`.
// While the broader ecosystem is gravitating toward the term `Signal`, we find `Ref` to be more intuitive
// for most JavaScript developers — especially those familiar with patterns from Vue or React. `Ref` emphasizes
// the value-centric, container-like nature of the primitive rather than its signaling behavior.
// Mora prioritizes clarity and ergonomic mental models over strict ecosystem alignment.
// Despite the naming difference, Mora's `Ref` API closely aligns with the TC39 proposal for signals.

/**
 * Represents a reactive reference to a value.
 * Provides access and subscription mechanisms to track and react to changes.
 */
export interface RefInstance<T> {
  /**
   * Retrieves the current value of the ref.
   * Accessing it during a reactive effect will track the dependency.
   */
  get(): T;

  /**
   * Sets a new value to the ref, triggering all subscribers and dependent effects.
   */
  set(value: T): void;

  /**
   * Subscribes to changes in the ref's value. Returns a function to unsubscribe.
   */
  subscribe(fn: (value: T) => void): () => void;

  /**
   * Implements the Observable interface for interoperability with observable based, reactive tools.
   */
  [Symbol.observable](): RefInstance<T>;
}

/**
 * Options for creating a Ref.
 */
export interface RefOptions {
  /**
   * An optional AbortSignal that, when triggered, will abort the ref and clean up its subscriptions.
   * @remarks
   * signal here refers to an AbortSignal from AbortController API, not a signal as a reactive primitive.
   * This follows the convention used in native web APIs like fetch and addEventListener
   * See the [MDN AbortController documentation](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) for more information.
   */
  signal?: AbortSignal;
}

/**
 * Options for creating a writable computed ref.
 *
 * @typeParam TGet - The type of the computed value returned by `get()`.
 * @typeParam TSet - The type of the value accepted by `set()` (defaults to `TGet`).
 */
interface WritableComputedOptions<TGet, TSet = TGet> extends RefOptions {
  /**
   * Getter function for the computed value. Used to derive the value from other reactive sources.
   */
  get: () => TGet;
  /**
   * Setter function for the computed value. Called when the computed ref is assigned a new value.
   */
  set: (value: TSet) => void;
}

/**
 * Creates a new Ref that holds a reactive value.
 */
export function Ref<T>(value: T, options?: RefOptions): RefInstance<T>; // callable constructor

/**
 * Namespace for Ref-related utilities.
 */
export namespace Ref {
  /**
   * Returns the value of a ref if the argument is a ref, otherwise returns the value unchanged.
   *
   * @remarks
   * This is a shallow unwrap only. Does not recursively unwrap nested refs or ref-containing structures.
   * This will cause the the accessed ref to be added as a dependency for any current, reactive scopes
   */
  function deref<T>(maybeRef: T | RefInstance<T>): T;
  /**
   * Permanently detaches the ref from the reactive system.
   *
   * @remarks
   * `abort()` is a terminal operation. Once called, the reactive primitive is permanently
   * detached from the system. It cannot be re-enabled, re-subscribed, or restored.
   *
   * Specifically for a `RefInstance`:
   * - Unsubscribes all current observers
   * - Prevents new subscriptions
   * - Stops tracking in effects
   * - Prevents `set()` from triggering updates
   * - Allows `get()` to return the last known value, but does not track
   */
  function abort(): void;
  /**
   * Checks whether the given ref has been aborted.
   */
  function isAborted(ref: RefInstance<unknown>): boolean;
  /**
   * Returns a readonly version of the given ref.
   *
   * @remarks
   * The returned ref can still be read and tracked, but cannot be written to.
   */
  function readonly<T>(ref: RefInstance<T>): RefInstance<T>;
  /**
   * Creates a readonly computed ref derived from other reactive values.
   */
  function computed<T>(getter: () => T, options?: RefOptions): RefInstance<T>;
  /**
   * Creates a writable computed ref with custom getter and setter logic.
   */
  function computed<T>(options: WritableComputedOptions<T>): RefInstance<T>;
  /**
   * Returns the value of a ref without tracking dependencies.
   */
  function peek<T>(ref: RefInstance<T>): T;
  /**
   * Links two refs so that updates to one will update the other, and vice versa.
   *
   * @returns A disposer function to unlink the refs.
   */
  function link<T>(a: RefInstance<T>, b: RefInstance<T>): () => void;
  /**
   * Checks whether the given value is a RefInstance.
   */
  function isRef(value: unknown): value is RefInstance<unknown>;
}

// === Store ===

/**
 * Represents a reactive store that mirrors an object shape with reactive properties.
 */
export type StoreInstance<T extends object> = T & {
  [StoreSymbol]: true;
};

/**
 * Options for creating a Store.
 */
export interface StoreOptions {
  /**
   * An optional AbortSignal that, when triggered, will abort the store and detach its reactivity.
   * @remarks
   * signal here refers to an AbortSignal from AbortController API, not a signal as a reactive primitive.
   * This follows the convention used in native web APIs like fetch and addEventListener
   * See the [MDN AbortController documentation](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) for more information.
   */
  signal?: AbortSignal;
}

/**
 * Creates a new reactive Store proxy for an object.
 */
export function Store<T extends object>(
  value: T,
  options?: StoreOptions
): StoreInstance<T>; // callable constructor

/**
 * Namespace for Store-related utilities.
 */
export namespace Store {
  /**
   * Permanently detaches the store from the reactive system.
   *
   * @remarks
   * `abort()` is a terminal operation. Once called, the reactive primitive is permanently
   * detached from the system. It cannot be re-enabled, re-subscribed, or restored.
   *
   * Specifically for a `StoreInstance`:
   * - Aborts all internal property signals
   * - Detaches all dependency tracking
   * - Prevents any future reactivity
   * - Allows continued read access, but without reactivity
   * - `getRef()` calls will no longer return reactive signals
   */
  function abort(): void;
  /**
   * Checks whether the given store has been aborted.
   */
  function isAborted(store: StoreInstance<object>): boolean;
  /**
   * Returns a readonly version of the given store.
   *
   * @remarks
   * The returned store reflects the same object shape but prevents all mutation attempts.
   */
  function readonly<T extends object>(
    store: StoreInstance<T>
  ): StoreInstance<T>;
  /**
   * Checks whether the given value is a StoreInstance.
   */
  function isStore(value: unknown): value is StoreInstance<object>;

  // This is the 'magical' tracking getter
  /**
   * Retrieves the internal ref corresponding to the last store property accessed within a tracked context.
   *
   * @remarks
   * This function must be called within a tracking scope that reads a property of a store.
   */
  function getRef<T>(access: T): RefInstance<T>;
}

// === Effects ===

/**
 * Represents a reactive side-effect tied to changes in refs or stores.
 */
export interface EffectInstance {
  /**
   * Re-enables a previously disabled effect, allowing it to respond to reactive changes again.
   */
  enable(): void;
  /**
   * Temporarily disables the effect, preventing it from responding to reactive changes.
   */
  disable(): void;
  /**
   * Tracks if the effect will respond to changes in its dependencies.
   */
  isEnabled: boolean;
}

/**
 * Options for creating a reactive Effect.
 */
export interface EffectOptions {
  /**
   * An optional AbortSignal that, when triggered, will abort the effect and clean up its reactive participation.
   * @remarks
   * signal here refers to an AbortSignal from AbortController API, not a signal as a reactive primitive.
   * This follows the convention used in native web APIs like fetch and addEventListener
   * See the [MDN AbortController documentation](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) for more information.
   */
  signal?: AbortSignal;
}

/**
 * Creates a reactive effect that automatically re-runs when its dependencies change.
 */
export function Effect(fn: () => void, options?: EffectOptions): EffectInstance;

/**
 * Namespace for Effect-related utilities.
 */
export namespace Effect {
  /**
   * Permanently detaches the effect from the reactive system.
   *
   * @remarks
   * `abort()` is a terminal operation. Once called, the reactive primitive is permanently
   * detached from the system. It cannot be re-enabled, re-subscribed, or restored.
   *
   * Specifically for an `EffectInstance`:
   * - Unregisters from all signals
   * - Prevents future execution
   * - Overrides `enable()` and `disable()` (no-ops post-abort)
   * - Triggers any cleanup logic
   * - Permanently detaches from the reactive system
   */
  function abort(effect: EffectInstance): void;
  /**
   * Checks whether the given effect has been aborted.
   */
  function isAborted(effect: EffectInstance): boolean;
  /**
   * Checks whether the given value is an EffectInstance.
   */
  function isEffect(value: unknown): value is EffectInstance;
}

// === Utility ===

/**
 * Runs a function without tracking its reactive dependencies.
 */
export function untrack<T>(fn: () => T): T;
