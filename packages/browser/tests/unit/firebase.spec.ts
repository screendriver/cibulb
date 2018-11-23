import firebaseLib from 'firebase/app';
import { initializeApp } from '@/firebase';
import { FirebaseConfig } from '@/config';

const config: FirebaseConfig = {
  apiKey: 'the-api-key',
  messagingSenderId: 'the-sender-id',
  publicVapidKey: 'the-vapid-key',
};

describe('firebase', () => {
  it('should initialize the App', () => {
    const firebaseMock: Partial<typeof firebaseLib> = {
      initializeApp: jest.fn(),
      messaging: jest.fn() as any,
    };
    initializeApp(firebaseMock as typeof firebaseLib, config);
    expect(firebaseMock.initializeApp).toHaveBeenCalledWith(config);
  });

  it('should initialize messaging', () => {
    const firebaseMock: Partial<typeof firebaseLib> = {
      initializeApp: jest.fn(),
      messaging: jest.fn() as any,
    };
    initializeApp(firebaseMock as typeof firebaseLib, config);
    expect(firebaseMock.messaging).toHaveBeenCalled();
  });
});
