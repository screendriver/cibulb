import { getConfig } from '@/config';

describe('config', () => {
  it('should return a config object', () => {
    const actual = getConfig();
    expect(actual).toEqual({
      socketUrl: 'https://api.cibulb.info',
    });
  });
});
