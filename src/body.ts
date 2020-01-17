export function assertHasEventBody(
  body: string | null,
): asserts body is string {
  if (body === null) {
    throw new TypeError("body can't be null");
  }
}
