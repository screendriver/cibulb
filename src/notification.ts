export enum NotificationTitle {
  INFO = 'info',
}

async function isNotificationGranted(): Promise<boolean> {
  if ('Notification' in window) {
    const result = await Notification.requestPermission();
    return result === 'granted';
  }
  return false;
}

export async function showNotification(title: NotificationTitle, body: string) {
  const isGranted = await isNotificationGranted();
  if (!isGranted) {
    return;
  }
  return new Notification(title, {
    body,
    renotify: true,
    tag: 'bulb',
  });
}
