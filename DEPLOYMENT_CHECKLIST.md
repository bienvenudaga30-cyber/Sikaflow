# Checklist de Déploiement Supabase - Sika FLOW

Utilisez cette checklist pour vous assurer que tout est correctement configuré avant le déploiement en production.

## ✅ Phase 1: Configuration Supabase

- [ ] **Créer projet Supabase**
  - Allez sur https://supabase.com
  - Cliquez "New Project"
  - Choisissez région + mot de passe
  - Attendez la création (2-3 min)

- [ ] **Copier les clés API**
  - Allez dans Settings → API
  - Copier `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
  - Copier `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Copier `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

- [ ] **Exécuter la migration SQL**
  - Allez dans SQL Editor
  - Cliquez "New query"
  - Copiez le contenu de `/scripts/001_create_schema.sql`
  - Collez dans l'éditeur
  - Cliquez "Run" (icône play)
  - Vérifiez qu'il y a 4 nouvelles tables

## ✅ Phase 2: Configuration Vercel

- [ ] **Ajouter variables d'environnement**
  - Allez dans Vercel → Project Settings → Environment Variables
  - Ajoutez les 3 variables Supabase:
    ```
    NEXT_PUBLIC_SUPABASE_URL=https://...
    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
    SUPABASE_SERVICE_ROLE_KEY=eyJ...
    ```
  - Cliquez "Add" après chaque variable

- [ ] **Ajouter variable API Key**
  - Ajoutez `SIKAFLOW_API_KEY` (pour les tests API)
  - Valeur: `mklive_dev_sikaflow_local` (dev) ou votre clé personnalisée

- [ ] **Vérifier redeploy**
  - Allez dans Deployments
  - Cliquez les 3 points → "Redeploy"
  - Attendez le déploiement

## ✅ Phase 3: Configuration Email Supabase

- [ ] **Configurer les URLs de redirection**
  - Supabase → Settings → Auth → URL Configuration
  - Site URL: `https://votre-domaine.vercel.app` (ou localhost:3000 pour dev)
  - Redirect URLs ajouter:
    ```
    https://votre-domaine.vercel.app/auth/callback
    http://localhost:3000/auth/callback
    ```

- [ ] **Activer la confirmation par email**
  - Supabase → Settings → Auth
  - Double-check section:
    - ✅ "Confirm email" activé
  - Email templates: Vérifiez que le template `Confirm signup` a le bon lien

- [ ] **Configurer le provider email**
  - Par défaut: Supabase envoie depuis `auth@supabase.io`
  - Pour production: Configurez votre propre SMTP
    - Settings → Email Templates → Custom SMTP

## ✅ Phase 4: Tests Locaux

- [ ] **Tester l'inscription**
  ```bash
  npm run dev
  # Ouvrir http://localhost:3000/auth/sign-up
  # Remplir le formulaire
  # Vérifier que l'email de confirmation est envoyé
  # (Vérifier dans Supabase → Auth → Users)
  ```

- [ ] **Tester la connexion**
  ```bash
  # Aller sur http://localhost:3000/login
  # Utiliser l'email créé précédemment
  # Cliquer "Se connecter"
  # Vérifier la redirection vers /dashboard
  ```

- [ ] **Tester les transactions API**
  ```bash
  # Récupérer une clé API valide
  curl -X GET http://localhost:3000/api/v1/auth/user

  # Tester les transactions
  curl -X GET http://localhost:3000/api/v1/transactions \
    -H "X-Api-Key: mklive_dev_sikaflow_local"
  ```

- [ ] **Tester la déconnexion**
  ```bash
  curl -X POST http://localhost:3000/api/v1/auth/logout
  # Vérifier que la session est effacée
  ```

## ✅ Phase 5: Tests sur Vercel Preview

- [ ] **Déployer et tester**
  - Pousser les changements sur Git
  - Vercel génère automatiquement une Preview URL
  - Tester l'inscription sur la Preview
  - Vérifier que l'email de confirmation fonctionne

- [ ] **Vérifier les logs**
  - Vercel → Deployments → Logs
  - Vérifier qu'il n'y a pas d'erreurs d'env vars
  - Vérifier les requêtes Supabase

## ✅ Phase 6: Sécurité

- [ ] **Vérifier RLS est activé**
  ```bash
  # Supabase → SQL Editor → Run:
  SELECT schemaname, tablename FROM pg_tables WHERE schemaname='public';
  ```

- [ ] **Tester RLS policies**
  - Créer 2 comptes utilisateur A et B
  - A crée une transaction
  - Vérifier que B ne peut pas la voir

