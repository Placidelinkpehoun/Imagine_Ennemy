# Guide de Migration - Spécificités Many-to-Many

## Changements apportés

Cette migration permet à plusieurs attributs de partager la même spécificité. L'ancienne architecture utilisait une relation 1-to-1 entre une paire (entity, attribute) et une spécificité. La nouvelle architecture utilise une relation many-to-many.

## Étapes de migration

### 1. Sauvegarder votre base de données actuelle

```powershell
Copy-Item "prisma\dev.db" -Destination "prisma\dev.db.backup"
```

### 2. Supprimer l'ancienne base de données (⚠️ Attention : perte de données)

```powershell
Remove-Item "prisma\dev.db" -ErrorAction SilentlyContinue
Remove-Item "prisma\dev.db-journal" -ErrorAction SilentlyContinue
```

### 3. Générer le nouveau client Prisma

```powershell
cd prisma
npx prisma generate
```

### 4. Créer la nouvelle base de données

```powershell
npx prisma db push
```

### 5. Redémarrer votre serveur de développement

```powershell
npm run dev
```

## Nouvelles fonctionnalités

### Connexion de plusieurs attributs à une spécificité

1. Créez une spécificité en cliquant sur un attribut
2. Pour connecter un autre attribut à la même spécificité :
   - Faites glisser depuis le handle (point coloré) de l'attribut source
   - Déposez sur le nœud de spécificité cible
   - La connexion sera automatiquement créée

### Gestion des connexions multiples

- Le nœud de spécificité affiche tous les noms d'attributs connectés
- Chaque connexion apparaît comme une arête distincte dans le graphe
- Vous pouvez modifier le texte de la spécificité en cliquant dessus

## Structure de la base de données

### Ancienne structure
```
AttributeSpecificity {
  id
  entityId (unique avec attributeId)
  attributeId (unique avec entityId)
  text
  position
}
```

### Nouvelle structure
```
Specificity {
  id
  text
  position
}

SpecificityAttribute {
  id
  specificityId
  entityId
  attributeId
  (unique combinaison des 3)
}
```

## Migration manuelle des données (optionnel)

Si vous avez des données importantes à conserver, créez un script pour migrer :

```typescript
// scripts/migrate-specificities.ts
import { PrismaClient } from '@prisma/client';

const oldDb = new PrismaClient();
const newDb = new PrismaClient();

async function migrate() {
  // 1. Récupérer toutes les anciennes spécificités
  const oldSpecs = await oldDb.attributeSpecificity.findMany();
  
  // 2. Regrouper par texte et créer de nouvelles spécificités
  const specsByText = new Map();
  
  for (const old of oldSpecs) {
    if (!specsByText.has(old.text)) {
      const newSpec = await newDb.specificity.create({
        data: {
          text: old.text,
          posX: old.posX,
          posY: old.posY,
        },
      });
      specsByText.set(old.text, newSpec);
    }
    
    const spec = specsByText.get(old.text);
    await newDb.specificityAttribute.create({
      data: {
        specificityId: spec.id,
        entityId: old.entityId,
        attributeId: old.attributeId,
      },
    });
  }
  
  console.log(`Migrated ${oldSpecs.length} specificities`);
}

migrate().then(() => process.exit(0));
```
