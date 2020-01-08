import { AssertionError } from 'assert';

export function assertIsString(val?: string): asserts val is string {
  if (typeof val !== 'string') {
    throw new AssertionError({ message: 'Not a string!' });
  }
}
