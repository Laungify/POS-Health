import React, { useEffect, useState } from 'react'
import OneSignal from 'react-onesignal'
import { SendTag, GetTags } from 'react-onesignal'

const Notification = () => {
    const [initialized, setInitialized] = useState(false);
    const [notificationData, setNotificationData] = useState(null);


    useEffect(() => {
        const initOneSignal = async () => {
            await OneSignal.init({
                appId: '85d145bc-b7f1-49b7-b66a-1aea02cd9428',
                allowPermissionPrompt: true,
            });

            // Get user tags (optional for identifying users)
            GetTags()
                .then((tags) => console.log('User tags:', tags))
                .catch((error) => console.error('Error getting tags:', error));

            // Function to handle order received notification
            const handleOrderReceived = (notification) => {
                console.log('Order received notification:', notification);
                setNotificationData(notification.payload.contents.en);
                alert('New Notification: ' + notification);
            };

            OneSignal.on('notificationReceived', handleOrderReceived);

            setInitialized(true);
            return () => OneSignal.off('notificationReceived', handleOrderReceived);
        };

        if (!initialized) {
            initOneSignal();
        }

    }, []);

    return (
        <div>
            {notificationData && (
                <p>
                    {notificationData}
                </p>
            )}

        </div>
    );
};

export default Notification;
