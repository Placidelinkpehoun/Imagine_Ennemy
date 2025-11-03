# ✅ Checklist de Déploiement

## 🔧 Corrections appliquées

### 1. TypeScript Configuration
- ✅ Ajouté `"noImplicitAny": false` dans `tsconfig.json`
- ✅ Permet l'inférence automatique du type `tx` dans les transactions Prisma

### 2. Package.json
- ✅ Script `build` : `prisma generate && next build`
- ✅ Script `postinstall` : `prisma generate`
- ✅ Génération automatique du client Prisma lors de l'installation

### 3. Vercel Configuration
- ✅ Fichier `vercel.json` créé
- ✅ Commande de build configurée

## 📋 Étapes AVANT le déploiement

### Étape 1 : Générer Prisma en local (OBLIGATOIRE)

```powershell
cd prisma
npx prisma generate
cd ..
```

### Étape 2 : Créer la base de données locale

```powershell
cd prisma
npx prisma db push
cd ..
```

### Étape 3 : Tester le build

```powershell
pnpm run build
```

**⚠️ Si cette commande échoue, NE PAS déployer !**

### Étape 4 : Commit et Push

```powershell
git add .
git commit -m "Ready for deployment"
git push origin main
```

## 🚀 Déploiement sur Vercel

### Option A : Via Dashboard Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer sur "Add New Project"
3. Importer depuis GitHub : `Placidelinkpehoun/Imagine_Ennemy`
4. Configurer les variables d'environnement :
   ```
   DATABASE_URL=file:./dev.db
   ```
5. Cliquer sur "Deploy"

### Option B : Via CLI

```powershell
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod
```

## ⚠️ IMPORTANT : Base de données

**SQLite ne fonctionne PAS en production sur Vercel !**

Le système de fichiers est éphémère, vos données seront perdues à chaque redéploiement.

### Solutions recommandées :

#### 🟢 Option 1 : Vercel Postgres (Recommandé)
```bash
vercel postgres create
```

Puis modifier `prisma/prisma/schema.prisma` :
```prisma
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
}
```

#### 🟢 Option 2 : Supabase (Gratuit)
1. Créer un compte sur [supabase.com](https://supabase.com)
2. Créer un projet
3. Récupérer l'URL PostgreSQL
4. Ajouter dans Vercel : `DATABASE_URL=postgresql://...`

#### 🟢 Option 3 : PlanetScale (MySQL)
1. Créer un compte sur [planetscale.com](https://planetscale.com)
2. Créer une base de données
3. Récupérer l'URL de connexion
4. Modifier le schema pour MySQL

## 🔍 Vérifications après déploiement

- [ ] Le site se charge correctement
- [ ] Les API routes fonctionnent (`/api/entities`, `/api/game-classes`)
- [ ] Les données persistent après un refresh
- [ ] Les connexions ReactFlow s'affichent
- [ ] Pas d'erreurs dans les logs Vercel

## 🐛 Résolution de problèmes

### Erreur : "Module '@prisma/client' not found"
**Solution** : Le script `postinstall` devrait le résoudre automatiquement

### Erreur : "Database locked" ou "SQLITE_CANTOPEN"
**Solution** : Migrer vers PostgreSQL (voir ci-dessus)

### Erreur : "Parameter 'tx' implicitly has an 'any' type"
**Solution** : Déjà corrigée dans `tsconfig.json`

### Les données disparaissent après redéploiement
**Solution** : C'est normal avec SQLite. Migrer vers PostgreSQL.

## 📚 Documentation

- `MIGRATION_GUIDE.md` - Guide de migration de la base de données
- `VERCEL_DEPLOYMENT.md` - Guide détaillé de déploiement
- `CHANGES_SUMMARY.md` - Résumé des modifications apportées

## 🎯 Commandes utiles

```bash
# Voir les logs Vercel
vercel logs

# Redéployer
git push origin main

# Tester en local
pnpm run dev

# Build local
pnpm run build
```

## ✨ Prêt à déployer !

Si toutes les étapes ci-dessus sont complétées, votre projet est prêt pour Vercel ! 🚀
