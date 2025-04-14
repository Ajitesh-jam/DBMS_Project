/**
 * Combines multiple class names into a single string, ignoring falsy values.
 * @param {...(string | false | null | undefined)[]} classes - Class names to combine
 * @returns {string} - Combined class names as a single string
 */
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Creates a debounced function that delays invoking `func` until after `wait` milliseconds
 * since the last time it was invoked.
 * @template T
 * @param {(this: any, ...args: T[]) => void} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {((...args: T[]) => void) & { cancel: () => void }} - The debounced function with a `cancel` method
 */
function debounce(func, wait) {
  let timeout;

  // Correctly type debounced with 'this: any'
  const debounced = function (...args) {
    // Clear the previous timeout if it exists
    if (timeout) {
      clearTimeout(timeout);
    }

    // Set a new timeout to delay the function execution
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };

  /**
   * Cancels any pending execution of the debounced function.
   */
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
    }
  };

  return debounced;
}

// Exporting both functions for use in other modules
export { cn, debounce };
