import { allDevices } from "../devices/deviceCatalog";
import { buildInitialRuntime } from "./runtime";
import { coolTemperature, generateTelemetry } from "./telemetryEngine";
import { DeviceRuntimeMap, DeviceStateMap, DeviceStatusMap, SimulatorMeta, SimulatorSnapshot } from "./types";
import { ApplianceState, DeviceState } from "../types/simulator";
import { randomInRange } from "../utils/random";
import mqtt, { MqttClient } from "mqtt";

const TELEMETRY_INTERVAL_MS = 10000;

type Listener = (snapshot: SimulatorSnapshot) => void;

type SimulatorState = {
  runtime: DeviceRuntimeMap;
  deviceStates: DeviceStateMap;
  status: DeviceStatusMap;
  meta: SimulatorMeta;
  clients: Record<string, MqttClient | null>;
  listeners: Set<Listener>;
  interval?: NodeJS.Timeout;
  started: boolean;
};

const getEnv = (key: string) => process.env[key];

const normalizeMqttUrl = (url?: string, port?: number) => {
  if (!url) return undefined;
  if (url.startsWith("mqtt://") || url.startsWith("mqtts://")) {
    return url;
  }
  const cleaned = url.replace(/\/$/, "");
  if (cleaned.includes(":")) {
    return `mqtt://${cleaned}`;
  }
  const safePort = port ?? 1883;
  return `mqtt://${cleaned}:${safePort}`;
};

const getDeviceCredentials = (index: number) => {
  const username = getEnv(`DEVICE_${index}_USERNAME`);
  const password = getEnv(`DEVICE_${index}_PASSWORD`);
  return { username, password };
};

const buildMeta = (state: SimulatorState): SimulatorMeta => {
  const mqttUrl = getEnv("MQTT_URL") ?? "";
  const missingDevices = allDevices
    .filter((device) => {
      const creds = getDeviceCredentials(device.envIndex);
      return !creds.username || !creds.password;
    })
    .map((device) => device.label);
  const deviceIdByLabel = allDevices.reduce<Record<string, string>>((acc, device) => {
    acc[device.label] = device.id;
    return acc;
  }, {});

  return {
    mqttUrl,
    mqttEnabled: Boolean(mqttUrl),
    missingDevices,
    anomalyProbability: state.meta.anomalyProbability,
    deviceIdByLabel,
  };
};

const createInitialState = (): SimulatorState => {
  const initialProbability = Number(getEnv("ANOMALY_PROBABILITY") ?? 0.02);
  const runtime = buildInitialRuntime(allDevices, initialProbability);
  const deviceStates = allDevices.reduce<DeviceStateMap>((acc, device) => {
    acc[device.id] = "ON";
    return acc;
  }, {});
  return {
    runtime,
    deviceStates,
    status: {},
    meta: {
      mqttUrl: getEnv("MQTT_URL") ?? "",
      mqttEnabled: Boolean(getEnv("MQTT_URL")),
      missingDevices: [],
      anomalyProbability: initialProbability,
      deviceIdByLabel: {},
    },
    clients: {},
    listeners: new Set(),
    started: false,
  };
};

const ensureState = () => {
  const globalKey = "__energySimulatorState" as const;
  const globalAny = globalThis as typeof globalThis & {
    [globalKey]?: SimulatorState;
  };

  if (!globalAny[globalKey]) {
    globalAny[globalKey] = createInitialState();
  }
  return globalAny[globalKey]!;
};

const broadcast = (state: SimulatorState) => {
  const snapshot: SimulatorSnapshot = {
    runtime: state.runtime,
    status: state.status,
    deviceStates: state.deviceStates,
    meta: buildMeta(state),
    updatedAt: Date.now(),
  };
  state.listeners.forEach((listener) => listener(snapshot));
};

