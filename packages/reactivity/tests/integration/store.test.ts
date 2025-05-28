import { Store, Ref } from "@mora-js/reactivity";
import { flushMicrotasks } from "../fixtures/util";

describe("Store", () => {
	it("should return a store", () => {
		const store = Store({ count: 0 });
		expect(Store.isStore(store)).toBe(true);
	});

	it("should initialize primitive values", () => {
		const store = Store({ count: 0, name: "test" });
		expect(store).toEqual({ count: 0, name: "test" });
	});

	it("should initialize primitive refs as primitives", () => {
		const store = Store({ count: Ref(0), name: Ref("test") });
		expect(store).toEqual({ count: 0, name: "test" });
	});

	it("should support getters", () => {
		const store = Store({
			firstName: "Rick",
			lastName: "Sanchez",
			get fullName() {
				return `${this.firstName} ${this.lastName}`;
			},
		});

		expect(store.fullName).toBe("Rick Sanchez");

		store.firstName = "Morty";
		store.lastName = "Smith";

		expect(store.fullName).toBe("Morty Smith");
	});

	it("should support getters with setters", () => {
		const store = Store({
			firstName: "Rick",
			lastName: "Sanchez",
			get fullName() {
				return `${this.firstName} ${this.lastName}`;
			},
			set fullName(value: string) {
				const [firstName, lastName] = value.split(" ");
				this.firstName = firstName;
				this.lastName = lastName;
			},
		});

		expect(store.fullName).toBe("Rick Sanchez");

		store.fullName = "Morty Smith";

		expect(store.firstName).toBe("Morty");
		expect(store.lastName).toBe("Smith");
		expect(store.fullName).toBe("Morty Smith");
	});

	it("should support setters with no getter", () => {
		const store = Store({
			count: 0,
			set increment(value: number) {
				this.count += value;
			},
		});

		expect(store.count).toBe(0);

		store.increment = 5;

		expect(store.count).toBe(5);

		store.increment = 3;

		expect(store.count).toBe(8);
	});

	it("should support getter/setter on prototype", () => {
		class Parent {
			constructor(public firstName: string, public lastName: string) {}

			get fullName() {
				return `${this.firstName} ${this.lastName}`;
			}

			set fullName(value: string) {
				const [firstName, lastName] = value.split(" ");
				this.firstName = firstName;
				this.lastName = lastName;
			}
		}

		class Child extends Parent {}

		const store = Store(new Child("Rick", "Sanchez"));

		expect(store.fullName).toBe("Rick Sanchez");

		store.fullName = "Morty Smith";

		expect(store.firstName).toBe("Morty");
		expect(store.lastName).toBe("Smith");
	});

	describe("assigning a ref to a store property", () => {
		it("should unwrap the ref", () => {
			const store = Store({ count: 0 });
			//@ts-expect-error: unfortunately, TypeScript doesn't allow creating mapped setters, so
			// the store type only allows setting the raw values, not refs
			store.count = Ref(5);

			expect(store.count).toBe(5);
		});

		it("should update when the ref updates", () => {
			const store = Store({ count: 0 });
			const countRef = Ref(0);
			//@ts-expect-error
			store.count = countRef;

			countRef.set(5);

			expect(store.count).toBe(5);
		});

		describe("assigning to that store property again", () => {
			it("should not update the ref", () => {
				const store = Store({ count: 0 });
				const countRef = Ref(0);
				//@ts-expect-error
				store.count = countRef;
				store.count = 5;
				expect(countRef.get()).toBe(0);
				expect(store.count).toBe(5);
			});

			it("should not update the store property when the ref updates", () => {
				const store = Store({ count: 0 });
				const countRef = Ref(1);
				//@ts-expect-error
				store.count = countRef;

				expect(store.count).toBe(1);

				store.count = 5;
				countRef.set(10);

				expect(countRef.get()).toBe(10);
				expect(store.count).toBe(5);
			});
		});
	});

	describe("reactivity", () => {
		test("computed from store", () => {
			const store = Store({ firstName: "Rick", lastName: "Sanchez" });
			const fullName = Ref.computed(() => `${store.firstName} ${store.lastName}`);

			expect(fullName.get()).toBe("Rick Sanchez");

			store.firstName = "Morty";
			store.lastName = "Smith";

			expect(fullName.get()).toBe("Morty Smith");
		});
	});

	describe("deep reactivity", () => {
		it("should return nested objects as stores", () => {
			const store = Store({
				user: {
					name: "Rick",
					age: 70,
				},
			});

			expect(store.user).toEqual({
				name: "Rick",
				age: 70,
			});

			expect(Store.isStore(store.user)).toBe(true);
		});

		test("computed from nested store", () => {
			const store = Store({
				user: {
					firstName: "Rick",
					lastName: "Sanchez",
				},
			});

			const fullName = Ref.computed(() => `${store.user.firstName} ${store.user.lastName}`);
			expect(fullName.get()).toBe("Rick Sanchez");

			store.user.firstName = "Morty";
			store.user.lastName = "Smith";
			expect(fullName.get()).toBe("Morty Smith");
		});
	});
});
