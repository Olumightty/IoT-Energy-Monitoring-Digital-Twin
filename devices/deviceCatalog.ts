import { RoomConfig, TelemetryRange } from "../types/simulator";

const getDeviceId = (index: number, fallback: string) => {
  if (typeof process === "undefined") return fallback;
  return (
    process.env[`DEVICE_${index}_USERNAME`] ??
    process.env[`NEXT_PUBLIC_DEVICE_${index}_USERNAME`] ??
    fallback
  );
};

const ranges: Record<string, TelemetryRange> = {
  fan: { voltage: [220, 240], current: [0.2, 0.5], power: [40, 100], temperature: [30, 36] },
  tv: { voltage: [220, 240], current: [0.3, 0.7], power: [70, 160], temperature: [28, 36] },
  light: { voltage: [220, 240], current: [0.05, 0.2], power: [8, 70], temperature: [26, 34] },
  ac: { voltage: [220, 240], current: [4, 8], power: [900, 1800], temperature: [18, 25] },
  speaker: { voltage: [220, 240], current: [0.05, 0.2], power: [10, 60], temperature: [27, 33] },
  console: { voltage: [220, 240], current: [0.6, 1.6], power: [120, 250], temperature: [35, 50] },
  router: { voltage: [220, 240], current: [0.05, 0.15], power: [5, 15], temperature: [30, 40] },
  projector: { voltage: [220, 240], current: [1, 2.5], power: [200, 450], temperature: [40, 55] },
  purifier: { voltage: [220, 240], current: [0.2, 0.6], power: [30, 120], temperature: [28, 35] },
  humidifier: { voltage: [220, 240], current: [0.15, 0.4], power: [20, 60], temperature: [26, 34] },
  charger: { voltage: [220, 240], current: [0.05, 0.2], power: [5, 30], temperature: [25, 33] },
  fridge: { voltage: [220, 240], current: [0.8, 1.5], power: [100, 300], temperature: [2, 8] },
  microwave: { voltage: [220, 240], current: [4, 8], power: [800, 1500], temperature: [40, 80] },
  oven: { voltage: [220, 240], current: [8, 12], power: [1500, 3000], temperature: [80, 200] },
  kettle: { voltage: [220, 240], current: [6, 10], power: [1200, 2200], temperature: [60, 95] },
  toaster: { voltage: [220, 240], current: [3, 6], power: [600, 1200], temperature: [40, 80] },
  dishwasher: { voltage: [220, 240], current: [1, 2.5], power: [200, 900], temperature: [30, 70] },
  blender: { voltage: [220, 240], current: [0.5, 1], power: [200, 600], temperature: [30, 45] },
  hood: { voltage: [220, 240], current: [0.3, 0.7], power: [60, 200], temperature: [28, 40] },
  heater: { voltage: [220, 240], current: [5, 9], power: [1000, 2000], temperature: [35, 70] },
  washer: { voltage: [220, 240], current: [1, 2.5], power: [200, 800], temperature: [25, 45] },
  dryer: { voltage: [220, 240], current: [4, 8], power: [1000, 2500], temperature: [40, 75] },
};