const attachClientHandlers = (
  state: SimulatorState,
  deviceId: string,
  topicDeviceId: string,
  client: MqttClient
) => {
  client.on("connect", () => {
    state.status = { ...state.status, [deviceId]: "connected" };
    client.subscribe(`cmnd/${topicDeviceId}/+/state`);
    broadcast(state);
  });

  client.on("reconnect", () => {
    state.status = { ...state.status, [deviceId]: "reconnecting" };
    broadcast(state);
  });

  client.on("close", () => {
    state.status = { ...state.status, [deviceId]: "idle" };
    broadcast(state);
  });

  client.on("error", () => {
    state.status = { ...state.status, [deviceId]: "error" };
    broadcast(state);
  });

  client.on("message", (topic, payload) => {
    const parts = topic.split("/");
    if (parts.length < 4) return;
    const applianceLabel = parts[2];
    let desiredState: ApplianceState | undefined;

    try {
      const body = JSON.parse(payload.toString());
      desiredState = body?.data?.state ?? body?.state;
    } catch {
      desiredState = undefined;
    }

    if (desiredState !== "ON" && desiredState !== "OFF") return;

    if (state.deviceStates[deviceId] === "OFF") return;

    const device = allDevices.find((item) => item.id === deviceId);
    if (!device) return;

    const applianceConfig = device.appliances.find(
      (item) => item.label === applianceLabel
    );
    if (!applianceConfig) return;

    const currentDeviceRuntime = state.runtime[deviceId];
    const currentApplianceRuntime = currentDeviceRuntime?.[applianceLabel];
    if (!currentApplianceRuntime) return;

    const nextTelemetry =
      desiredState === "ON"
        ? generateTelemetry(applianceConfig, desiredState, state.meta.anomalyProbability)
        : {
            voltage: randomInRange(...applianceConfig.range.voltage),
            current: 0,
            power: 0,
            temperature: coolTemperature(currentApplianceRuntime.telemetry.temperature),
          };

    state.runtime = {
      ...state.runtime,
      [deviceId]: {
        ...currentDeviceRuntime,
        [applianceLabel]: {
          ...currentApplianceRuntime,
          state: desiredState,
          telemetry: nextTelemetry,
          lastCommandAt: Date.now(),
        },
      },
    };

    broadcast(state);
  });
};

const startTelemetryLoop = (state: SimulatorState) => {
  if (state.interval) return;

  state.interval = setInterval(() => {
    const timestamp = Date.now();
    const nextRuntime: DeviceRuntimeMap = {};

    allDevices.forEach((device) => {
      const deviceState = state.deviceStates[device.id] ?? "ON";
      nextRuntime[device.id] = {};
      device.appliances.forEach((appliance) => {
        const currentRuntime = state.runtime[device.id][appliance.label];
        if (deviceState === "OFF") {
          nextRuntime[device.id][appliance.label] = {
            ...currentRuntime,
            state: "OFF",
            telemetry: { voltage: 0, current: 0, power: 0, temperature: 0 },
          };
          return;
        }

        const telemetry =
          currentRuntime.state === "ON"
            ? generateTelemetry(appliance, currentRuntime.state, state.meta.anomalyProbability)
            : {
                voltage: randomInRange(...appliance.range.voltage),
                current: 0,
                power: 0,
                temperature: coolTemperature(currentRuntime.telemetry.temperature),
              };

        nextRuntime[device.id][appliance.label] = {
          ...currentRuntime,
          telemetry,
          lastTelemetryAt: timestamp,
        };

        const client = state.clients[device.id];
        if (client && client.connected) {
          const payload = JSON.stringify({
            voltage: telemetry.voltage,
            current: telemetry.current,
            power: telemetry.power,
            temperature: telemetry.temperature,
          });
          client.publish(`energy/${device.id}/${appliance.label}/telemetry`, payload);
        }
      });
    });

    state.runtime = nextRuntime;
    broadcast(state);
  }, TELEMETRY_INTERVAL_MS);
};

