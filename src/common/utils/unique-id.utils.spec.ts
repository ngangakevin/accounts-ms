import { uniqueId } from './unique-id.utils';

describe('UniqueId util creates unique entries each time it is called', () => {
  test('id generated is unique for the first 10000 entries', () => {
    const ids = new Set();
    for (let i = 0; i < 10000; i++) {
      ids.add(uniqueId());
    }
    expect(ids.size).toEqual(10000);
  });
});
