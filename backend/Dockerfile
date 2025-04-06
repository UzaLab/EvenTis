# === Build Stage ===
# Utilise une image Node.js LTS comme base pour la construction
FROM node:20-alpine AS builder

# Définit le répertoire de travail dans l'image
WORKDIR /usr/src/app

# Copie les fichiers package.json et package-lock.json (ou npm-shrinkwrap.json)
# Utiliser `COPY package*.json ./` si vous avez aussi package-lock.json
COPY package.json ./
# Copie aussi le package.json racine s'il contient des dépendances pertinentes pour le workspace (à ajuster si nécessaire)
# COPY ../package.json ./root-package.json 

# Installe TOUTES les dépendances (dev incluses) pour permettre le build
RUN npm install  # <--- LIGNE MODIFIÉE ICI
# Si vous utilisez `npm ci` (basé sur package-lock):
# RUN npm ci

# Copie tout le reste du code source de l'application
COPY . .

# Construit l'application NestJS pour la production
# Assurez-vous que la commande build existe dans votre package.json
RUN npm run build

# === Production Stage ===
# Utilise une image Node.js LTS légère pour l'exécution
FROM node:20-alpine

WORKDIR /usr/src/app

# Copie les dépendances de production depuis l'étape de build
COPY --from=builder /usr/src/app/node_modules ./node_modules
# Copie l'application construite depuis l'étape de build
COPY --from=builder /usr/src/app/dist ./dist
# Copie aussi le package.json (utile pour certaines librairies ou pour savoir quelle version tourne)
COPY --from=builder /usr/src/app/package.json ./package.json

# Expose le port sur lequel l'application va écouter (doit correspondre à ce que NestJS écoute)
# Le port réel sera défini par la variable d'environnement APP_PORT ou 3001 par défaut dans main.ts
EXPOSE 3001 

# Commande pour démarrer l'application Node.js (le JS compilé dans dist/)
CMD ["node", "dist/main.js"]