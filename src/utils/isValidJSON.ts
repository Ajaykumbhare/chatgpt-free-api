/**
 * Checks if a given string is a valid JSON.
 * @param jsonString - The string to be checked.
 * @returns A boolean indicating whether the string is a valid JSON or not.
 */
export function isValidJSON(jsonString: string) {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
}
