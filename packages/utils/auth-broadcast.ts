export const AUTH_BROADCAST_CHANNEL_NAME = "sycom-auth-events";

export interface AuthBroadcastMessage {
  type: "signed_in";
}

let channel: BroadcastChannel | null = null;

const isAuthBroadcastMessage = (
  value: unknown
): value is AuthBroadcastMessage => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as { type?: unknown };
  return data.type === "signed_in";
};

const getAuthBroadcastChannel = () => {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
    return null;
  }

  if (!channel) {
    channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL_NAME);
  }

  return channel;
};

export const broadcastAuthEvent = (message: AuthBroadcastMessage) => {
  const authChannel = getAuthBroadcastChannel();
  authChannel?.postMessage(message);
};

export const listenToAuthEvents = (
  callback: (message: AuthBroadcastMessage) => void
) => {
  const authChannel = getAuthBroadcastChannel();

  if (!authChannel) {
    return () => undefined;
  }

  const handleMessage = (event: MessageEvent<unknown>) => {
    if (!isAuthBroadcastMessage(event.data)) {
      return;
    }

    callback(event.data);
  };

  authChannel.addEventListener("message", handleMessage);

  return () => {
    authChannel.removeEventListener("message", handleMessage);
  };
};
