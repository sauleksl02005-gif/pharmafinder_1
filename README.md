# PharmaFinder Cameroun

Base de démarrage Node.js / Express / Supabase pour une plateforme de recherche de médicaments et de pharmacies.

## Prérequis

- Node.js 20 ou supérieur
- npm
- Un projet Supabase
- Un compte GitHub et Render pour le déploiement

## Installation locale

1. Décompresser le projet et ouvrir le dossier dans VS Code.
2. Installer les dépendances :

   ```bash
   npm install
   ```

3. Copier `.env.example` vers `.env`.
4. Dans Supabase, ouvrir **Project Settings > API Keys** et récupérer l'URL du projet ainsi que la clé secrète serveur (ou `service_role` pour les anciens projets).
5. Remplir les valeurs dans `.env`. Ne jamais publier ce fichier.
6. Démarrer :

   ```bash
   npm run dev
   ```

7. Ouvrir `http://localhost:3000`.
8. Tester `http://localhost:3000/api/health`. Le résultat attendu contient `"database": "connected"`.

## Déploiement sur Render

Créer un **Web Service** relié au dépôt GitHub :

- Runtime : Node
- Build Command : `npm install`
- Start Command : `npm start`

Ajouter dans **Environment** de Render :

- `SUPABASE_URL` : URL du projet Supabase
- `SUPABASE_SERVICE_ROLE_KEY` : clé secrète serveur Supabase

Render fournit automatiquement `PORT`. Ne pas ajouter `.env` à GitHub.

## Structure

- `server.js` : serveur Express
- `config/supabase.js` : client Supabase réservé au serveur
- `routes/health.js` : route de vérification
- `public/` : interface web statique

## Sécurité importante

La clé `SUPABASE_SERVICE_ROLE_KEY` contourne les règles RLS. Elle doit rester exclusivement côté serveur, dans les variables d'environnement Render ou dans le fichier `.env` local ignoré par Git. Ne jamais la placer dans `public/`, dans le navigateur, dans un dépôt Git ou dans un message public.

Cette version est un socle technique : elle ne contient pas encore l'inscription, les comptes pharmacies, l'administration ni les fonctions de recherche. Ces modules seront ajoutés et sécurisés dans les prochaines étapes. Les pharmacies et les stocks devront être vérifiés avant toute publication destinée au public.
