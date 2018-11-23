import { getConfig } from '@/config';

describe('config', () => {
  it('should return a config object', () => {
    const actual = getConfig();
    expect(actual).toEqual({
      socketUrl: 'https://cibulb-service.now.sh',
    });
  });
});
