import { ApplianceConfig, ApplianceState, TelemetryData } from "../types/simulator";
import { pickOne, randomInRange } from "../utils/random";

const AMBIENT_TEMP: [number, number] = [24, 29];

export const coolTemperature = (previous: number | undefined) => {
  const target = AMBIENT_TEMP[0];
  const current = previous ?? randomInRange(...AMBIENT_TEMP);
  const next = current - randomInRange(0.2, 0.6);
  return Math.max(target, Number(next.toFixed(1)));
};

const spikeMultiplier = (metric: keyof TelemetryData) => {
  if (metric === "temperature") {
    return randomInRange(1.2, 1.6);
  }
  if (metric === "voltage") {
    return randomInRange(1.1, 1.3);
  }
  if (metric === "current") {
    return randomInRange(1.4, 2.2);
  }
  return randomInRange(1.3, 2.0);
};

export const generateTelemetry = (
  appliance: ApplianceConfig,
  state: ApplianceState,
  anomalyProbability: number
): TelemetryData => {
  const voltage = randomInRange(...appliance.range.voltage);
  const baseTemperature = randomInRange(...appliance.range.temperature);

  let telemetry: TelemetryData = {
    voltage,
    current: randomInRange(...appliance.range.current),
    power: randomInRange(...appliance.range.power),
    temperature: baseTemperature,
  };

  if (state === "OFF") {
    telemetry = {
      voltage,
      current: 0,
      power: 0,
      temperature: randomInRange(...AMBIENT_TEMP),
    };
  }

  if (state === "ON" && Math.random() < anomalyProbability) {
    const metric = pickOne(["voltage", "current", "power", "temperature"]);
    const multiplier = spikeMultiplier(metric as keyof TelemetryData);
    telemetry = {
      ...telemetry,
      [metric]: Number((telemetry[metric as keyof TelemetryData] * multiplier).toFixed(2)),
    };
  }

  return {
    ...telemetry,
    voltage: Number(telemetry.voltage.toFixed(1)),
    current: Number(telemetry.current.toFixed(2)),
    power: Number(telemetry.power.toFixed(1)),
    temperature: Number(telemetry.temperature.toFixed(1)),
  };
};
