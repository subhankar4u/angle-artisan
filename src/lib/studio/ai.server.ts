// Server-only calls to the Lovable AI Gateway (text + images).
const GATEWAY = "https://ai.gateway.lovable.dev/v1";
const TEXT_MODEL = "openai/gpt-6-astra";
const IMAGE_MODEL = "openai/gpt-image-2.5-sunburst";

function key(): string {
  const k = process.env["LOVABLE_API_KEY"];
  if (!k) throw new Error("AI is not configured (missing API key).");
  return k;
}

async function gatewayError(res: Response): Promise<Error> {
  let msg = "";
  try {
    const body = (await res.json()) as { error?: { message?: string } | string; message?: string };
    msg = typeof body.error === "string" ? body.error : (body.error?.message ?? body.message ?? "");
  } catch {
    /* ignore */
  }
  if (res.status === 402) return new Error(msg || "AI credits are exhausted. Add credits in Settings → Plans & credits.");
  if (res.status === 429) return new Error(msg || "AI is rate limited right now. Wait a moment and retry.");
  return new Error(msg || `AI request failed (${res.status}).`);
}

/** Streams a Responses call and returns the full text. */
export async function generateText(system: string, user: string): Promise<string> {
  const res = await fetch(`${GATEWAY}/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key(),
      Authorization: `Bearer ${key()}`,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: TEXT_MODEL,
      input: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      reasoning: { effort: "low" },
      store: false,
      stream: true,
    }),
  });
  if (!res.ok || !res.body) throw await gatewayError(res);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let out = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const evt = JSON.parse(data) as { type?: string; delta?: string; error?: { message?: string }; response?: { error?: { message?: string } } };
        if (evt.type === "response.output_text.delta" && evt.delta) out += evt.delta;
        if (evt.type === "error" || evt.type === "response.failed") {
          throw new Error(evt.error?.message ?? evt.response?.error?.message ?? "AI generation failed.");
        }
      } catch (e) {
        if (e instanceof SyntaxError) continue;
        throw e;
      }
    }
  }
  if (!out.trim()) throw new Error("The AI returned an empty response. Please retry.");
  return out;
}

export async function generateJson<T>(system: string, user: string): Promise<T> {
  const text = await generateText(system, `${user}\n\nRespond with ONLY valid JSON. No markdown fences, no commentary.`);
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("The AI response was not valid JSON. Please retry.");
  return JSON.parse(text.slice(start, end + 1)) as T;
}

/** Generates a landscape JPEG and returns a data URL. */
export async function generateImage(prompt: string): Promise<string> {
  const res = await fetch(`${GATEWAY}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key(),
      Authorization: `Bearer ${key()}`,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      prompt,
      size: "1536x1024",
      quality: "medium",
      output_format: "jpeg",
    }),
  });
  if (!res.ok) throw await gatewayError(res);
  const body = (await res.json()) as { data?: { b64_json?: string }[] };
  const b64 = body.data?.[0]?.b64_json;
  if (!b64) throw new Error("No image was returned. Please retry.");
  return `data:image/jpeg;base64,${b64}`;
}
