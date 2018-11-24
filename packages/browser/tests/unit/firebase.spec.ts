import firebaseLib from 'firebase/app';
import { initializeApp, requestMessagingPermission } from '@/firebase';
import { FirebaseConfig } from '@/config';

const config: FirebaseConfig = {
  apiKey: 'the-api-key',
  messagingSenderId: 'the-sender-id',
  publicVapidKey: 'the-vapid-key',
};

function createFirebaseMock() {
  const firebaseMock: Partial<typeof firebaseLib> = {
    initializeApp: jest.fn(),
    messaging: jest.fn().mockReturnValue({
      usePublicVapidKey: jest.fn(),
      requestPermission: jest.fn(),
    }) as any,
  };
  return firebaseMock as typeof firebaseLib;
}

describe('firebase.initializeApp', () => {
  it('should initialize the App', () => {
    const firebaseMock = createFirebaseMock();
    initializeApp(firebaseMock, config);
    expect(firebaseMock.initializeApp).toHaveBeenCalledWith(config);
  });

  it('should initialize messaging', () => {
    const firebaseMock = createFirebaseMock();
    initializeApp(firebaseMock, config);
    const { messaging } = firebaseMock;
    expect(messaging).toHaveBeenCalled();
    expect(messaging().usePublicVapidKey).toHaveBeenCalled();
  });
});

describe('firebase.requestMessagingPermission', () => {
  it('should request for permission', async () => {
    const firebaseMock = createFirebaseMock();
    await requestMessagingPermission(firebaseMock);
    expect(firebaseMock.messaging().requestPermission).toHaveBeenCalled();
  });
});
