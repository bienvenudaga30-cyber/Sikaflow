# Guide de Démarrage Rapide - Supabase Backend

Suivez ces 5 étapes simples pour mettre en place le backend Supabase:

## Étape 1: Créer un Projet Supabase (5 min)

1. Allez sur https://supabase.com
2. Cliquez "Sign Up" ou "Login"
3. Cliquez "New Project"
4. Remplissez:
   - Organization: Créer nouvelle ou sélectionner
   - Project Name: `sikaflow` (ou votre choix)
   - Database Password: Générer un mot de passe fort
   - Region: Choisir proche de vos utilisateurs
5. Cliquez "Create new project"
6. Attendez 2-3 minutes la création

## Étape 2: Exécuter la Migration SQL (3 min)

1. Dans Supabase, allez dans "SQL Editor" (menu gauche)
2. Cliquez "New Query"
3. Copiez le contenu de `/scripts/001_create_schema.sql` du projet
4. Collez dans l'éditeur Supabase
5. Cliquez le bouton "Run" (icône play en bas)
6. Vérifiez que 4 nouvelles tables apparaissent dans "Table Editor"

## Étape 3: Copier les Clés API (2 min)

1. Dans Supabase, allez dans "Settings" → "API" (menu gauche)
2. Copiez les 3 valeurs:
   ```
   Project URL: https://xxxx.supabase.co
   anon public key: eyJ...
   service_role key: eyJ...
   ```

## Étape 4: Ajouter les Variables d'Environnement Vercel (3 min)

1. Allez sur Vercel.com et ouvrez votre projet
2. Cliquez "Settings" (menu haut)
3. Cliquez "Environment Variables" (menu gauche)
4. Ajoutez 3 variables:

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: La valeur "Project URL" copiée
   - Cliquez "Add"

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: La valeur "anon public key" copiée
   - Cliquez "Add"

   **Variable 3:**
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: La valeur "service_role key" copiée
   - Cliquez "Add"

5. Attendez que les variables apparaissent dans la liste

## Étape 5: Redéployer (2 min)

1. Allez dans "Deployments" (menu haut)
2. Cliquez les "..." (3 points) à côté du déploiement le plus récent
3. Cliquez "Redeploy"
4. Attendez que le déploiement soit complété

## ✅ C'est Fini!

Votre backend Supabase est maintenant actif! Testez:

### Test 1: Ouvrir l'Application
```
https://votre-projet.vercel.app/auth/sign-up
```

Vous devriez voir le formulaire d'inscription.

### Test 2: Créer un Compte
1. Remplissez le formulaire (email, password, etc.)
2. Cliquez "Créer un compte"
3. Vous devriez voir "Inscription confirmée"

### Test 3: Vérifier la Base de Données
1. Allez dans Supabase → "Authentication" → "Users"
2. Vous devriez voir votre nouvel utilisateur

### Test 4: Se Connecter
1. Allez sur `/login`
2. Utilisez vos identifiants (email/password)
3. Vous devriez être redirigé vers `/dashboard`

## 🆘 Problèmes Courants

### Email de confirmation non reçu
- Vérifiez votre dossier spam
- Attendez 2-3 minutes
- Vérifiez dans Supabase → "Authentication" → "Email Templates" que le template est correct

### Erreur: "SUPABASE_URL not configured"
- Vérifiez que les 3 variables sont ajoutées dans Vercel
- Cliquez "Redeploy" après les ajouter
- Attendez 5 minutes le redéploiement

### Erreur lors de l'inscription
- Vérifiez que la migration SQL a été exécutée (Étape 2)
- Vérifiez les Logs Supabase
- Essayez avec une autre adresse email

## 📚 Documentation Complète

Pour plus de détails, consultez:
- **SUPABASE_SETUP.md** - Configuration basique
- **BACKEND_GUIDE.md** - Guide complet (schéma, API, RLS)
- **DEPLOYMENT_CHECKLIST.md** - Checklist de déploiement
- **IMPLEMENTATION_SUMMARY.md** - Résumé de ce qui a été fait

## 🚀 Prochaines Étapes

### Immédiat (Obligatoire pour production)
1. Configurer les "Redirect URLs" dans Supabase Auth
2. Activer la confirmation par email
3. Tester en environnement de staging

### Plus tard (Recommandé)
1. Activer 2FA (authentification 2 facteurs)
2. Ajouter OAuth (Google, GitHub)
3. Configurer des webhooks
4. Mettre en place la synchronisation real-time

## 💡 Conseils

1. **Développement local:** Utilisez `npm run dev` avec le même Supabase en cloud
2. **Testing:** Créez plusieurs comptes de test pour vérifier l'isolation des données
3. **Logs:** Consultez Supabase → "API Logs" pour debuguer les erreurs
4. **Performance:** Supabase s'adapte automatiquement à la charge

## 🎓 Pour Apprendre

- [Docs Supabase](https://supabase.com/docs)
- [Auth Flow Supabase](https://supabase.com/docs/guides/auth)
- [RLS Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security)

## ❓ Besoin d'Aide?

1. Vérifiez le fichier `/DEPLOYMENT_CHECKLIST.md`
2. Consultez `/BACKEND_GUIDE.md` pour plus de détails
3. Allez sur [Discord Supabase](https://discord.supabase.com)
4. Consultez les [Docs Supabase](https://supabase.com/docs)

---

**Bravo!** Vous avez un backend complet avec Supabase prêt pour la production! 🎉
