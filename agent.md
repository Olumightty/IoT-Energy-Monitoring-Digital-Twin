# AGENT.md

## Energy Fleet Simulation Agent Specification

### Project Overview

This project is a **simulation client** for an energy monitoring SaaS platform.

The simulator represents a **fleet of appliances connected to multiple IoT devices (microcontrollers)** located in different rooms of a house. Each device connects to the SaaS platform via **MQTT** and simulates telemetry data for the appliances attached to it.

The simulator is built using:

* **Next.js v16.1.6**
* **MQTT.js v5.15.0**
* Modern frontend visualization and animation

The goal is to **visually simulate a smart home energy monitoring environment** where devices publish telemetry and react to control commands.

---

# Architecture

## User Context

All simulated devices belong to **a single user account** that already exists on the SaaS platform.

The devices and appliances are already **paired on the platform beforehand**.

The simulator simply connects the devices and begins publishing telemetry.

---

# Device Model

Each **device represents a microcontroller** installed in a specific location in a house.

Example locations:

* Kitchen
* Living Room
* Master Bedroom
* Dining Room
* Children's Bedroom

Each device contains **multiple appliances**.

---

# Appliance Model

Appliances are uniquely identified by **appliance_label**.

Examples:

* `fan_1`
* `ac_1`
* `tv_1`
* `light_1`

Rules:

* Appliance labels are **unique per device**
* A device **cannot contain two appliances with the same label**

---

# MQTT Connection

Each device **creates its own MQTT client instance**.

Connection credentials are stored in `.env`.

Required variables:

```
MQTT_URL=
MQTT_PORT=
DEVICE_1_USERNAME=
DEVICE_1_PASSWORD=
DEVICE_2_USERNAME=
DEVICE_2_PASSWORD=
...
```

Each device must authenticate using its **own username and password**.

Use the **mqtt library** for connections.

---

# MQTT Topic Structure

## Control Command Subscription

Each device must subscribe to:

```
cmd/device_id/+/state
```

Example:

```
cmd/device_1/fan_1/state
```

Command Payload:

```
{
  "pattern": "cmnd/device_id/appliance_label/state",
  "data": {
    "state": "ON" | "OFF"
  }
}
```

Behavior:

When a command is received:

1. Extract `appliance_label`
2. Update internal appliance state
3. Trigger UI animation
4. Adjust telemetry values accordingly

Example:

* If `state = OFF` → power and current drop to `0`
* If `state = ON` → telemetry resumes

---

# Telemetry Publishing

Each appliance publishes telemetry every **10 seconds**.

Topic:

```
energy/device_id/appliance_label/telemetry
```

Payload format:

```
{
  "voltage": number,
  "current": number,
  "power": number,
  "temperature": number
}
```

Units:

* Voltage → volts
* Current → amperes
* Power → watts
* Temperature → °C

Example:

```
energy/device_1/fan_1/telemetry
```

Example payload:

```
{
  "voltage": 230,
  "current": 0.35,
  "power": 80,
  "temperature": 32
}
```

---

# Telemetry Behavior

Telemetry should simulate **realistic appliance behavior**.

Example ranges:

Fan

* voltage: 220–240
* current: 0.2–0.4
* power: 40–90
* temperature: 30–35

Air Conditioner

* voltage: 220–240
* current: 4–8
* power: 900–1800
* temperature: 18–25

Light

* current: 0.05–0.15
* power: 10–60

When appliance state is `OFF`:

```
current = 0
power = 0
```

---

# Abnormal behaviour (Random spikes)
The system simulates real-time electrical telemetry with occasional anomalies to mimic real-world grid behaviour.
The simulator randomly injects spikes to emulate faults such as:

- Voltage surge
- Current overload
- Power spike
- Temperature rise

These anomalies occur with a probability (e.g., 1–3%) during each measurement interval which I can be able to dynamically set that probability on the app.

# Frontend Visualization

The UI must represent a **house sectional plan**.

Layout:

```
 ---------------------------------
| Living Room | Kitchen          |
|-------------|------------------|
| Dining Room | Master Bedroom   |
|-------------|------------------|
| Children's Bedroom             |
 ---------------------------------
```

Each room contains **devices and appliances**.

---

# Appliance Animations

Appliances must visually react to telemetry and commands.

Examples:

Fan

* spinning animation when ON

AC

* airflow pulse animation

Light

* glowing light effect

Telemetry send

* LED flash indicator

Command received

* brief pulse animation

---

# UI Design

Design requirements:

* **Single Page Application**
* Bright engaging colors
* Modern smart-home dashboard style
* Smooth animations
* Responsive layout

Use:

* clean icons
* soft gradients
* subtle device LED indicators
* third-party ui libraries and icon packages as required

Possible UI elements:

* appliance cards
* real-time telemetry gauges
* animated appliance icons

---

# Simulation Timing

Telemetry publishing interval:

```
10 seconds
```

All appliances should publish concurrently using timers.

---

# Code Organization

Suggested structure:

```
/app
/components
/devices
/mqtt
/simulator
/types
/utils
```

Important modules:

DeviceManager
Creates device MQTT clients.

TelemetryEngine
Generates appliance telemetry.

CommandHandler
Handles incoming MQTT commands.

HouseVisualizer
Renders the house layout.

---

# Simulator Behavior

Startup flow:

1. Load `.env`
2. Initialize device list
3. Connect MQTT clients
4. Subscribe to command topics
5. Start telemetry loop
6. Render house UI
7. Update animations based on state

---

# Important Rules

The simulator must:

* Support multiple devices
* Maintain appliance state
* React to MQTT commands
* Publish telemetry continuously
* Visually reflect appliance activity

---

# Goal

The simulator should look and behave like a **live smart-home energy monitoring environment** connected to the SaaS platform.

The system should demonstrate:

* Real-time telemetry
* Command control
* Device fleet monitoring
* Appliance state visualization
