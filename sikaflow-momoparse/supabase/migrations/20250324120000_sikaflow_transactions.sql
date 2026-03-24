-- Persistance API (service role) : ids TEXT, tenant_id TEXT, sans RLS utilisateur.
-- Pour le schéma complet (Auth, UUID, RLS, api_keys, devices), voir :
--   scripts/001_create_schema.sql
-- Ne pas appliquer les deux jeux de migrations sur la même base sans fusion manuelle.
--
-- Colonnes snake_case ; mapping dans lib/api/store-supabase.ts

create table if not exists public.sikaflow_transactions (
  id text primary key,
  tenant_id text not null default 'default',
  operator text not null,
  type text not null,
  status text not null,
  amount bigint not null,
  currency text not null default 'XOF',
  reference text not null,
  counterparty text,
  received_at timestamptz not null,
  raw_sms text not null,
  external_ref text,
  metadata jsonb
);

create index if not exists sikaflow_transactions_tenant_received_idx
  on public.sikaflow_transactions (tenant_id, received_at desc);

-- Données de démo (même jeu que le store mémoire local)
insert into public.sikaflow_transactions (
  id, tenant_id, operator, type, status, amount, currency, reference,
  counterparty, received_at, raw_sms, external_ref, metadata
) values
(
  'txn_7f2a9c1e001', 'default', 'mtn', 'received', 'success', 25000, 'XOF',
  'MP240324.1829', '22997000000', timestamptz '2025-03-24 12:00:00+00',
  'Vous avez recu 25000 FCFA de JEAN K. (22997000000). Ref: MP240324.1829. Solde: 182400 FCFA.',
  null, null
),
(
  'txn_7f2a9c1e002', 'default', 'moov', 'payment', 'success', 4500, 'XOF',
  'MOOV-99281', 'RESTAFY_SA', timestamptz '2025-03-24 11:00:00+00',
  'Paiement de 4500 FCFA marchand RESTAFY SA. Ref MOOV-99281.',
  null, null
),
(
  'txn_7f2a9c1e003', 'default', 'celtiis', 'received', 'pending', 8000, 'XOF',
  'CEL-8821', '22961000000', timestamptz '2025-03-24 09:00:00+00',
  'Credit 8000 F recu de 22961000000. Ref CEL-8821.',
  null, null
),
(
  'txn_7f2a9c1e004', 'default', 'mtn', 'sent', 'failed', 10000, 'XOF',
  'MTN-FAIL-01', '22990000000', timestamptz '2025-03-24 08:00:00+00',
  'Echec transfert 10000 FCFA vers 22990000000. Ref MTN-FAIL-01.',
  null, null
),
(
  'txn_7f2a9c1e005', 'default', 'mtn', 'withdrawal', 'success', 50000, 'XOF',
  'WD-44102', null, timestamptz '2025-03-24 07:00:00+00',
  'Retrait de 50000 FCFA effectue. Ref WD-44102. Nouveau solde: 45000 FCFA.',
  'order_restafy_99', '{"restaurant": "Chez Sika FLOW", "table": 4}'::jsonb
)
on conflict (id) do nothing;
