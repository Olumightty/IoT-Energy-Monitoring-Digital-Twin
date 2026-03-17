import { RoomConfig } from "../types/simulator";

const getDeviceId = (index: number, fallback: string) => {
  if (typeof process === "undefined") return fallback;
  return (
    process.env[`DEVICE_${index}_USERNAME`] ??
    process.env[`NEXT_PUBLIC_DEVICE_${index}_USERNAME`] ??
    fallback
  );
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
          {
            label: "fan_1",
            type: "fan",
            range: {
              voltage: [220, 240],
              current: [0.2, 0.4],
              power: [40, 90],
              temperature: [30, 35],
            },
          },
          {
            label: "tv_1",
            type: "tv",
            range: {
              voltage: [220, 240],
              current: [0.3, 0.6],
              power: [70, 140],
              temperature: [28, 34],
            },
          },
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
          {
            label: "light_1",
            type: "light",
            range: {
              voltage: [220, 240],
              current: [0.05, 0.15],
              power: [10, 60],
              temperature: [26, 32],
            },
          },
          {
            label: "fan_2",
            type: "fan",
            range: {
              voltage: [220, 240],
              current: [0.2, 0.4],
              power: [40, 90],
              temperature: [30, 35],
            },
          },
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
          {
            label: "light_2",
            type: "light",
            range: {
              voltage: [220, 240],
              current: [0.05, 0.15],
              power: [10, 60],
              temperature: [26, 32],
            },
          },
          {
            label: "ac_1",
            type: "ac",
            range: {
              voltage: [220, 240],
              current: [4, 8],
              power: [900, 1800],
              temperature: [18, 25],
            },
          },
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
          {
            label: "ac_2",
            type: "ac",
            range: {
              voltage: [220, 240],
              current: [4, 8],
              power: [900, 1800],
              temperature: [18, 25],
            },
          },
          {
            label: "light_3",
            type: "light",
            range: {
              voltage: [220, 240],
              current: [0.05, 0.15],
              power: [10, 60],
              temperature: [26, 32],
            },
          },
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
          {
            label: "fan_3",
            type: "fan",
            range: {
              voltage: [220, 240],
              current: [0.2, 0.4],
              power: [40, 90],
              temperature: [30, 35],
            },
          },
          {
            label: "tv_2",
            type: "tv",
            range: {
              voltage: [220, 240],
              current: [0.3, 0.6],
              power: [70, 140],
              temperature: [28, 34],
            },
          },
        ],
      },
    ],
  },
];

export const allDevices = rooms.flatMap((room) => room.devices);
