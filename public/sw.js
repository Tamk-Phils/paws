self.addEventListener('push', function (event) {
    if (!event.data) return;

    try {
        const data = event.data.json();
        const options = {
            body: data.message || 'New notification',
            icon: '/icon-192x192.png', // Fallback icon
            badge: '/badge-72x72.png',
            data: {
                url: data.url || '/'
            },
            vibrate: [100, 50, 100],
            actions: [
                { action: 'open', title: 'View' },
                { action: 'close', title: 'Dismiss' }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'PawsomeBreed', options)
        );
    } catch (err) {
        console.error('Push event error:', err);
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    if (event.action === 'close') return;

    const urlToOpen = event.notification.data.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
