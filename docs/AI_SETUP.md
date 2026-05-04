# Brancher l'IA dans FormaPredict

FormaPredict peut fonctionner en mode local sans IA. Pour activer l'analyse Claude dans `/saisie-guidee`, il faut lancer un petit serveur backend qui garde la clé API côté serveur.

## 1. Créer la configuration frontend

Copier `.env.example` vers `.env` à la racine :

```text
VITE_API_URL=http://localhost:3001
```

Cette variable est publique et ne contient pas de clé.

## 2. Créer la configuration serveur

Copier `server/.env.example` vers `server/.env` :

```text
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-sonnet-4-5
PORT=3001
```

Ne jamais mettre `ANTHROPIC_API_KEY` dans une variable `VITE_`.

## 3. Lancer le serveur IA

Dans un terminal :

```bash
npm run server
```

Le backend démarre sur :

```text
http://localhost:3001
```

## 4. Lancer l'application

Dans un autre terminal :

```bash
npm run dev
```

Puis ouvrir :

```text
http://127.0.0.1:5174/saisie-guidee
```

## 5. Utilisation

Dans la page de saisie guidée :

1. renseigner quelques champs ;
2. cliquer sur `Analyser avec l'IA` ;
3. l'application envoie au backend :
   - le candidat ;
   - la projection locale ;
   - la prochaine question locale ;
4. Claude renvoie un JSON structuré ;
5. si Claude ou le serveur est indisponible, l'application reste en mode local.

## Sécurité

- La clé Anthropic reste dans `server/.env`.
- `.env` et `server/.env` sont ignorés par Git.
- L'IA ne remplace pas le moteur local.
- Toute projection reste indicative et doit être vérifiée auprès des organismes concernés.
