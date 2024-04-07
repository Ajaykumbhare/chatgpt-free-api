/**
 * Generates a unique message ID.
 * @returns {string} The generated message ID.
 */
export function generateMessageId() {
  const PREFIX = 'aaa1';
  return PREFIX.concat(crypto.randomUUID().substring(4));
}
