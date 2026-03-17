export const env = (key: string) => {
  if (typeof process === "undefined") return undefined;
  return process.env[key] ?? process.env[`NEXT_PUBLIC_${key}`];
};

export const envPublic = (key: string) => {
  if (typeof process === "undefined") return undefined;
  return process.env[`NEXT_PUBLIC_${key}`];
};
