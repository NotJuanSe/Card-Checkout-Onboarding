import '@testing-library/jest-dom';

// jsdom no implementa el scroll; se sustituye para poder verificarlo en los tests.
window.scrollTo = jest.fn() as unknown as typeof window.scrollTo;
