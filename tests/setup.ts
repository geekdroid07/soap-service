import { afterEach, beforeEach, jest } from '@jest/globals';

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.resetAllMocks();
  jest.restoreAllMocks();
});
