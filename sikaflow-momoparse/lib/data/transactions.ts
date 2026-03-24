import { createClient } from "@/lib/supabase/server";
import { formatXof } from "@/lib/format-currency";
import { isSupabaseAuthConfigured } from "@/lib/supabase/auth-env";
import { recentTxMock } from "@/lib/mock-data";

export type Operator = "mtn" | "moov" | "celtiis";
export type TxType = "received" | "sent" | "payment" | "withdrawal";
export type TxStatus = "success" | "failed" | "pending";

export interface Transaction {
  id: string;
  time: string;
  date: string;
  operator: Operator;
  type: TxType;
  amount: string;
  amountRaw: number;
  reference: string;
  status: TxStatus;
  rawSms: string;
  counterparty: string | null;
}

export interface DashboardStats {
  volume24h: number;
  transactions24h: number;
  parseRate: number;
  devicesOnline: number;
  devicesTotal: number;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }) + " " + formatTime(date);
}

const DEMO_AMOUNTS = [25_000, 4500, 8000];

function demoTransactions(limit: number): Transaction[] {
  return recentTxMock.slice(0, limit).map((r, i) => ({
    id: r.id,
    time: r.time,
    date: r.date,
    operator: r.operator,
    type: r.type,
    amount: r.amount,
    amountRaw: DEMO_AMOUNTS[i] ?? 0,
    reference: r.reference,
    status: r.status,
    rawSms: r.rawSms,
    counterparty: null,
  }));
}

const DEMO_STATS: DashboardStats = {
  volume24h: 245_000,
  transactions24h: 42,
  parseRate: 98.5,
  devicesOnline: 2,
  devicesTotal: 3,
};

const DEMO_BY_OPERATOR: Record<Operator, { count: number; volume: number }> = {
  mtn: { count: 45, volume: 892_000 },
  moov: { count: 32, volume: 324_000 },
  celtiis: { count: 12, volume: 78_000 },
};

export async function getRecentTransactions(limit = 10): Promise<Transaction[]> {
  if (!isSupabaseAuthConfigured()) {
    return demoTransactions(limit);
  }

  const supabase = await createClient();
  
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return [];
  }

  const { data, error } = await supabase
    .from("sikaflow_transactions")
    .select("*")
    .eq("tenant_id", userData.user.id)
    .order("received_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }

  return (data || []).map((tx) => {
    const receivedAt = new Date(tx.received_at);
    return {
      id: tx.id,
      time: formatTime(receivedAt),
      date: formatDate(receivedAt),
      operator: (tx.operator?.toLowerCase() || "mtn") as Operator,
      type: (tx.type?.toLowerCase() || "received") as TxType,
      amount: formatXof(tx.amount || 0),
      amountRaw: tx.amount || 0,
      reference: tx.reference || tx.external_ref || "-",
      status: (tx.status?.toLowerCase() || "success") as TxStatus,
      rawSms: tx.raw_sms || "",
      counterparty: tx.counterparty,
    };
  });
}

export async function getLiveFeed(limit = 5): Promise<Transaction[]> {
  return getRecentTransactions(limit);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!isSupabaseAuthConfigured()) {
    return { ...DEMO_STATS };
  }

  const supabase = await createClient();
  
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return {
      volume24h: 0,
      transactions24h: 0,
      parseRate: 0,
      devicesOnline: 0,
      devicesTotal: 0,
    };
  }

  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

  // Get transactions from last 24h
  const { data: transactions, error: txError } = await supabase
    .from("sikaflow_transactions")
    .select("amount, status")
    .eq("tenant_id", userData.user.id)
    .gte("received_at", twentyFourHoursAgo.toISOString());

  if (txError) {
    console.error("Error fetching stats:", txError);
  }

  const txList = transactions || [];
  const volume24h = txList.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const successCount = txList.filter((tx) => tx.status === "success").length;
  const parseRate = txList.length > 0 ? (successCount / txList.length) * 100 : 100;

  // Get devices
  const { data: devices, error: devError } = await supabase
    .from("devices")
    .select("is_active, last_ping_at")
    .eq("user_id", userData.user.id);

  if (devError) {
    console.error("Error fetching devices:", devError);
  }

  const deviceList = devices || [];
  const fiveMinutesAgo = new Date();
  fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
  
  const devicesOnline = deviceList.filter((d) => {
    if (!d.is_active || !d.last_ping_at) return false;
    return new Date(d.last_ping_at) > fiveMinutesAgo;
  }).length;

  return {
    volume24h,
    transactions24h: txList.length,
    parseRate: Math.round(parseRate * 10) / 10,
    devicesOnline,
    devicesTotal: deviceList.length,
  };
}

export async function getTransactionsByOperator(): Promise<Record<Operator, { count: number; volume: number }>> {
  if (!isSupabaseAuthConfigured()) {
    return { ...DEMO_BY_OPERATOR };
  }

  const supabase = await createClient();
  
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return {
      mtn: { count: 0, volume: 0 },
      moov: { count: 0, volume: 0 },
      celtiis: { count: 0, volume: 0 },
    };
  }

  const { data, error } = await supabase
    .from("sikaflow_transactions")
    .select("operator, amount")
    .eq("tenant_id", userData.user.id);

  if (error) {
    console.error("Error fetching operator breakdown:", error);
    return {
      mtn: { count: 0, volume: 0 },
      moov: { count: 0, volume: 0 },
      celtiis: { count: 0, volume: 0 },
    };
  }

  const breakdown: Record<Operator, { count: number; volume: number }> = {
    mtn: { count: 0, volume: 0 },
    moov: { count: 0, volume: 0 },
    celtiis: { count: 0, volume: 0 },
  };

  for (const tx of data || []) {
    const op = (tx.operator?.toLowerCase() || "mtn") as Operator;
    if (op in breakdown) {
      breakdown[op].count++;
      breakdown[op].volume += tx.amount || 0;
    }
  }

  return breakdown;
}
