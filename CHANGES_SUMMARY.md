# Résumé des modifications - Spécificités partagées

## Fichiers modifiés

### 1. **Base de données**
- `prisma/prisma/schema.prisma`
  - Remplacement de `AttributeSpecificity` par `Specificity` + `SpecificityAttribute`
  - Relation many-to-many entre spécificités et attributs

### 2. **Types TypeScript**
- `src/app/types/game.ts`
  - Ajout de `Specificity` interface
  - Ajout de `SpecificityAttributeConnection` interface
  - Suppression de `AttributeSpecificity`

### 3. **API Backend**
- `src/app/api/specificities/route.ts`
  - `GET`: Retourne les spécificités avec leurs connexions multiples
  - `POST`: Crée une spécificité avec des connexions initiales
  - `PATCH`: Met à jour le texte/position d'une spécificité
  - `PUT`: Ajoute ou supprime des connexions (action: addConnection/removeConnection)

### 4. **Frontend React Flow**
- `src/app/components/CanvasTab.tsx`
  - Gestion des connexions multiples par spécificité
  - `onConnect`: Permet de connecter plusieurs attributs à une spécificité
  - Affichage des noms d'attributs multiples sur les nœuds de spécificité
  - Préservation des positions des spécificités lors du déplacement

## Nouvelles fonctionnalités

### ✨ Connexions multiples
- Un attribut peut maintenant être connecté à plusieurs spécificités
- Une spécificité peut être partagée par plusieurs attributs
- Les arêtes sont créées dynamiquement via drag & drop

### 🎨 Interface améliorée
- Les nœuds de spécificité affichent tous les attributs connectés
- Les handles (points de connexion) sont visibles sur chaque attribut
- Les arêtes partent directement des attributs individuels

### 🔧 Gestion des connexions
- Drag & drop pour créer des connexions
- Chaque connexion est persistée en base de données
- Support de la déconnexion (à implémenter via UI si nécessaire)

## API Endpoints

### GET /api/specificities
```typescript
Response: {
  data: Specificity[] // avec attributeConnections[]
}
```

### POST /api/specificities
```typescript
Request: {
  text: string,
  attributeConnections: [{ entityId, attributeId }]
}
Response: { data: Specificity }
```

### PATCH /api/specificities
```typescript
Request: {
  id: string,
  text?: string,
  position?: { x, y }
}
Response: { data: Specificity }
```

### PUT /api/specificities
```typescript
// Ajouter une connexion
Request: {
  action: "addConnection",
  specificityId: string,
  entityId: string,
  attributeId: string
}

// Supprimer une connexion
Request: {
  action: "removeConnection",
  connectionId: string
}
```

## Migration requise

⚠️ **Important**: La structure de la base de données a changé. Vous devez:

1. Sauvegarder vos données actuelles
2. Supprimer l'ancienne base de données
3. Regénérer le client Prisma
4. Créer la nouvelle base de données

Voir `MIGRATION_GUIDE.md` pour les instructions détaillées.

## Comportement attendu

### Avant
- 1 spécificité = 1 attribut d'une entité
- Impossible de partager une spécificité entre attributs
- Duplication du texte si plusieurs attributs ont la même spécificité

### Après
- 1 spécificité = N connexions (entityId + attributeId)
- Partage possible entre attributs différents
- Texte unique, connexions multiples
- Drag & drop pour créer des connexions
