import { Expo } from "expo-server-sdk";

// Create a new Expo SDK client
const expo = new Expo();

export const sendPushNotification = async (pushToken, message) => {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error("Invalid Expo push token:", pushToken);
    return;
  }

  const notification = {
    to: pushToken,
    sound: "default",
    title: "New Message",
    body: message.text || "You have a new message",
    data: { chatroomId: message.chatroomId },
  };

  try {
    const tickets = await expo.sendPushNotificationsAsync([notification]);
    console.log("Push notification sent:", tickets);
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};
