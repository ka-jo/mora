/**
 * The options for constructing a ref
 *
 * @public
 */
export interface RefOptions {
	/**
	 * An {@link AbortSignal} that can be used to abort a ref instance as if
	 * {@link RefConstructor.abort | Ref.abort} was called. This is useful to manage the
	 * lifecycle of many ref instances for memory management purposes.
	 *
	 * @public
	 */
	signal?: AbortSignal;
}
