import '@testing-library/jest-dom';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    readonly root = null;
    readonly rootMargin = '';
    readonly thresholds = [];

    constructor() { }

    observe() { }
    unobserve() { }
    disconnect() { }
    takeRecords() { return []; }
};
