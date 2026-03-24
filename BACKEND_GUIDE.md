# Guide Complet du Backend Supabase - Sika FLOW

## 🎯 Vue d'ensemble

Sika FLOW utilise **Supabase** comme backend complet pour gérer:
- ✅ **Authentification** - Email/Password avec confirmation
- ✅ **Base de Données** - PostgreSQL avec RLS (Row Level Security)
- ✅ **Transactions** - Gestion des transactions Mobile Money
- ✅ **Profils Utilisateur** - Données utilisateur et préférences
- ✅ **Clés API** - Gestion des accès API

## 📊 Schéma de Base de Données

### 1. Table `profiles`
Stocke les informations de profil des utilisateurs.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  country TEXT,
  business_type TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**RLS Policies:**
- `SELECT`: Utilisateurs ne voient que leur propre profil
- `INSERT`: Utilisateurs ne peuvent insérer que leur propre profil
- `UPDATE`: Utilisateurs ne peuvent mettre à jour que leur propre profil
- `DELETE`: Utilisateurs ne peuvent supprimer que leur propre profil

### 2. Table `sikaflow_transactions`
Stocke les transactions Mobile Money.

```sql
CREATE TABLE sikaflow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operator TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'XOF',
  reference TEXT NOT NULL,
  counterparty TEXT,
  received_at TIMESTAMP NOT NULL,
  raw_sms TEXT,
  external_ref TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**RLS Policies:**
- Utilisateurs ne voient que leurs propres transactions
- Peut être créée, mise à jour, supprimée seulement par le propriétaire

### 3. Table `api_keys`
Stocke les clés API pour accès programmé.

```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**RLS Policies:**
- Utilisateurs ne gèrent que leurs propres clés API

### 4. Table `devices`
Stocke les appareils autorisés pour l'authentification.

```sql
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  device_id TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  last_seen_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔐 Authentification (Supabase Auth)

### Flow d'Inscription

```
1. Utilisateur remplit le formulaire: email, password, nom
2. SignUpForm appelle supabase.auth.signUp()
3. Email de confirmation est envoyé
4. Utilisateur clique le lien → Route /auth/callback
5. Callback rafraîchit la session et redirige vers /dashboard
6. Profile est auto-créé par trigger PostgreSQL
```

**Fichier:** `/components/auth/sign-up-form.tsx`

### Flow de Connexion

```
1. Utilisateur entre ses identifiants
2. LoginForm appelle supabase.auth.signInWithPassword()
3. Session est créée et stockée dans cookies HTTP-only
4. Utilisateur est redirigé vers /dashboard
5. Middleware vérifie automatiquement la session
```

**Fichier:** `/components/landing/login-form.tsx`

### Flow de Déconnexion

```
1. Utilisateur clique "Déconnexion"
2. Appel POST /api/v1/auth/logout
3. Supabase efface la session
4. Redirection vers /login
```

**Route:** `POST /api/v1/auth/logout`

## 🛡️ Row Level Security (RLS)

RLS garantit que chaque utilisateur ne peut accéder qu'à ses propres données.

### Exemple: Lecture de transactions
```sql
-- Politique: Un utilisateur ne voit que ses propres transactions
CREATE POLICY "transactions_select_own"
  ON sikaflow_transactions FOR SELECT
  USING (auth.uid() = user_id);
```

Cette politique s'applique **automatiquement** à toutes les requêtes Supabase.

## 📡 API Routes

### Authentification

#### GET `/api/v1/auth/user`
Obtient l'utilisateur actuellement connecté.

```bash
curl -X GET http://localhost:3000/api/v1/auth/user
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "user_metadata": {
      "full_name": "Jean Dupont"
    }
  }
}
```

#### POST `/api/v1/auth/logout`
Déconnecte l'utilisateur actuel.

```bash
curl -X POST http://localhost:3000/api/v1/auth/logout
```

### Transactions

#### GET `/api/v1/transactions`
Liste les transactions de l'utilisateur.

```bash
curl -X GET "http://localhost:3000/api/v1/transactions?limit=50&offset=0" \
  -H "X-Api-Key: votre_clé_api"
```

#### GET `/api/v1/transactions/[id]`
Récupère une transaction spécifique.

```bash
curl -X GET "http://localhost:3000/api/v1/transactions/uuid" \
  -H "X-Api-Key: votre_clé_api"
