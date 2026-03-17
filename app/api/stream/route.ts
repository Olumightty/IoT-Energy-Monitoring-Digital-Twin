import { getSimulator } from "../../../simulator/serverSimulator";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const simulator = getSimulator();
  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const send = (snapshot: ReturnType<typeof simulator.getSnapshot>) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(snapshot)}\n\n`)
        );
      };

      unsubscribe = simulator.subscribe(send);
    },
    cancel() {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = undefined;
      }
      return;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
