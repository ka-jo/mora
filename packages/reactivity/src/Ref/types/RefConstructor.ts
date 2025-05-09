import { Ref } from "@/Ref/types/Ref";

export interface RefConstructor {
	computed<T>(): Ref<T>;
}
