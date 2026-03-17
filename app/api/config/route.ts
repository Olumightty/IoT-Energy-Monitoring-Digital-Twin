import { getSimulator } from "../../../simulator/serverSimulator";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const anomalyProbability = Number(body?.anomalyProbability);
  if (Number.isFinite(anomalyProbability)) {
    const simulator = getSimulator();
    simulator.updateAnomalyProbability(
      Math.min(0.2, Math.max(0, anomalyProbability))
    );
  }

  return Response.json({ ok: true });
}
