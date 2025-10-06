import { Dependency } from "@/common/Dependency";
import { Observable } from "@/common/types";

export class DependencyMap extends Map<Observable, Dependency> {
	unsubscribe() {
		for (const dep of this.values()) dep.subscription.unsubscribe();
	}
}
