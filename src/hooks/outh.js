export function generateStateToken() {
    const array = new Uint32Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => dec.toString(16)).join('');
  }