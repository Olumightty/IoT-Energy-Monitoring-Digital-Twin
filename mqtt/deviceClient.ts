import mqtt, { MqttClient } from "mqtt";

export type DeviceConnectionConfig = {
  deviceId: string;
  url?: string;
  port?: number;
  username?: string;
  password?: string;
};

const normalizeUrl = (url?: string, port?: number) => {
  if (!url) return undefined;
  if (url.startsWith("ws://") || url.startsWith("wss://")) {
    return url;
  }
  const safePort = port ?? 8083;
  return `ws://${url.replace(/\/$/, "")}:${safePort}`;
};

export const createDeviceClient = (
  config: DeviceConnectionConfig
): MqttClient | null => {
  const fullUrl = normalizeUrl(config.url, config.port);
  if (!fullUrl || !config.username || !config.password) {
    return null;
  }

  return mqtt.connect(fullUrl, {
    username: config.username,
    password: config.password,
    clientId: `${config.deviceId}-${Math.random().toString(16).slice(2, 10)}`,
    clean: true,
    reconnectPeriod: 2000,
  });
};
