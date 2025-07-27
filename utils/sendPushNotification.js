import { Expo } from "expo-server-sdk";

const expo = new Expo();

export const sendPushNotification = async (pushToken, message) => {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error("Invalid Expo push token:", pushToken);
    return;
  }

  try {
    await expo.sendPushNotificationsAsync([
      {
        to: pushToken,
        sound: "default",
        title: "New Message",
        body: message.text || "You have a new message",
        data: { chatroomId: message.chatroomId },
      },
    ]);
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};
