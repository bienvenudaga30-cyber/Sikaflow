# Configuration Supabase - Sika FLOW

Ce document explique comment configurer complètement le backend Supabase pour Sika FLOW.

## ✅ Étapes Complétées

### 1. **Migration de Base de Données** ✓
- Table `profiles` - Profils utilisateur avec RLS
- Table `sikaflow_transactions` - Transactions avec RLS
- Table `api_keys` - Clés API avec RLS
- Table `devices` - Appareils utilisateur avec RLS
- Tous les RLS (Row Level Security) sont en place

**Fichier:** `/scripts/001_create_schema.sql`

### 2. **Clients Supabase** ✓
- **Client Browser** (`/lib/supabase/client.ts`) - Pour les opérations côté client
- **Client Serveur** (`/lib/supabase/server.ts`) - Pour les Server Components
- **Client Admin** (`/lib/supabase/admin.ts`) - Pour les opérations administrateur
- **Client Proxy** (`/lib/supabase/proxy.ts`) - Pour le middleware de session

### 3. **Authentification** ✓
- **Login** (`/app/login/page.tsx`) - Page de connexion
- **Sign Up** (`/app/auth/sign-up/page.tsx`) - Page d'inscription
- **Callback** (`/app/auth/callback/route.ts`) - Route de confirmation email
- **Erreur** (`/app/auth/error/page.tsx`) - Page d'erreur d'auth
- **Logout** (`/app/api/v1/auth/logout/route.ts`) - API de déconnexion
- **User Info** (`/app/api/v1/auth/user/route.ts`) - API pour obtenir l'utilisateur actuel

### 4. **Middleware** ✓
- Protection des routes
- Gestion des sessions
- Rafraîchissement automatique des tokens

**Fichier:** `/middleware.ts`

### 5. **API Routes** ✓
Toutes les routes API existantes fonctionnent avec Supabase via le service `transaction-service.ts` qui bascule automatiquement entre les données mockées et Supabase.

## 🔧 Configuration Requise

### Variables d'Environnement
Ajoutez ces variables dans votre projet Vercel (Settings → Vars):

```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role
```

**Comment obtenir ces clés:**
1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre projet
3. Settings → API → Copy the keys

### Installation des Dépendances
Le package `@supabase/ssr` a été ajouté à `package.json`. Les dépendances seront installées automatiquement lors du déploiement.

## 📚 Utilisation

### Authentification Client
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})
```

### Authentification Serveur
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

### Accès aux Données avec RLS
Toutes les requêtes aux tables (`sikaflow_transactions`, `profiles`, `api_keys`) respectent automatiquement les politiques RLS. L'utilisateur ne peut voir que ses propres données.

```typescript
// Cette requête est protégée par RLS
const { data } = await supabase
  .from('sikaflow_transactions')
  .select('*')
  .eq('user_id', user.id)
```

## 🚀 Déploiement

1. **Créer un projet Supabase** sur [supabase.com](https://supabase.com)
2. **Exécuter la migration SQL** dans l'éditeur SQL de Supabase
3. **Ajouter les variables d'environnement** à votre projet Vercel
4. **Déployer** - Vercel connectera automatiquement Supabase

## 📋 Checklist de Déploiement

- [ ] Projet Supabase créé
- [ ] Migration SQL exécutée
- [ ] Variables d'env ajoutées à Vercel
- [ ] Email confirmation activé (Supabase Settings → Auth)
- [ ] Domaines autorisés configurés
- [ ] Tests d'inscription et connexion effectués
- [ ] Tests des API routes effectués

## 🔒 Sécurité

### Row Level Security (RLS)
Toutes les tables ont des politiques RLS activées:
- Les utilisateurs ne peuvent voir que leurs propres données
- L'authentification est vérifiée automatiquement
- Les API keys sont utilisées pour les accès administrateur

### Session Management
- Les sessions sont gérées par les cookies HTTP-only
- Le middleware rafraîchit automatiquement les tokens
- La déconnexion supprime la session

## 📞 Support

Pour toute question sur la configuration Supabase:
- [Documentation Supabase](https://supabase.com/docs)
- [Discord Supabase](https://discord.supabase.com)

## 🔄 Prochaines Étapes (Optionnel)

1. **2FA (Two-Factor Authentication)** - Ajouter une authentification à 2 facteurs
2. **OAuth Providers** - Google, GitHub, etc.
3. **Webhooks** - Déclencher des actions à la création d'utilisateur
4. **Real-time** - Synchroniser les données en temps réel
5. **Storage** - Stocker des fichiers (avatars, documents, etc.)
