import { connectToParent } from "penpal";

export default function (methods) {
  return connectToParent({
    methods,
    debug: true,
  });
}
