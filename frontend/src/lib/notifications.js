export const requestNotificationPermission = () => {
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("🔔 Notification permission granted");
      } else {
        console.warn("🚫 Notification permission denied");
      }
    });
  }
};

// Play a sound for the notification
export const playNotificationSound = () => {
  const audio = new Audio("/text_noti.wav"); // Ensure this file is in /public
  audio.play().catch((err) => {
    console.error("🔇 Notification sound failed to play:", err.message);
  });
};

// Show a native browser notification with optional icon
export const showNotification = (title, body, icon = "/avatar.png") => {
  if (!("Notification" in window)) return;

  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      body,
      icon,
    });

    playNotificationSound();

    // Optional: Handle click on notification
    notification.onclick = () => window.focus(); 
  }
};

// export const requestNotificationPermission = () => {
//   if ("Notification" in window && Notification.permission !== "granted") {
//     Notification.requestPermission().then((permission) => {
//       if (permission === "granted") {
//         console.log("Notification permission granted");
//       }
//     });
//   }
// };

// export const playNotificationSound = () => {
//   const audio = new Audio("/text_noti.wav"); // Make sure this is in /public
//   audio.play().catch((err) => console.error("Notification sound failed:", err));
// };

// export const showNotification = (title, body, icon = "/avatar.png") => {
//   if ("Notification" in window && Notification.permission === "granted") {
//     new Notification(title, {
//       body,
//       icon,
//     });
//     playNotificationSound();
//   }
// };
