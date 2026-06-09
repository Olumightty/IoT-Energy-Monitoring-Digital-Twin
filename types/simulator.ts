export type ApplianceType =
  | "fan"
  | "ac"
  | "tv"
  | "light"
  | "fridge"
  | "microwave"
  | "oven"
  | "kettle"
  | "toaster"
  | "dishwasher"
  | "blender"
  | "hood"
  | "speaker"
  | "console"
  | "router"
  | "projector"
  | "purifier"
  | "humidifier"
  | "heater"
  | "washer"
  | "dryer"
  | "charger";
export type ApplianceState = "ON" | "OFF";
export type DeviceState = "ON" | "OFF";

export type TelemetryRange = {
  voltage: [number, number];
  current: [number, number];
  power: [number, number];
  temperature: [number, number];
};

export type TelemetryData = {
  voltage: number;
  current: number;
  power: number;
  temperature: number;
};

export type ApplianceConfig = {
  label: string;
  type: ApplianceType;
  range: TelemetryRange;
};

export type DeviceConfig = {
  id: string;
  label: string;
  room: string;
  appliances: ApplianceConfig[];
  envIndex: number;
};

export type RoomConfig = {
  name: string;
  devices: DeviceConfig[];
};

export type ApplianceRuntime = {
  state: ApplianceState;
  telemetry: TelemetryData;
  lastTelemetryAt?: number;
  lastCommandAt?: number;
};