export const rooms: RoomConfig[] = [
  {
    name: "Living Room",
    devices: [
      {
        id: getDeviceId(1, "device_1"),
        label: "device_1",
        room: "Living Room",
        envIndex: 1,
        appliances: [
          { label: "fan_1", type: "fan", range: ranges.fan },
          { label: "tv_1", type: "tv", range: ranges.tv },
          { label: "light_1", type: "light", range: ranges.light },
          { label: "speaker_1", type: "speaker", range: ranges.speaker },
          { label: "console_1", type: "console", range: ranges.console },
          { label: "router_1", type: "router", range: ranges.router },
          { label: "projector_1", type: "projector", range: ranges.projector },
          { label: "purifier_1", type: "purifier", range: ranges.purifier },
          { label: "lamp_1", type: "light", range: ranges.light },
          { label: "humidifier_1", type: "humidifier", range: ranges.humidifier },
          { label: "charger_1", type: "charger", range: ranges.charger },
        ],
      },
    ],
  },
  {
    name: "Kitchen",
    devices: [
      {
        id: getDeviceId(2, "device_2"),
        label: "device_2",
        room: "Kitchen",
        envIndex: 2,
        appliances: [
          { label: "fridge_1", type: "fridge", range: ranges.fridge },
          { label: "microwave_1", type: "microwave", range: ranges.microwave },
          { label: "oven_1", type: "oven", range: ranges.oven },
          { label: "kettle_1", type: "kettle", range: ranges.kettle },
          { label: "toaster_1", type: "toaster", range: ranges.toaster },
          { label: "dishwasher_1", type: "dishwasher", range: ranges.dishwasher },
          { label: "blender_1", type: "blender", range: ranges.blender },
          { label: "hood_1", type: "hood", range: ranges.hood },
          { label: "light_2", type: "light", range: ranges.light },
          { label: "fan_2", type: "fan", range: ranges.fan },
          { label: "washer_1", type: "washer", range: ranges.washer },
        ],
      },
    ],
  },
  {
    name: "Dining Room",
    devices: [
      {
        id: getDeviceId(3, "device_3"),
        label: "device_3",
        room: "Dining Room",
        envIndex: 3,
        appliances: [
          { label: "light_3", type: "light", range: ranges.light },
          { label: "ac_1", type: "ac", range: ranges.ac },
          { label: "fan_3", type: "fan", range: ranges.fan },
          { label: "speaker_2", type: "speaker", range: ranges.speaker },
          { label: "heater_1", type: "heater", range: ranges.heater },
          { label: "purifier_2", type: "purifier", range: ranges.purifier },
          { label: "projector_2", type: "projector", range: ranges.projector },
          { label: "console_2", type: "console", range: ranges.console },
          { label: "router_2", type: "router", range: ranges.router },
          { label: "chandelier_1", type: "light", range: ranges.light },
          { label: "tv_2", type: "tv", range: ranges.tv },
        ],
      },
    ],
  },
  {
    name: "Master Bedroom",
    devices: [
      {
        id: getDeviceId(4, "device_4"),
        label: "device_4",
        room: "Master Bedroom",
        envIndex: 4,
        appliances: [
          { label: "ac_2", type: "ac", range: ranges.ac },
          { label: "light_4", type: "light", range: ranges.light },
          { label: "fan_4", type: "fan", range: ranges.fan },
          { label: "tv_3", type: "tv", range: ranges.tv },
          { label: "heater_2", type: "heater", range: ranges.heater },
          { label: "humidifier_2", type: "humidifier", range: ranges.humidifier },
          { label: "purifier_3", type: "purifier", range: ranges.purifier },
          { label: "speaker_3", type: "speaker", range: ranges.speaker },
          { label: "charger_2", type: "charger", range: ranges.charger },
          { label: "lamp_2", type: "light", range: ranges.light },
          { label: "projector_3", type: "projector", range: ranges.projector },
        ],
      },
    ],
  },
  {
    name: "Children's Bedroom",
    devices: [
      {
        id: getDeviceId(5, "device_5"),
        label: "device_5",
        room: "Children's Bedroom",
        envIndex: 5,
        appliances: [
          { label: "fan_5", type: "fan", range: ranges.fan },
          { label: "tv_4", type: "tv", range: ranges.tv },
          { label: "light_5", type: "light", range: ranges.light },
          { label: "night_light_1", type: "light", range: ranges.light },
          { label: "console_3", type: "console", range: ranges.console },
          { label: "speaker_4", type: "speaker", range: ranges.speaker },
          { label: "humidifier_3", type: "humidifier", range: ranges.humidifier },
          { label: "purifier_4", type: "purifier", range: ranges.purifier },
          { label: "charger_3", type: "charger", range: ranges.charger },
          { label: "projector_4", type: "projector", range: ranges.projector },
          { label: "router_3", type: "router", range: ranges.router },
        ],
      },
    ],
  },
];

export const allDevices = rooms.flatMap((room) => room.devices);