```

#### POST `/api/v1/transactions`
Crée une nouvelle transaction.

```bash
curl -X POST http://localhost:3000/api/v1/transactions \
  -H "X-Api-Key: votre_clé_api" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "currency": "XOF",
    "description": "Payment for services",
    "transaction_date": "2024-01-15T10:30:00Z"
  }'
```

#### PATCH `/api/v1/transactions/[id]`
Met à jour une transaction.

#### DELETE `/api/v1/transactions/[id]`
Supprime une transaction.

## 🔌 Utilisation du Client Supabase

### Browser (Client)
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
})
```

### Server Components
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

### Admin (Service Role)
```typescript
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const supabase = getSupabaseAdmin()
// Accès avec privilèges administrateur (ignore RLS)
const { data } = await supabase
  .from('sikaflow_transactions')
  .select('*')
```

## 🔄 Middleware et Sessions

Le fichier `/middleware.ts` gère automatiquement:
- ✅ Rafraîchissement des tokens JWT expirés
- ✅ Stockage de la session dans les cookies
- ✅ Synchronisation entre les onglets du navigateur

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}
```

## 🚨 Gestion des Erreurs

### Erreur d'authentification (401)
```typescript
if (error?.status === 401) {
  // Rediriger vers /login
  router.push('/login')
}
```

### Erreur RLS (403)
```typescript
// L'utilisateur tente d'accéder à des données d'un autre
if (error?.message.includes('policy')) {
  return { error: 'Unauthorized access' }
}
```

### Erreur de serveur (500)
```typescript
// Problème de connexion ou base de données
if (error?.status === 500) {
  return { error: 'Service temporarily unavailable' }
}
```

## 📝 Variables d'Environnement

```bash
# Essentiels
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# API Keys
SIKAFLOW_API_KEY=mklive_dev_sikaflow_local

# CORS (optionnel)
SIKAFLOW_CORS_ORIGIN=https://yourdomain.com
```

## 🧪 Testing

### Créer un compte de test
```
Email: test@example.com
Password: Test123!
```

### Tester l'authentification
```bash
# Sign Up
curl -X POST http://localhost:3000/api/v1/auth/sign-up \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Sign In
curl -X POST http://localhost:3000/api/v1/auth/sign-in \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Get User
curl http://localhost:3000/api/v1/auth/user
```

## 🔗 Liens Utiles

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase SSR Auth](https://supabase.com/docs/guides/auth/server-side-rendering)
- [Next.js Supabase Integration](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

## 📚 Fichiers Clés

```
sikaflow-momoparse/
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Client browser
│   │   ├── server.ts          # Client serveur
│   │   ├── admin.ts           # Client admin
│   │   └── proxy.ts           # Gestion sessions middleware
│   └── api/
│       ├── store-supabase.ts  # Service couche données
│       ├── transaction-service.ts
│       └── auth.ts
├── app/
│   ├── api/v1/
│   │   ├── transactions/      # Routes transactions
│   │   └── auth/              # Routes auth
│   └── auth/
│       ├── sign-up/page.tsx
│       ├── login/page.tsx
│       ├── callback/route.ts
│       └── error/page.tsx
├── components/
│   ├── auth/
│   │   └── sign-up-form.tsx
│   └── landing/
│       └── login-form.tsx
└── middleware.ts
```

## 🚀 Déploiement Production

1. **Créer projet Supabase** sur supabase.com
2. **Exécuter la migration** dans Supabase SQL Editor
3. **Configurer auth** dans Supabase → Settings → Auth
4. **Ajouter variables env** à Vercel
5. **Configurer domaines** dans Supabase Redirect URLs
6. **Déployer** - Vercel connecte automatiquement

## ❓ FAQ

**Q: Comment ajouter une colonne à `profiles`?**
A: Exécutez une requête SQL dans Supabase SQL Editor:
```sql
ALTER TABLE profiles ADD COLUMN new_column_type;
```

**Q: Puis-je modifier les RLS policies?**
A: Oui, dans Supabase → Authentication → Policies. Modifiez les policies pour contrôler l'accès.

**Q: Comment déboguer une erreur RLS?**
A: Activez les logs Supabase dans Settings → API et vérifiez les erreurs PostgreSQL.

**Q: Est-ce que les données sont chiffrées?**
A: Supabase chiffre les données en transit (HTTPS). Pour chiffrer au repos, utilisez pgcrypto.
