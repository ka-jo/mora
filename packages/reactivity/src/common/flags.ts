export const enum Flags {
	Enabled = 1 << 0,
	Aborted = 1 << 1,
	Dirty = 1 << 2,
	Queued = 1 << 3,
}
