# AGENTS.md

# Ratey

Ratey est une application pour rechercher et noter des jeux vidéos.

Un utilisateur doit, avant d'utiliser l'application :

- S'inscrire / se connecter avec Clerk

Un utilisateur connecté peut :

- Naviguer à travers les pages
- Rechercher des jeux dans la barre de recherche du haut (API d'IGDB)
- Voir la carte d'un jeu
- L'ajouter à : ses favoris, à jouer plus tard, donner une évaluation (base de 5 étoiles, peut noter en quart de points. ex.: 4.25/5)
- Modifier ou supprimer son évaluation
- Dans les pages "Favoris", "À jouer plus tard", et "Vos évaluations", il peut rechercher et trier par: titre, studio, année, évaluation (pas dans "À jouer plus tard")
- Supprimer les filtres précédents
- Modifier ses paramètres
- Se déconnecter

# Stack

- App : Electron (TypeScript), Vite, Vue.js, Tailwind, Clerk (`@clerk/vue`)
- API : Hono sur Vercel, Prisma 7 + Neon (PostgreSQL), Clerk (vérification des jetons)
- Tests : Vitest

# Commandes

- `npm run start` : serveur de développement
- `npm test` : tests Vitest, à lancer après chaque modification.
- `npm run lint` et `npm run build` : doivent passer avant chaque commit
- `npx prisma validate` (dans `server/`) : après toute modification de `server/prisma/schema.prisma`
- Dans `server/` : `npm run dev` (API locale sur le port 3000), `npm test`, `npm run typecheck`

# Structure

Architecture : l'app Electron ne contient **aucun secret**. Elle appelle l'API Ratey (Hono, hébergée sur Vercel) en HTTPS avec le jeton de session Clerk. L'API vérifie le jeton, puis accède à Neon (Prisma) et à IGDB.

App Electron :

- `src/main/` : process principal (`main.ts` : fenêtres, cycle de vie, durcissement de la sécurité : CSP, sandbox, protocole `app://`, blocage de la navigation externe)
- `src/preload/` : script preload (`preload.ts`), pont minimal entre main et renderer
- `src/renderer/` : interface Vue, racine Vite du renderer
  - `pages/`, `components/`, `composables/` (dont l'appel à l'API avec le jeton Clerk)
  - `index.html`, `renderer.ts`, `App.vue`, `index.css` (Tailwind)
- `src/shared/` : code pur partagé entre l'app et l'API (types, arrondi des notes au quart de point, tris, filtres)

API (`server/`, avec son propre `package.json`) :

- `server/src/routes/` : routes Hono (favoris, à jouer plus tard, évaluations, recherche IGDB)
- `server/src/db/` : client Prisma (adaptateur Neon) et CRUD par entité
- `server/src/igdb/` : jeton Twitch et requêtes IGDB
- `server/src/middleware/` : vérification du jeton Clerk ; le `userId` vient **toujours** du jeton, jamais du client
- `server/prisma/schema.prisma` : modèle de données ; `server/prisma.config.ts` : configuration Prisma 7
- Client Prisma généré : ignoré par git, ne pas modifier

Commun :

- `docs/` : cahier des charges, diagramme de classes, journal IA
- Tests Vitest à côté du fichier testé : `*.test.ts`
- Config : `forge.config.mts` (Electron Forge), `vite.{main,preload,renderer}.config.mts`, `.oxlintrc.json` / `.oxfmtrc.json`
- `.env` à la racine pour l'app (variables `VITE_*` publiques uniquement) ; `server/.env` pour les secrets de l'API ; noms des variables dans les `.env.example`

# Interdits

- Jamais `prisma migrate reset`, `git push --force`, `git reset --hard` sans mon accord
- Jamais lire ni afficher `.env` (utiliser `.env.example` pour connaître le noms des variables)
- Jamais de nouveau paquet npm sans me demander

# Facon de travailler

- Propose un plan avant de coder ; une tâche a la fois
- Apres chaque modification : `npm test` et `npm run lint`
- Commit : `type : description` (feat, update, docs, chore, test, fix)
- Réponds en francais
- Si une règle metier ou un nom de champ manque : pose la question, NE DEVINE PAS.
