import firebaseLib from 'firebase/app';
import { initializeApp } from '@/firebase';
import { FirebaseConfig } from '@/config';

describe('firebase', () => {
  it('should initialize the App', () => {
    const firebaseMock: Partial<typeof firebaseLib> = {
      initializeApp: jest.fn(),
      messaging: jest.fn() as any,
    };
    const config: FirebaseConfig = {
      apiKey: 'the-api-key',
    };
    initializeApp(firebaseMock as typeof firebaseLib, config);
    expect(firebaseMock.initializeApp).toHaveBeenCalledWith({
      apiKey: 'the-api-key',
    });
  });

  it('should initialize messaging', () => {
    const firebaseMock: Partial<typeof firebaseLib> = {
      initializeApp: jest.fn(),
      messaging: jest.fn() as any,
    };
    const config: FirebaseConfig = {
      apiKey: 'the-api-key',
    };
    initializeApp(firebaseMock as typeof firebaseLib, config);
    expect(firebaseMock.messaging).toHaveBeenCalled();
  });
});
