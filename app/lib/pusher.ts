import Pusher from "pusher";
import PusherClient from "pusher-js";

// Configuration serveur Pusher
export const pusherServer = process.env.PUSHER_APP_ID
  ? new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu",
      useTLS: true,
    })
  : null;

// Configuration client Pusher
export const getPusherClient = () => {
  if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
    return null;
  }

  return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu",
  });
};

// Fonction helper pour trigger un événement
export async function triggerPusherEvent(
  channel: string,
  event: string,
  data: any
) {
  if (!pusherServer) {
    console.warn("Pusher not configured, skipping real-time update");
    return;
  }

  try {
    await pusherServer.trigger(channel, event, data);
  } catch (error) {
    console.error("Error triggering Pusher event:", error);
  }
}
