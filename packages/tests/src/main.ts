import { PropertyValues, state } from "snar";
import { ReactiveLocalStorage } from "snar/lib/local-storage.js";

class LS1 extends ReactiveLocalStorage {
  @state() foo = "foo";
}
class LS2 extends ReactiveLocalStorage {
  @state() bar = "bar";
}

await new LS1("same-handler").updateComplete;
try {
  await new LS2("same-handler").updateComplete;
} catch (e) {
  console.log("lol");
}
