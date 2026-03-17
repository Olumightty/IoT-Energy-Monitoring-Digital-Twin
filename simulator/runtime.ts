import { DeviceConfig, ApplianceRuntime } from "../types/simulator";
import { generateTelemetry } from "./telemetryEngine";

export const buildInitialRuntime = (
  devices: DeviceConfig[],
  anomalyProbability: number
) => {
  const runtime: Record<string, Record<string, ApplianceRuntime>> = {};

  devices.forEach((device) => {
    runtime[device.id] = {};
    device.appliances.forEach((appliance) => {
      runtime[device.id][appliance.label] = {
        state: "ON",
        telemetry: generateTelemetry(appliance, "ON", anomalyProbability),
        lastTelemetryAt: Date.now(),
      };
    });
  });

  return runtime;
};