- [ ] **Vérifier les clés secrètes**
  - `SUPABASE_SERVICE_ROLE_KEY` n'apparaît jamais dans les logs client
  - Utilisé seulement côté serveur

- [ ] **Activer 2FA (optionnel)**
  - Supabase → Settings → Auth → MFA

## ✅ Phase 7: Performance

- [ ] **Vérifier les indexes**
  ```sql
  -- Supabase SQL Editor
  CREATE INDEX idx_transactions_user_id ON sikaflow_transactions(user_id);
  CREATE INDEX idx_transactions_date ON sikaflow_transactions(received_at);
  ```

- [ ] **Tester les requêtes lentes**
  - Supabase → Settings → Database → Logs
  - Vérifier qu'il n'y a pas de requêtes > 1s

- [ ] **Vérifier la limite de connexions**
  - Plan Supabase Free: 4 connexions
  - Plan Pro: 100 connexions
  - Adapter selon vos besoins

## ✅ Phase 8: Monitoring

- [ ] **Activer les alertes email**
  - Supabase → Settings → Billing → Email alerts
  - Recevoir des notifications de dépassement

- [ ] **Surveiller l'utilisation**
  - Supabase → Settings → Billing → Usage
  - Vérifier les quotas

- [ ] **Vérifier les logs d'erreur**
  - Supabase → Settings → API → Logs
  - Filtrer par status code pour voir les erreurs

## ✅ Phase 9: Sauvegarde et Récupération

- [ ] **Configurer les sauvegardes**
  - Supabase → Settings → Backups
  - Plan Free: Sauvegarde quotidienne des 7 derniers jours
  - Plan Pro: Configurer point de récupération

- [ ] **Tester la récupération**
  - Lire la documentation Supabase
  - Comprendre le processus en cas de problème

## ✅ Phase 10: Documentation

- [ ] **Documenter la configuration**
  - Liste des variables env utilisées
  - Processus de sauvegarde
  - Processus de récupération d'urgence

- [ ] **Créer des contacts de support**
  - Email Supabase support
  - Numéro de téléphone (si Pro)
  - Lien vers la documentation

## 🚀 Checklist de Go-Live

Avant le lancement en production:

- [ ] Tous les tests locaux passent ✅
- [ ] Tests sur Vercel Preview passent ✅
- [ ] Email confirmation fonctionne ✅
- [ ] Transactions API répondent ✅
- [ ] RLS policies en place et testées ✅
- [ ] Clés secrètes bien sécurisées ✅
- [ ] Monitoring mis en place ✅
- [ ] Logs et alertes configurées ✅
- [ ] Sauvegarde configurée ✅
- [ ] Équipe informée des procédures ✅

## 📋 Commandes Utiles

### Développement Local
```bash
npm run dev                 # Démarrer le serveur
npm run build              # Tester le build
npm run lint               # Vérifier les erreurs
```

### Base de Données
```bash
# Vérifier les tables
SELECT * FROM information_schema.tables WHERE table_schema = 'public';

# Voir les RLS policies
SELECT * FROM pg_policies;

# Vérifier les utilisateurs
SELECT * FROM auth.users;
```

### Debugging
```bash
# Vérifier les variables env
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Tester la connexion Supabase
curl https://votre-url.supabase.co/rest/v1/profiles \
  -H "Authorization: Bearer votre_anon_key"
```

## 🆘 Troubleshooting

### Erreur: "SUPABASE_URL not configured"
- Vérifier que les env vars sont ajoutées à Vercel
- Cliquer "Redeploy" après ajouter les vars
- Attendre 2-3 minutes le redéploiement

### Erreur: "Email confirmation not received"
- Vérifier le dossier spam
- Vérifier les redirect URLs dans Supabase
- Vérifier que le provider email est configuré

### Erreur: "RLS policy violation"
- Vérifier que l'utilisateur est authentifié
- Vérifier que la politique RLS correspond au cas d'usage
- Consulter les logs Supabase pour plus d'infos

### Erreur: "Too many connections"
- Vérifier le plan Supabase
- Réduire le nombre de connexions
- Utiliser un connection pooler si besoin

## ✨ Bravo!

Si tout est checked et en vert, votre backend Supabase est prêt pour la production! 🎉

Toute question? Consultez:
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Configuration basique
- [BACKEND_GUIDE.md](./BACKEND_GUIDE.md) - Guide détaillé
- [Docs Supabase](https://supabase.com/docs) - Documentation officielle
