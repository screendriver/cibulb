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
    }) as any,
  };
  return firebaseMock as typeof firebaseLib;
}

function createFirebaseAppMock() {
  const firebaseMock: Partial<firebaseLib.app.App> = {
    messaging: jest.fn().mockReturnValue({
      requestPermission: jest.fn(),
    }) as any,
  };
  return firebaseMock as firebaseLib.app.App;
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
    const appMock = createFirebaseAppMock();
    await requestMessagingPermission(appMock);
    expect(appMock.messaging().requestPermission).toHaveBeenCalled();
  });
});
