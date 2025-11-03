# Guide de Déploiement Vercel

## Prérequis

Avant de déployer sur Vercel, vous devez **ABSOLUMENT** exécuter ces commandes en local :

```powershell
# 1. Naviguer vers le dossier prisma
cd prisma

# 2. Générer le client Prisma avec les nouveaux modèles
npx prisma generate

# 3. Créer/migrer la base de données locale
npx prisma db push

# 4. Retourner au dossier racine
cd ..

# 5. Tester le build localement
pnpm run build
```

**⚠️ IMPORTANT** : Si `pnpm run build` échoue en local, le déploiement Vercel échouera aussi !

## Configuration Vercel

### 1. Variables d'environnement

Dans les paramètres de votre projet Vercel, ajoutez :

```
DATABASE_URL=file:./dev.db
```

**Note** : Pour la production, vous devriez utiliser une base de données hébergée (PostgreSQL, MySQL, etc.) au lieu de SQLite.

### 2. Commandes de build

Vercel détectera automatiquement Next.js, mais vous pouvez spécifier :

- **Build Command** : `prisma generate && pnpm run build`
- **Install Command** : `pnpm install`
- **Output Directory** : `.next` (par défaut)

### 3. Déploiement depuis GitHub

1. Connectez votre repository GitHub à Vercel
2. Sélectionnez le projet `Imagine_Ennemy`
3. Configurez les variables d'environnement
4. Cliquez sur "Deploy"

## Problèmes courants

### Erreur : "Module '@prisma/client' has no exported member 'Prisma'"

**Solution** : Le client Prisma n'a pas été généré. Ajoutez dans `vercel.json` :

```json
{
  "buildCommand": "prisma generate && pnpm run build"
}
```

### Erreur : "Parameter 'tx' implicitly has an 'any' type"

**Solution** : Déjà corrigée dans `tsconfig.json` avec `"noImplicitAny": false`

### Base de données SQLite en production

**⚠️ Problème** : SQLite n'est pas recommandé pour la production sur Vercel car le système de fichiers est éphémère.

**Solutions** :

#### Option A : Utiliser Vercel Postgres (Recommandé)
```bash
# Installer Vercel Postgres
vercel postgres create

# Mettre à jour prisma/prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
}
```

#### Option B : Utiliser Supabase (Gratuit)
1. Créer un projet sur [supabase.com](https://supabase.com)
2. Récupérer l'URL de connexion PostgreSQL
3. Mettre à jour `DATABASE_URL` dans Vercel
4. Modifier le schema Prisma pour PostgreSQL

#### Option C : Utiliser PlanetScale (MySQL)
1. Créer une base de données sur [planetscale.com](https://planetscale.com)
2. Récupérer l'URL de connexion
3. Mettre à jour le schema pour MySQL

## Migration vers PostgreSQL (Recommandé pour production)

### 1. Modifier le schema Prisma

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Créer la base de données

```bash
# Avec Vercel Postgres
vercel postgres create

# Ou avec Supabase/PlanetScale
# Récupérer l'URL de connexion
```

### 3. Mettre à jour .env

```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

### 4. Migrer

```bash
npx prisma db push
```

## Commandes utiles

```bash
# Tester le build localement
pnpm run build

# Démarrer en mode production localement
pnpm start

# Voir les logs Vercel
vercel logs

# Redéployer
git push origin main
```

## Checklist avant déploiement

- [ ] `npx prisma generate` exécuté avec succès
- [ ] `pnpm run build` fonctionne en local
- [ ] Variables d'environnement configurées dans Vercel
- [ ] Base de données de production configurée (PostgreSQL recommandé)
- [ ] Repository GitHub connecté à Vercel
- [ ] `vercel.json` présent dans le projet

## Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs Vercel : `vercel logs`
2. Testez le build localement : `pnpm run build`
3. Vérifiez que Prisma est généré : `ls node_modules/.prisma/client`
