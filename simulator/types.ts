import { ApplianceRuntime, DeviceState } from "../types/simulator";

export type DeviceRuntimeMap = Record<string, Record<string, ApplianceRuntime>>;

export type DeviceStatusMap = Record<
  string,
  "connected" | "connecting" | "reconnecting" | "error" | "idle"
>;

export type DeviceStateMap = Record<string, DeviceState>;

export type SimulatorMeta = {
  mqttEnabled: boolean;
  mqttUrl?: string;
  missingDevices: string[];
  anomalyProbability: number;
  deviceIdByLabel: Record<string, string>;
};

export type SimulatorSnapshot = {
  runtime: DeviceRuntimeMap;
  status: DeviceStatusMap;
  deviceStates: DeviceStateMap;
  meta: SimulatorMeta;
  updatedAt: number;
};
