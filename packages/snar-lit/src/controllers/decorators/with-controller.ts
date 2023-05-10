/**
 * MIT © 2023
 * Valentin Degenne
 */
import { ReactiveElement } from "lit";
import { ClassDescriptor, Constructor } from "../../decorators/base.js";
import { MultiHostController } from "../multi-host-controller.js";
import {
  LitElementControllerHost,
  // LitElementControllerHost,
  SingleHostController,
} from "../single-host-controller.js";

type CustomElementClass = Omit<typeof HTMLElement, "new">;

function hasConstructorNameAsInheritance(
  constructor: Function,
  needle: string
) {
  do {
    if (!("name" in constructor)) {
      return false;
    }
    if (constructor.name === needle) {
      return true;
    }
  } while ((constructor = Object.getPrototypeOf(constructor)) !== "");
  return false;
}

// function attachControllerToElement() {}

const legacyWithController = (
  controllerObjectOrConstructor:
    | typeof SingleHostController
    | SingleHostController
    | MultiHostController,
  clazz: CustomElementClass
) => {
  let controller = controllerObjectOrConstructor;
  // Constructor
  if (typeof controllerObjectOrConstructor === "function") {
    if (
      hasConstructorNameAsInheritance(
        controllerObjectOrConstructor,
        "SingleHostController"
      )
    ) {
      (clazz as typeof ReactiveElement).addInitializer(
        (instance: ReactiveElement) => {
          controller = new controllerObjectOrConstructor(instance);
          if (instance instanceof LitElementControllerHost) {
            // Removing the `controller` handler if more than
            // one controller is bind, to avoid ambiguous contract.
            if (instance.controller !== undefined) {
              instance.controller = undefined;
            } else {
              instance.controller = controller;
            }
          }
        }
      );
    } else if (
      hasConstructorNameAsInheritance(
        controllerObjectOrConstructor,
        "MultiHostController"
      )
    ) {
      throw new Error(`\`MultiHostController\` can't be used in decorator.
You will have to create an instance outside and pass the instance in.`);
    } else {
      throw new Error("You passed an unknown constructor.");
    }
  }
  // Instance
  else if (typeof controllerObjectOrConstructor === "object") {
    if (controllerObjectOrConstructor instanceof SingleHostController) {
      (clazz as typeof ReactiveElement).addInitializer(
        (instance: ReactiveElement) => {
          if (controllerObjectOrConstructor instanceof SingleHostController) {
            (controller as SingleHostController).host = instance;
          }
          if (instance instanceof LitElementControllerHost) {
            // Removing the `controller` handler if more than
            // one controller is bind, to avoid ambiguous contract.
            if (instance.controller !== undefined) {
              instance.controller = undefined;
            } else {
              instance.controller = controllerObjectOrConstructor;
            }
          }
        }
      );
    }
  } else {
    throw new Error("Unknown Type");
  }
  // Cast as any because TS doesn't recognize the return type as being a
  // subtype of the decorated class when clazz is typed as
  // `Constructor<HTMLElement>` for some reason.
  // `Constructor<HTMLElement>` is helpful to make sure the decorator is
  // applied to elements however.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return clazz as any;
};

const standardWithController = (
  controller:
    | typeof SingleHostController
    | SingleHostController
    | MultiHostController,
  descriptor: ClassDescriptor
) => {
  const { kind, elements } = descriptor;
  return {
    kind,
    elements,
    // This callback is called once the class is otherwise fully defined
    finisher(clazz: Constructor<HTMLElement>) {
      console.log("we are in standard");
      // customElements.define(tagName, clazz);
    },
  };
};

/**
 * @category Decorator
 * @param controllerClassOrInstance The controller to be used on the custom element
 */
export function withController(
  controllerClassOrInstance:
    | typeof SingleHostController
    | SingleHostController
    | MultiHostController
) {
  // Decorating function
  return function (classOrDescriptor: CustomElementClass | ClassDescriptor) {
    // If first argument is a function it's legacy decorator
    // with constructor function
    if (typeof classOrDescriptor === "function") {
      // Returns a constructor
      return legacyWithController(controllerClassOrInstance, classOrDescriptor);
    }
    // Else we are in the decorator spec and first argument is a descriptor.
    // Returns a descriptor
    return standardWithController(
      controllerClassOrInstance,
      classOrDescriptor as ClassDescriptor
    );
  };
}
