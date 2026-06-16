type Props = {
  anomalyProbability: number;
  onAnomalyChange: (value: number) => void;
  mqttEnabled: boolean;
  mqttUrl?: string;
  missingDevices: string[];
};

export const StatusPanel = ({
  anomalyProbability,
  onAnomalyChange,
  mqttEnabled,
  mqttUrl,
  missingDevices,
}: Props) => {
  return (
    <aside className="status-panel">
      <div className="panel-block">
        <h3>Simulation Controls</h3>
        <p className="panel-subtext">
          Adjust anomaly rate to emulate grid spikes and appliance stress events.
        </p>
        <div className="slider-row">
          <input
            type="range"
            min={0}
            max={10}
            step={0.5}
            value={anomalyProbability * 100}
            onChange={(event) => onAnomalyChange(Number(event.target.value) / 100)}
          />
          <span>{(anomalyProbability * 100).toFixed(1)}%</span>
        </div>
      </div>
      <div className="panel-block">
        <h3>MQTT Connectivity</h3>
        <p className="panel-subtext">
          {mqttEnabled
            ? `Publishing to ${mqttUrl}`
            : "MQTT disabled (missing MQTT URL)."}
        </p>
        {missingDevices.length > 0 && (
          <div className="warning-box">
            <p>Missing device credentials:</p>
            <ul>
              {missingDevices.map((deviceId) => (
                <li key={deviceId}>{deviceId}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="panel-block">
        <h3>Telemetry cadence</h3>
        <p className="panel-subtext">Publishing every 10 seconds per appliance.</p>
        <div className="cadence-pill">10s interval</div>
      </div>
    </aside>
  );
};