const startMqttClients = (state: SimulatorState) => {
  const mqttUrl = getEnv("MQTT_URL") ?? "";
  const portValue = getEnv("MQTT_PORT");
  const port = portValue ? Number(portValue) : undefined;
  const fullUrl = normalizeMqttUrl(mqttUrl, port);

  allDevices.forEach((device) => {
    const { username, password } = getDeviceCredentials(device.envIndex);
    const topicDeviceId = username ?? device.id;
    if (!fullUrl || !username || !password) {
      state.status = { ...state.status, [device.id]: "idle" };
      state.clients[device.id] = null;
      return;
    }

    state.status = { ...state.status, [device.id]: "connecting" };
    const client = mqtt.connect(fullUrl, {
      username,
      password,
      ca: getEnv("MQTT_CERT") || undefined,
      cert: getEnv("MQTT_CERT"),
      clientId: `${device.id}-${Math.random().toString(16).slice(2, 10)}`,
      clean: true,
      reconnectPeriod: 2000,
    });

    state.clients[device.id] = client;
    attachClientHandlers(state, device.id, topicDeviceId, client);
  });
};

export const getSimulator = () => {
  const state = ensureState();
  if (!state.started) {
    state.started = true;
    startMqttClients(state);
    startTelemetryLoop(state);
    broadcast(state);
  }

  return {
    getSnapshot: () => ({
      runtime: state.runtime,
      status: state.status,
      deviceStates: state.deviceStates,
      meta: buildMeta(state),
      updatedAt: Date.now(),
    }),
    subscribe: (listener: Listener) => {
      state.listeners.add(listener);
      listener({
        runtime: state.runtime,
        status: state.status,
        deviceStates: state.deviceStates,
        meta: buildMeta(state),
        updatedAt: Date.now(),
      });
      return () => state.listeners.delete(listener);
    },
    setDeviceState: (deviceLabel: string, nextState: DeviceState) => {
      const device = allDevices.find((item) => item.label === deviceLabel);
      if (!device) return;

      state.deviceStates = { ...state.deviceStates, [device.id]: nextState };
      const nextRuntime: DeviceRuntimeMap = { ...state.runtime };

      nextRuntime[device.id] = { ...nextRuntime[device.id] };
      device.appliances.forEach((appliance) => {
        const current = nextRuntime[device.id][appliance.label];
        nextRuntime[device.id][appliance.label] = {
          ...current,
          state: "OFF",
          telemetry:
            nextState === "OFF"
              ? { voltage: 0, current: 0, power: 0, temperature: 0 }
              : {
                  voltage: randomInRange(...appliance.range.voltage),
                  current: 0,
                  power: 0,
                  temperature: coolTemperature(current.telemetry.temperature),
                },
          lastCommandAt: Date.now(),
        };
      });

      state.runtime = nextRuntime;
      broadcast(state);
    },
    setApplianceState: (
      deviceLabel: string,
      applianceLabel: string,
      nextState: ApplianceState
    ) => {
      const device = allDevices.find((item) => item.label === deviceLabel);
      if (!device) return;
      if (state.deviceStates[device.id] === "OFF") return;

      const appliance = device.appliances.find((item) => item.label === applianceLabel);
      if (!appliance) return;

      const currentDeviceRuntime = state.runtime[device.id];
      const currentApplianceRuntime = currentDeviceRuntime?.[appliance.label];
      if (!currentApplianceRuntime) return;

      const nextTelemetry =
        nextState === "ON"
          ? generateTelemetry(appliance, nextState, state.meta.anomalyProbability)
          : {
              voltage: randomInRange(...appliance.range.voltage),
              current: 0,
              power: 0,
              temperature: coolTemperature(currentApplianceRuntime.telemetry.temperature),
            };

      state.runtime = {
        ...state.runtime,
        [device.id]: {
          ...currentDeviceRuntime,
          [appliance.label]: {
            ...currentApplianceRuntime,
            state: nextState,
            telemetry: nextTelemetry,
            lastCommandAt: Date.now(),
          },
        },
      };
      broadcast(state);
    },
    updateAnomalyProbability: (value: number) => {
      state.meta = { ...state.meta, anomalyProbability: value };
      broadcast(state);
    },
  };
};
