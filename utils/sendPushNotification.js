import fetch from "node-fetch";

export async function sendPushNotification(
  expoPushToken,
  { text, chatroomId }
) {
  if (!expoPushToken || !expoPushToken.startsWith("ExponentPushToken")) {
    console.warn("Invalid Expo Push Token:", expoPushToken);
    return;
  }

  const message = {
    to: expoPushToken,
    sound: "default",
    title: "New Message",
    body: text,
    data: { chatroomId },
  };

  try {
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const result = await res.json();
    console.log("Push notification result:", result);

    if (result?.data?.status === "error") {
      console.error("Expo push error:", result.data.message);
    }
  } catch (error) {
    console.error("Push notification error:", error);
  }
}
