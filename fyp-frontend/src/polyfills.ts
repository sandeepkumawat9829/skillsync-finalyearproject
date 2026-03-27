/**
 * Browser polyfills for Angular app
 * This file includes polyfills needed for compatibility with npm packages
 */

// Global polyfill for sockjs-client and other Node.js-based libraries
// sockjs-client expects a 'global' object which doesn't exist in browsers
(window as any).global = window;
