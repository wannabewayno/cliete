/**
 * Executes a function and returns any error message that occurs during execution
 * @param fn - Function to execute
 * @returns Empty string if no error occurs, otherwise returns formatted error message
 * @example
 * const result = errMessage(() => {
 *   throw new Error('Something went wrong');
 * }); // returns "Something went wrong"
 */
export default function errMessage(fn: () => unknown): string {
  try {
    fn();
    return '';
  } catch (err: unknown) {
    return (err as Error).message
      .replace(/\\n/g, '\n')
      .replace(/\\u001b/g, '\u001b')
      .replace(/\\'/, "'")
      .replace(/\\"/, '"');
  }
}
