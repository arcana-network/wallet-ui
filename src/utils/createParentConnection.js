import { connectToParent } from "penpal";

export function createParentConnection(methods) {
  return connectToParent({
    methods,
    debug: true,
  });
}
