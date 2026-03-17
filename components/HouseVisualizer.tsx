import { RoomConfig } from "../types/simulator";
import { ApplianceCard } from "./ApplianceCard";
import { DeviceRuntimeMap, DeviceStateMap, DeviceStatusMap } from "../simulator/types";

type Props = {
  rooms: RoomConfig[];
  runtime: DeviceRuntimeMap;
  status: DeviceStatusMap;
  deviceStates: DeviceStateMap;
  deviceIdByLabel: Record<string, string>;
  onToggleDevice: (deviceLabel: string) => void;
  onToggleAppliance: (deviceLabel: string, applianceLabel: string) => void;
};

const areaMap: Record<string, string> = {
  "Living Room": "living",
  Kitchen: "kitchen",
  "Dining Room": "dining",
  "Master Bedroom": "master",
  "Children's Bedroom": "children",
};

export const HouseVisualizer = ({
  rooms,
  runtime,
  status,
  deviceStates = {},
  deviceIdByLabel = {},
  onToggleDevice,
  onToggleAppliance,
}: Props) => {
  const fallbackRuntime = {
    state: "OFF",
    telemetry: { voltage: 0, current: 0, power: 0, temperature: 0 },
  } as const;

  return (
    <div className="house-grid">
      {rooms.map((room) => (
        <section
          key={room.name}
          className="room"
          style={{ gridArea: areaMap[room.name] ?? "auto" }}
        >
          <header className="room-header">
            <div>
              <h2>{room.name}</h2>
              <p>{room.devices.length} device(s)</p>
            </div>
          </header>
          <div className="device-stack">
            {room.devices.map((device) => {
              const resolvedDeviceId = deviceIdByLabel[device.label] ?? device.id;
              const deviceState = deviceStates[resolvedDeviceId] ?? "ON";

              return (
                <div key={device.label} className="device-card">
                  <div className="device-header">
                    <div>
                      <p className="device-label">{device.label}</p>
                      <span
                        className={`device-status ${status[resolvedDeviceId] ?? "idle"}`}
                      >
                        {status[resolvedDeviceId] ?? "idle"}
                      </span>
                    </div>
                    <div className="device-meta">
                      <span>{device.appliances.length} appliances</span>
                      <div className="device-toggle">
                        <button
                          type="button"
                          className={`toggle ${deviceState === "ON" ? "on" : "off"}`}
                          onClick={() => onToggleDevice(device.label)}
                          aria-pressed={deviceState === "ON"}
                        >
                          {deviceState}
                        </button>
                        <span className="device-chip">MQTT</span>
                      </div>
                    </div>
                  </div>
                  <div className="appliance-list">
                    {device.appliances.map((appliance) => (
                      <ApplianceCard
                        key={`${device.label}-${appliance.label}`}
                        appliance={appliance}
                        runtime={
                          runtime[resolvedDeviceId]?.[appliance.label] ?? fallbackRuntime
                        }
                        onToggle={() => onToggleAppliance(device.label, appliance.label)}
                        disabled={deviceState === "OFF"}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};
