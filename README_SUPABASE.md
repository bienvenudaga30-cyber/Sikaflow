# Sika FLOW - Backend Supabase Implémentation Complète

## 📋 Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Démarrage Rapide](#démarrage-rapide)
- [Architecture](#architecture)
- [Fichiers Clés](#fichiers-clés)
- [Configuration](#configuration)
- [Documentation](#documentation)
- [Support](#support)

## 🎯 Vue d'Ensemble

Sika FLOW est une plateforme de gestion de transactions Mobile Money avec:

- **Frontend:** Next.js 16 + React 19 + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **API:** REST API sécurisée avec clés API
- **Authentification:** Email/Password avec confirmation
- **Sécurité:** Row Level Security sur toutes les données

## 🚀 Démarrage Rapide

Si vous êtes impatient, suivez ces 5 étapes:

**[👉 Lire QUICK_START.md](./QUICK_START.md)** (15 minutes)

1. Créer projet Supabase
2. Exécuter la migration SQL
3. Copier les clés API
4. Ajouter variables d'env à Vercel
5. Redéployer

## 🏗️ Architecture

### Couches de l'Application

```
┌─────────────────────────────────────┐
│      Frontend (Next.js 16)          │
├─────────────────────────────────────┤
│  Pages (Login, Dashboard, etc.)     │
│  Components (Forms, Tables, etc.)   │
│  Middleware (Auth, Sessions)        │
├─────────────────────────────────────┤
│    API Routes (/api/v1/*)           │
├─────────────────────────────────────┤
│   Clients Supabase (Browser/Server) │
├─────────────────────────────────────┤
│  Backend (Supabase PostgreSQL)      │
├─────────────────────────────────────┤
│  Tables (Profiles, Transactions)    │
│  RLS Policies (Sécurité)           │
│  Auth (Email, Confirmations)        │
└─────────────────────────────────────┘
```

### Flux d'Authentification

```
Utilisateur remplit formulaire
        ↓
LoginForm/SignUpForm (React Client)
        ↓
createClient() - Supabase Browser
        ↓
Supabase Auth (Email/Password)
        ↓
Confirmation Email ou Session créée
        ↓
Middleware rafraîchit tokens
        ↓
Accès aux ressources protégées
```

### Sécurité avec RLS

```
Supabase Query
        ↓
RLS Policy: auth.uid() = user_id
        ↓
Seulement les données de l'utilisateur
```

## 📂 Fichiers Clés

### Configuration Supabase
```
/lib/supabase/
  ├── client.ts      # Client browser (formules, pages)
  ├── server.ts      # Client serveur (API routes)
  ├── admin.ts       # Client admin (operations système)
  └── proxy.ts       # Client middleware (sessions)
```

### Authentification
```
/app/auth/
  ├── sign-up/page.tsx        # Inscription
  ├── callback/route.ts       # Confirmation email
  ├── error/page.tsx          # Erreur auth
  └── sign-up-success/page.tsx # Confirmation

/components/auth/
  └── sign-up-form.tsx        # Formulaire inscription

/components/landing/
  └── login-form.tsx          # Formulaire connexion
```

### API Routes
```
/app/api/v1/auth/
  ├── user/route.ts           # GET utilisateur actuel
  └── logout/route.ts         # POST déconnexion

/app/api/v1/transactions/
  ├── route.ts                # GET/POST transactions
  ├── [id]/route.ts           # PATCH/DELETE transaction
  └── stats/route.ts          # GET statistiques
```

### Migration & Schéma
```
/scripts/
  └── 001_create_schema.sql   # Tables + RLS
```

### Documentation
```
/QUICK_START.md               # 15 min pour démarrer
/SUPABASE_SETUP.md           # Configuration basique
/BACKEND_GUIDE.md            # Guide complet (392 lignes)
/DEPLOYMENT_CHECKLIST.md     # Checklist 10 phases
/IMPLEMENTATION_SUMMARY.md   # Résumé technique
```

## 🔧 Configuration

### Variables d'Environnement

```bash
# Supabase (Requis)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# API Keys (Optionnel - pour API publique)
SIKAFLOW_API_KEY=mklive_dev_sikaflow_local

# CORS (Optionnel)
SIKAFLOW_CORS_ORIGIN=https://yourdomain.com
```

### Installation des Dépendances

```bash
cd sikaflow-momoparse
npm install
# ou
yarn install
# ou
pnpm install
```

### Développement Local

```bash
npm run dev
# Ouvre http://localhost:3000
```

### Build & Production

```bash
npm run build
npm start
```

## 📊 Base de Données

### Tables Créées

1. **profiles** - Profils utilisateur
   - Lié à auth.users
   - RLS: L'utilisateur voit seulement son profil

2. **sikaflow_transactions** - Transactions Mobile Money
   - user_id pour l'isolation
   - RLS: L'utilisateur voit seulement ses transactions

3. **api_keys** - Clés API
   - user_id pour l'isolation
   - RLS: L'utilisateur gère seulement ses clés

4. **devices** - Appareils autorisés
   - user_id pour l'isolation
   - RLS: L'utilisateur gère seulement ses appareils

### Accès aux Données

```typescript
// Exemple: Récupérer les transactions de l'utilisateur
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

const { data } = await supabase
  .from('sikaflow_transactions')
  .select('*')
  .eq('user_id', user.id)
  // RLS s'applique automatiquement!
```

## 🔐 Sécurité

### Row Level Security (RLS)
- Activé sur toutes les tables
- Les utilisateurs ne voient que leurs données
- Appliqué automatiquement par PostgreSQL

### Sessions & Tokens
- Sessions dans cookies HTTP-only
- Tokens JWT rafraîchis automatiquement
- Middleware gère l'expiration

### Clés API
- Service role jamais exposée au client
- Client browser utilise clé anon
- Admin client pour opérations système

## 📡 API Endpoints

### Authentification

```
GET    /api/v1/auth/user          # Utilisateur actuel
POST   /api/v1/auth/logout        # Déconnexion
```

### Transactions

```
GET    /api/v1/transactions       # Liste
POST   /api/v1/transactions       # Créer
GET    /api/v1/transactions/[id]  # Détail
PATCH  /api/v1/transactions/[id]  # Mettre à jour
DELETE /api/v1/transactions/[id]  # Supprimer
GET    /api/v1/transactions/stats # Statistiques
```

### Authentification API
```bash
-H "X-Api-Key: votre_clé_api"
```

## 🧪 Tests

### Tester l'inscription
```bash
1. Allez sur /auth/sign-up
2. Remplissez le formulaire
3. Vérifiez l'email
4. Cliquez le lien de confirmation
```

### Tester l'authentification API
```bash
curl -X GET http://localhost:3000/api/v1/auth/user

curl -X POST http://localhost:3000/api/v1/auth/logout

curl -X GET http://localhost:3000/api/v1/transactions \
  -H "X-Api-Key: mklive_dev_sikaflow_local"
```

### Vérifier la base de données
```bash
# Supabase → SQL Editor
SELECT * FROM auth.users;
SELECT * FROM profiles;
SELECT * FROM sikaflow_transactions;
```

## 📚 Documentation Complète

### Pour Démarrer
- **[QUICK_START.md](./QUICK_START.md)** - 5 étapes, 15 minutes

### Guides Détaillés
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Configuration basique
- **[BACKEND_GUIDE.md](./BACKEND_GUIDE.md)** - Guide complet (392 lignes)
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Résumé technique

### Avant Production
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - 10 phases de vérification

## 🚀 Déploiement

### Sur Vercel (Recommandé)

1. Connecter le repo GitHub
2. Ajouter variables d'env
3. Cliquer "Deploy"
4. Vercel se charge du reste

### Manuel

```bash
npm run build
npm start
```

## 🆘 Support

### Problèmes Courants

1. **Email de confirmation non reçu**
   - Vérifier spam
   - Attendre 2-3 min
   - Vérifier template Supabase

2. **"SUPABASE_URL not configured"**
   - Vérifier variables Vercel
   - Redéployer après ajouter
   - Attendre 5 min

3. **Erreur RLS**
   - Vérifier auth.uid()
   - Consulter logs Supabase
   - Lire BACKEND_GUIDE.md

### Ressources

- [Docs Supabase](https://supabase.com/docs)
- [Discord Supabase](https://discord.supabase.com)
- [GitHub Supabase](https://github.com/supabase/supabase)
- [Examples](https://github.com/supabase/supabase/tree/master/examples)

## 💡 Conseils

1. **Développement:**
   - Utiliser `npm run dev` avec Supabase en cloud
   - Tester avec plusieurs comptes
   - Consulter les logs Supabase

2. **Production:**
   - Activer les backups
   - Configurer les alertes
   - Monitorer l'utilisation

3. **Sécurité:**
   - Ne jamais exposer la service role key
   - Toujours vérifier l'utilisateur côté serveur
   - Tester RLS avec plusieurs utilisateurs

## 📋 Checklist Rapide

- [ ] Créer projet Supabase
- [ ] Exécuter migration SQL
- [ ] Copier clés API
- [ ] Ajouter variables env à Vercel
- [ ] Redéployer
- [ ] Tester inscription
- [ ] Tester connexion
- [ ] Tester API routes
- [ ] Configurer email notifications
- [ ] Lancer en production

## 🎓 Apprendre Supabase

1. **Auth:** https://supabase.com/docs/guides/auth
2. **Database:** https://supabase.com/docs/guides/database
3. **RLS:** https://supabase.com/docs/guides/database/postgres/row-level-security
4. **Real-time:** https://supabase.com/docs/guides/realtime
5. **Storage:** https://supabase.com/docs/guides/storage

## 📞 Contact & Support

- **Email:** [Votre email de support]
- **Discord:** [Votre serveur Discord]
- **Docs:** Consultez les fichiers README
- **GitHub Issues:** [Votre repo GitHub]

## 📄 Licence

[Votre licence ici]

## 🎉 Bravo!

Vous avez un backend complet et sécurisé avec Supabase!

### Prochaines Étapes

1. **Court terme:** Configurer emails, tester en staging
2. **Moyen terme:** 2FA, OAuth, webhooks
3. **Long terme:** Real-time, storage, analytics

---

**Créé avec ❤️ pour Sika FLOW**

*Pour plus d'info: Lisez [QUICK_START.md](./QUICK_START.md)*
