# Weekend LBN4E — Site Événement

Site statique pour le Weekend LBN4E. Style cyber-baroque : Mousquetaires × Cyberpunk × Louis XIV.

## Fonctionnalités

- **Page Maison** — hero avec compte à rebours, section infos pratiques en 2 états (scellé / affiché)
- **Page Gazette** — articles de blog triés par date, chacun avec une URL d'ancre copiable
- **Mode Admin** — protégé par mot de passe, accessible via le bouton « Sceau » en haut à droite
  - Onglet Événement : basculer affiché/scellé, modifier lieu, dates, contacts, route
  - Onglet Gazette : ajouter, éditer, supprimer des dépêches
  - Toutes les modifications sont persistées dans `localStorage`

## Mot de passe admin

```
aramis
```

Pour le changer : modifier la constante `ADMIN_PWD` dans [`app.jsx`](app.jsx).

## Déploiement sur GitHub Pages

### Méthode 1 — Dépôt public (la plus simple)

1. Créer un dépôt GitHub (ex. `lbn4e`)
2. Pousser tous les fichiers :
   ```bash
   git init
   git add .
   git commit -m "init site LBN4E"
   git remote add origin https://github.com/VOTRE-USER/lbn4e.git
   git push -u origin main
   ```
3. Dans **Settings → Pages**, choisir `main` / `/ (root)` comme source
4. Le site sera disponible à `https://VOTRE-USER.github.io/lbn4e/`

### Méthode 2 — Dépôt privé (GitHub Pro ou organisation)

Même procédure, GitHub Pages fonctionne aussi sur les dépôts privés avec GitHub Pro.

## Structure des fichiers

```
index.html               — point d'entrée
styles.css               — design tokens + styles globaux
data.js                  — données par défaut (modifiables via admin)
app.jsx                  — routing + état global + persistance localStorage
components/
  chrome.jsx             — topbar, footer, logo
  maison.jsx             — page Maison (hero, countdown, infos)
  gazette.jsx            — page Gazette (articles)
  admin.jsx              — panneau admin (login + éditeur)
```

## Développement local

Ouvrir `index.html` directement dans un navigateur ne fonctionnera pas à cause des imports de modules relatifs. Utiliser un serveur local :

```bash
# Python
python3 -m http.server 8080

# Node (npx)
npx serve .

# VS Code
# Extension « Live Server » → clic droit → Open with Live Server
```

Puis ouvrir `http://localhost:8080`.

## Personnalisation

- **Données initiales** (lieu, dates, articles) → [`data.js`](data.js)
- **Mot de passe** → constante `ADMIN_PWD` dans [`app.jsx`](app.jsx)
- **Couleurs et polices** → variables CSS dans [`styles.css`](styles.css)
- **Cible du compte à rebours** → champ `countdownISO` dans `data.js` ou via l'admin

## Note sur les données

Les modifications faites via le panneau admin sont sauvegardées dans `localStorage` du navigateur — elles persistent entre les rechargements mais sont propres à chaque navigateur/appareil. Pour propager les changements à tous les visiteurs, modifier directement [`data.js`](data.js) et re-déployer.
