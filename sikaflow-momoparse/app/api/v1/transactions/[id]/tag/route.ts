import { authorizeApiRequest } from "@/lib/api/authorize";
import { apiOptionsResponse } from "@/lib/api/options";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { tagBodySchema } from "@/lib/api/schemas";
import { svcGetTransactionById, svcTagTransaction } from "@/lib/api/transaction-service";

type Ctx = { params: Promise<{ id: string }> };

export async function OPTIONS() {
  return apiOptionsResponse();
}

export async function POST(request: Request, context: Ctx) {
  const auth = authorizeApiRequest(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  let existing: Awaited<ReturnType<typeof svcGetTransactionById>>;
  try {
    existing = await svcGetTransactionById(id);
  } catch {
    return jsonError("Erreur lors de la lecture de la transaction.", 500);
  }
  if (!existing) {
    return jsonError("Transaction not found", 404);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = tagBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues.map((i) => i.message).join("; "), 400);
  }

  let updated: Awaited<ReturnType<typeof svcTagTransaction>>;
  try {
    updated = await svcTagTransaction(id, {
      externalRef: parsed.data.external_ref,
      metadata: parsed.data.metadata,
    });
  } catch {
    return jsonError("Erreur lors de la mise à jour de la transaction.", 500);
  }

  if (!updated) {
    return jsonError("Transaction not found", 404);
  }

  const { rawSms, ...publicPart } = updated;
  void rawSms;

  return jsonSuccess(
    {
      success: true as const,
      data: publicPart,
    },
    {
      headers: {
        "X-RateLimit-Remaining": String(auth.remaining),
      },
    }
  );
}
