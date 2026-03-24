import type { Operator, PublicTransaction, PublicTransactionDetail, TxStatus, TxType } from "@/lib/api/types";

export type ListTransactionsFilters = {
  operator?: Operator;
  type?: TxType;
  status?: TxStatus;
  reference?: string;
  from?: Date;
  to?: Date;
  limit: number;
  cursor?: string;
};

function toPublic(r: PublicTransactionDetail): PublicTransaction {
  const { rawSms, ...rest } = r;
  void rawSms;
  return rest;
}

/** Liste paginée + filtres (même sémantique que l’API v1). */
export function listTransactionsFromRows(
  rows: PublicTransactionDetail[],
  filters: ListTransactionsFilters
): { items: PublicTransaction[]; total: number; nextCursor: string | null } {
  let list = [...rows].sort(
    (a, b) =>
      new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
  );
  if (filters.operator) {
    list = list.filter((r) => r.operator === filters.operator);
  }
  if (filters.type) {
    list = list.filter((r) => r.type === filters.type);
  }
  if (filters.status) {
    list = list.filter((r) => r.status === filters.status);
  }
  if (filters.reference) {
    const q = filters.reference.toLowerCase();
    list = list.filter(
      (r) =>
        r.reference.toLowerCase().includes(q) ||
        (r.counterparty && r.counterparty.toLowerCase().includes(q))
    );
  }
  if (filters.from) {
    const t = filters.from.getTime();
    list = list.filter((r) => new Date(r.receivedAt).getTime() >= t);
  }
  if (filters.to) {
    const t = filters.to.getTime();
    list = list.filter((r) => new Date(r.receivedAt).getTime() <= t);
  }

  const total = list.length;
  let start = 0;
  if (filters.cursor) {
    const idx = list.findIndex((r) => r.id === filters.cursor);
    start = idx >= 0 ? idx + 1 : 0;
  }
  const slice = list.slice(start, start + filters.limit);
  const items = slice.map(toPublic);
  const last = slice[slice.length - 1];
  const nextCursor =
    start + filters.limit < list.length && last ? last.id : null;
  return { items, total, nextCursor };
}
