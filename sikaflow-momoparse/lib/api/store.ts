import type { PublicTransactionDetail } from "@/lib/api/types";
import { computeStatsFromRows } from "@/lib/api/stats-compute";
import {
  listTransactionsFromRows,
  type ListTransactionsFilters,
} from "@/lib/api/transaction-query";

type Row = PublicTransactionDetail;

function seedRows(): Row[] {
  const iso = (h: number) => new Date(Date.UTC(2025, 2, 24, h, 0, 0)).toISOString();
  return [
    {
      id: "txn_7f2a9c1e001",
      operator: "mtn",
      type: "received",
      status: "success",
      amount: 25000,
      currency: "XOF",
      reference: "MP240324.1829",
      counterparty: "22997000000",
      receivedAt: iso(12),
      rawSms:
        "Vous avez recu 25000 FCFA de JEAN K. (22997000000). Ref: MP240324.1829. Solde: 182400 FCFA.",
      externalRef: null,
      metadata: null,
    },
    {
      id: "txn_7f2a9c1e002",
      operator: "moov",
      type: "payment",
      status: "success",
      amount: 4500,
      currency: "XOF",
      reference: "MOOV-99281",
      counterparty: "RESTAFY_SA",
      receivedAt: iso(11),
      rawSms: "Paiement de 4500 FCFA marchand RESTAFY SA. Ref MOOV-99281.",
      externalRef: null,
      metadata: null,
    },
    {
      id: "txn_7f2a9c1e003",
      operator: "celtiis",
      type: "received",
      status: "pending",
      amount: 8000,
      currency: "XOF",
      reference: "CEL-8821",
      counterparty: "22961000000",
      receivedAt: iso(9),
      rawSms: "Credit 8000 F recu de 22961000000. Ref CEL-8821.",
      externalRef: null,
      metadata: null,
    },
    {
      id: "txn_7f2a9c1e004",
      operator: "mtn",
      type: "sent",
      status: "failed",
      amount: 10000,
      currency: "XOF",
      reference: "MTN-FAIL-01",
      counterparty: "22990000000",
      receivedAt: iso(8),
      rawSms: "Echec transfert 10000 FCFA vers 22990000000. Ref MTN-FAIL-01.",
      externalRef: null,
      metadata: null,
    },
    {
      id: "txn_7f2a9c1e005",
      operator: "mtn",
      type: "withdrawal",
      status: "success",
      amount: 50000,
      currency: "XOF",
      reference: "WD-44102",
      counterparty: null,
      receivedAt: iso(7),
      rawSms: "Retrait de 50000 FCFA effectue. Ref WD-44102. Nouveau solde: 45000 FCFA.",
      externalRef: "order_restafy_99",
      metadata: { restaurant: "Chez Sika FLOW", table: 4 },
    },
  ];
}

declare global {
  var __sikaApiStore: Map<string, Row> | undefined;
}

function getMap(): Map<string, Row> {
  if (!globalThis.__sikaApiStore) {
    const m = new Map<string, Row>();
    for (const r of seedRows()) {
      m.set(r.id, { ...r });
    }
    globalThis.__sikaApiStore = m;
  }
  return globalThis.__sikaApiStore;
}

function sortedRows(): Row[] {
  return [...getMap().values()].sort(
    (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
  );
}

export function listTransactions(filters: ListTransactionsFilters) {
  return listTransactionsFromRows(sortedRows(), filters);
}

export function getTransactionById(id: string): Row | undefined {
  const r = getMap().get(id);
  return r ? { ...r } : undefined;
}

export function tagTransaction(
  id: string,
  payload: { externalRef?: string; metadata?: Record<string, unknown> }
): Row | undefined {
  const m = getMap();
  const row = m.get(id);
  if (!row) return undefined;
  const next: Row = {
    ...row,
    externalRef: payload.externalRef ?? row.externalRef,
    metadata:
      payload.metadata != null
        ? { ...(row.metadata ?? {}), ...payload.metadata }
        : row.metadata,
  };
  m.set(id, next);
  return { ...next };
}

export function computeStats() {
  return computeStatsFromRows(sortedRows());
}
