import { getSimulator } from "../../../simulator/serverSimulator";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ ok: false }, { status: 400 });

  const simulator = getSimulator();

  if (body.target === "device") {
    simulator.setDeviceState(body.deviceLabel, body.state);
    return Response.json({ ok: true });
  }

  if (body.target === "appliance") {
    simulator.setApplianceState(body.deviceLabel, body.applianceLabel, body.state);
    return Response.json({ ok: true });
  }

  return Response.json({ ok: false }, { status: 400 });
}
