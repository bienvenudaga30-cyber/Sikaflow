import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAuthConfigured } from "@/lib/supabase/auth-env";

const sampleTransactions = [
  {
    operator: "mtn",
    type: "received",
    status: "success",
    amount: 25000,
    currency: "XOF",
    reference: "MP240324.1829",
    counterparty: "JEAN KOUASSI",
    raw_sms: "Vous avez recu 25000 FCFA de JEAN KOUASSI (22997000000). Ref: MP240324.1829. Nouveau solde: 182.400 FCFA.",
  },
  {
    operator: "moov",
    type: "payment",
    status: "success",
    amount: 4500,
    currency: "XOF",
    reference: "MOOV-99281",
    counterparty: "RESTAFY SA",
    raw_sms: "Paiement de 4500 FCFA marchand RESTAFY SA. Ref MOOV-99281. Solde: 12.000 FCFA.",
  },
  {
    operator: "celtiis",
    type: "received",
    status: "pending",
    amount: 8000,
    currency: "XOF",
    reference: "CEL-8821",
    counterparty: "22961000000",
    raw_sms: "Credit 8000 F recu de 22961000000. Ref CEL-8821.",
  },
  {
    operator: "mtn",
    type: "sent",
    status: "failed",
    amount: 10000,
    currency: "XOF",
    reference: "MTN-FAIL-01",
    counterparty: "22990000000",
    raw_sms: "Echec transfert 10000 FCFA vers 22990000000. Raison: solde insuffisant.",
  },
  {
    operator: "mtn",
    type: "withdrawal",
    status: "success",
    amount: 50000,
    currency: "XOF",
    reference: "MTN-WD-0042",
    counterparty: "Agent MTN Cotonou",
    raw_sms: "Retrait 50000 FCFA chez Agent MTN Cotonou. Ref: MTN-WD-0042. Nouveau solde: 132.400 FCFA.",
  },
];

export async function POST() {
  try {
    if (!isSupabaseAuthConfigured()) {
      return NextResponse.json(
        { error: "Supabase Auth requis pour initialiser des données." },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return NextResponse.json(
        { error: "Non authentifie. Connectez-vous d'abord." },
        { status: 401 }
      );
    }

    const userId = userData.user.id;
    const now = new Date();

    const transactionsToInsert = sampleTransactions.map((tx, index) => ({
      ...tx,
      tenant_id: userId,
      received_at: new Date(now.getTime() - index * 3600000).toISOString(), // 1h apart
    }));

    const { data, error } = await supabase
      .from("sikaflow_transactions")
      .insert(transactionsToInsert)
      .select();

    if (error) {
      console.error("Error seeding transactions:", error);
      return NextResponse.json(
        { error: "Erreur lors de la creation des transactions: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${data.length} transactions de test creees avec succes.`,
      count: data.length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
