"use client";

import { useEffect, useMemo, useState } from "react";
import { rooms, allDevices } from "../devices/deviceCatalog";
import { buildInitialRuntime } from "../simulator/runtime";
import {
  DeviceRuntimeMap,
  DeviceStateMap,
  DeviceStatusMap,
  SimulatorMeta,
} from "../simulator/types";
import { HouseVisualizer } from "../components/HouseVisualizer";
import { StatusPanel } from "../components/StatusPanel";

const defaultMeta: SimulatorMeta = {
  mqttEnabled: false,
  mqttUrl: "",
  missingDevices: [],
  anomalyProbability: 0.02,
  deviceIdByLabel: {},
};

export default function Home() {
  const [anomalyProbability, setAnomalyProbability] = useState(
    defaultMeta.anomalyProbability
  );
  const [runtime, setRuntime] = useState<DeviceRuntimeMap>(() =>
    buildInitialRuntime(allDevices, defaultMeta.anomalyProbability)
  );
  const [deviceStates, setDeviceStates] = useState<DeviceStateMap>(() =>
    allDevices.reduce<DeviceStateMap>((acc, device) => {
      acc[device.id] = "ON";
      return acc;
    }, {})
  );
  const [status, setStatus] = useState<DeviceStatusMap>({});
  const [meta, setMeta] = useState<SimulatorMeta>(defaultMeta);
  const [activeRoom, setActiveRoom] = useState(rooms[0]?.name ?? "");

  useEffect(() => {
    const source = new EventSource("/api/stream");

    source.onmessage = (event) => {
      try {
        const snapshot = JSON.parse(event.data) as {
          runtime: DeviceRuntimeMap;
          status: DeviceStatusMap;
          deviceStates: DeviceStateMap;
          meta: SimulatorMeta;
        };

        setRuntime(snapshot.runtime);
        setStatus(snapshot.status);
        setDeviceStates(snapshot.deviceStates);
        setMeta(snapshot.meta);
        setAnomalyProbability(snapshot.meta.anomalyProbability);
      } catch {
        // Ignore malformed events.
      }
    };

    return () => source.close();
  }, []);


  const totals = useMemo(() => {
    return {
      devices: allDevices.length,
      appliances: allDevices.reduce(
        (total, device) => total + device.appliances.length,
        0
      ),
      rooms: rooms.length,
    };
  }, []);

  const handleAnomalyChange = (value: number) => {
    setAnomalyProbability(value);
    fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anomalyProbability: value }),
    }).catch(() => undefined);
  };

  const handleToggleDevice = (deviceLabel: string) => {
    const resolvedId = meta.deviceIdByLabel[deviceLabel];
    const currentState = resolvedId ? deviceStates[resolvedId] : "ON";
    const nextState = currentState === "ON" ? "OFF" : "ON";

    fetch("/api/control", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target: "device",
        deviceLabel,
        state: nextState,
      }),
    }).catch(() => undefined);
  };

  const handleToggleAppliance = (deviceLabel: string, applianceLabel: string) => {
    const resolvedId = meta.deviceIdByLabel[deviceLabel];
    if (!resolvedId) return;
    if (deviceStates[resolvedId] === "OFF") return;

    const current = runtime[resolvedId]?.[applianceLabel];
    const nextState = current?.state === "ON" ? "OFF" : "ON";

    fetch("/api/control", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target: "appliance",
        deviceLabel,
        applianceLabel,
        state: nextState,
      }),
    }).catch(() => undefined);
  };


  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="hero-eyebrow">Smart Home Energy Fleet Simulator</p>
          <h1>Live Appliance Telemetry, Command Control, and Device Fleet Health</h1>
          <p className="hero-subtitle">
            Each room contains a dedicated IoT device that publishes telemetry every
            10 seconds and reacts instantly to MQTT control commands.
          </p>
        </div>
        <div className="hero-stats">
          <div>
            <span>Devices</span>
            <strong>{totals.devices}</strong>
          </div>
          <div>
            <span>Appliances</span>
            <strong>{totals.appliances}</strong>
          </div>
          <div>
            <span>Rooms</span>
            <strong>{totals.rooms}</strong>
          </div>
        </div>
      </header>

      <div className="content">
        <StatusPanel
          anomalyProbability={anomalyProbability}
          onAnomalyChange={handleAnomalyChange}
          mqttEnabled={meta.mqttEnabled}
          mqttUrl={meta.mqttUrl}
          missingDevices={meta.missingDevices}
        />
        <HouseVisualizer
          rooms={rooms}
          runtime={runtime}
          status={status}
          deviceStates={deviceStates ?? {}}
          deviceIdByLabel={meta.deviceIdByLabel ?? {}}
          activeRoom={activeRoom}
          onSelectRoom={setActiveRoom}
          onToggleDevice={handleToggleDevice}
          onToggleAppliance={handleToggleAppliance}
        />
      </div>
    </div>
  );
}
