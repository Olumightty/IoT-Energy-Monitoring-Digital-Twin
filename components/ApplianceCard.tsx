import { ApplianceConfig, ApplianceRuntime } from "../types/simulator";

const iconByType: Record<ApplianceConfig["type"], string> = {
  fan: "fan",
  ac: "ac",
  tv: "tv",
  light: "light",
};

const formatValue = (value: number, unit: string) => `${value.toFixed(1)} ${unit}`;

type Props = {
  appliance: ApplianceConfig;
  runtime: ApplianceRuntime;
  onToggle: () => void;
  disabled: boolean;
};

const now = () => Date.now();

const isRecent = (timestamp?: number, windowMs = 800) =>
  timestamp ? now() - timestamp < windowMs : false;

export const ApplianceCard = ({ appliance, runtime, onToggle, disabled }: Props) => {
  const telemetry = runtime.telemetry;
  const isOn = runtime.state === "ON";
  const telemetryFlash = isRecent(runtime.lastTelemetryAt, 900);
  const commandPulse = isRecent(runtime.lastCommandAt, 900);

  return (
    <div
      className={`appliance-card ${isOn ? "is-on" : "is-off"} ${commandPulse ? "pulse" : ""}`}
    >
      <div className="appliance-header">
        <div className={`appliance-icon ${iconByType[appliance.type]} ${isOn ? "spin" : ""}`}>
          <span className="icon-core" />
        </div>
        <div>
          <p className="appliance-label">{appliance.label}</p>
          <p className="appliance-type">{appliance.type.toUpperCase()}</p>
        </div>
        <button
          type="button"
          className={`toggle ${isOn ? "on" : "off"}`}
          onClick={onToggle}
          disabled={disabled}
          aria-pressed={isOn}
        >
          {isOn ? "ON" : "OFF"}
        </button>
      </div>

      <div className="telemetry-grid">
        <div>
          <span>Voltage</span>
          <strong>{formatValue(telemetry.voltage, "V")}</strong>
        </div>
        <div>
          <span>Current</span>
          <strong>{formatValue(telemetry.current, "A")}</strong>
        </div>
        <div>
          <span>Power</span>
          <strong>{formatValue(telemetry.power, "W")}</strong>
        </div>
        <div>
          <span>Temp</span>
          <strong>{formatValue(telemetry.temperature, "°C")}</strong>
        </div>
      </div>

      <div className="appliance-footer">
        <div className={`led ${telemetryFlash ? "flash" : ""}`} />
        <span className="led-label">Telemetry</span>
        <span className="anomaly-tag normal">Monitoring</span>
      </div>
    </div>
  );
};
