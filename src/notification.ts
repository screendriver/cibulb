async function isNotificationGranted(): Promise<boolean> {
  if ('Notification' in window) {
    const result = await Notification.requestPermission();
    return result === 'granted';
  }
  return false;
}

export async function showNotification(title: string, body: string) {
  const isGranted = await isNotificationGranted();
  if (!isGranted) {
    return;
  }
  new Notification(title, {
    body,
    renotify: true,
    tag: 'lightbulb',
  });
}
