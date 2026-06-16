// Use the platform's native built-in DOMException directly, eliminating the deprecated 3rd-party library.
module.exports = globalThis.DOMException;
