<div align="center">

<img src="src/renderer/assets/logo.png" alt="Logo de Ratey" width="200" />

# Ratey

**Recherchez, notez et retrouvez les jeux vidéo qui ont marqué votre parcours.**

![Statut](https://img.shields.io/badge/statut-en%20d%C3%A9veloppement-orange?style=for-the-badge)
![Projet personnel](https://img.shields.io/badge/projet-personnel-8A2BE2?style=for-the-badge)

![Electron](https://img.shields.io/badge/Electron-47848F?style=flat-square&logo=electron&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Hono](https://img.shields.io/badge/Hono-E36002?style=flat-square&logo=hono&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Neon_PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=flat-square&logo=clerk&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)
![Claude Code](https://img.shields.io/badge/Claude_Code-D97757?style=flat-square&logo=claude&logoColor=white)

<br />

<img src="docs/images/home_wip.png" alt="Écran d'accueil de Ratey (en cours de développement)" width="850" />

<sub><i>Écran d'accueil — version en cours de développement</i></sub>

</div>

---

> [!NOTE]
> **🚧 Travail en cours.** Ratey est activement développé : certaines fonctionnalités décrites ci-dessous sont encore en construction et l'interface évolue régulièrement.

## 💜 À propos

Ratey est une application de bureau pour garder une trace des jeux vidéo auxquels j'ai joué, ceux que je veux essayer et ce que j'en ai pensé.

C'est un **projet personnel**, né de ma passion pour le jeu vidéo et de l'envie de construire un outil que j'utiliserais vraiment au quotidien. Il n'est associé à aucun cours ni à aucun travail scolaire : je le développe sur mon temps libre, pour le plaisir d'apprendre et de concevoir une application complète, de l'interface jusqu'à la base de données.

## ✨ Fonctionnalités

- 🔐 **Authentification** : inscription et connexion avec Clerk
- 🔎 **Recherche de jeux** via l'API d'[IGDB](https://www.igdb.com/)
- ⭐ **Évaluations** sur 5 étoiles, au quart de point près (ex. : 4.25 / 5), modifiables et supprimables
- ❤️ **Favoris** et **liste « À jouer plus tard »**
- 🗂️ **Recherche et tri** dans ses listes par titre, studio, année ou évaluation
- 🏆 **Accueil personnalisé** : carrousel de vos jeux les mieux notés et dernières évaluations
- ⚙️ **Paramètres** du compte

## 🛠️ Stack technique

| Couche                           | Technologies                                                       |
| -------------------------------- | ------------------------------------------------------------------ |
| **Application de bureau**        | Electron, TypeScript, Vite, Electron Forge                         |
| **Interface**                    | Vue.js 3, Vue Router, Tailwind CSS                                 |
| **API**                          | Hono, hébergée sur Vercel                                          |
| **Base de données**              | PostgreSQL (Neon), Prisma 7                                        |
| **Authentification**             | Clerk (`@clerk/vue` côté client, vérification des jetons côté API) |
| **Données de jeux**              | API IGDB (Twitch)                                                  |
| **Qualité**                      | Vitest, oxlint, oxfmt                                              |
| **Développement assisté par IA** | Claude Code                                                        |

## 🏗️ Architecture

```
┌──────────────────────┐   HTTPS + jeton Clerk   ┌──────────────────────┐
│  App Electron (Vue)  │ ──────────────────────▶ │   API Hono (Vercel)  │
│   aucun secret       │                         │  vérifie le jeton    │
└──────────────────────┘                         └──────────┬───────────┘
                                                            │
                                         ┌──────────────────┴──────────────────┐
                                         ▼                                     ▼
                              ┌────────────────────┐               ┌────────────────────┐
                              │  Neon (PostgreSQL) │               │      API IGDB      │
                              │    via Prisma      │               │                    │
                              └────────────────────┘               └────────────────────┘
```

Quelques choix dont je suis fier :

- **Aucun secret dans l'application** : toutes les clés (base de données, IGDB) restent côté serveur. L'app ne transmet que le jeton de session Clerk.
- **L'identité vient toujours du jeton** : l'API déduit l'utilisateur du jeton vérifié, jamais d'un paramètre envoyé par le client.
- **Electron durci** : CSP stricte, sandbox, protocole personnalisé `app://` et blocage de la navigation externe.
- **Code partagé** : la logique métier pure (arrondi des notes au quart de point, tris, filtres) est mutualisée entre l'app et l'API, et testée avec Vitest.

## 🤖 Développé avec Claude Code

J'utilise [Claude Code](https://claude.com/claude-code) comme partenaire de développement tout au long du projet. Plutôt que de le laisser coder à l'aveugle, je l'encadre avec une méthode de travail précise :

- un fichier [`CLAUDE.md`](CLAUDE.MD) qui décrit le projet, la stack, l'architecture et les règles à respecter ;
- un plan proposé et validé **avant** chaque modification, une tâche à la fois ;
- des tests et du lint lancés après chaque changement, et des commits conventionnels ;
- des interdits clairs (aucun secret lu ou affiché, pas de nouvelle dépendance ni d'opération destructrice sans mon accord) ;
- des _skills_ spécialisées (Prisma) pour travailler avec la documentation à jour.

Cette approche me permet d'aller plus vite tout en gardant la maîtrise des décisions techniques et la compréhension de chaque ligne de code.

## 🗺️ Feuille de route

- [x] Modèle de données et migration initiale (Prisma + Neon)
- [x] Écran d'accueil et navigation
- [ ] API Hono : routes des favoris, de « À jouer plus tard » et des évaluations
- [ ] Recherche de jeux via IGDB
- [ ] Pages « Favoris », « À jouer plus tard » et « Vos évaluations » avec recherche et tri
- [ ] Page des paramètres
- [ ] Déploiement de l'API sur Vercel et distribution de l'application

## 🚀 Lancer le projet

Prérequis : Node.js et npm.

```bash
# Application
npm install
cp .env.example .env         # variables VITE_* publiques
npm run start

# API
cd server
npm install
cp .env.example .env         # secrets de l'API (Neon, Clerk, IGDB)
```

Autres commandes utiles :

| Commande        | Description                                      |
| --------------- | ------------------------------------------------ |
| `npm test`      | Lance les tests Vitest                           |
| `npm run lint`  | Vérifie le code (oxlint) et le formatage (oxfmt) |
| `npm run build` | Vérifie les types et package l'application       |

## 📁 Structure

```
src/
├── main/       # Process principal Electron (fenêtres, sécurité)
├── preload/    # Pont minimal entre main et renderer
├── renderer/   # Interface Vue (pages, composants, composables)
└── shared/     # Code pur partagé avec l'API (types, notes, tris, filtres)
server/
├── prisma/     # Schéma et migrations
└── src/        # Routes Hono, accès aux données, IGDB, middleware Clerk
docs/           # Diagramme de la base de données, captures
```

---

<div align="center">

Conçu et développé par **Clément Laflamme**

</div>
