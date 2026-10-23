# Comptes et base de données : mise en service

État au 22/10/2026 : **aucun projet Supabase n’est configuré**. Le code, les
migrations et les tests de sécurité sont prêts ; l’application fonctionne en
**mode local** (sans compte, données sur l’appareil) tant que les variables
publiques ci-dessous ne sont pas définies.

Toutes les étapes se font dans un navigateur, depuis un iPhone. Les intitulés
des menus Supabase peuvent légèrement changer : en cas de doute, utilisez la
recherche du tableau de bord.

## 1. Créer le projet Supabase (gratuit)

1. Créez un compte sur <https://supabase.com> puis **New project**.
2. Nom : `kodi`. Région : de préférence une région de l’Union européenne
   (par exemple Paris), pour les données personnelles.
3. Choisissez un **mot de passe de base de données** fort et notez-le dans
   un gestionnaire de mots de passe : il ne sera plus affiché.
4. Plan : **Free**. Vérifiez ses limites le jour de la création (par exemple
   la mise en pause des projets inactifs).

## 2. Régler l’authentification

Dans **Authentication** :

1. **Fournisseur e-mail** : activé, avec **Confirm email** activé.
2. **Mot de passe** : longueur minimale **8**, exigence **lettres et
   chiffres** (comme dans l’application et `supabase/config.toml`).
3. **URL Configuration** : à faire quand KODI aura une adresse en ligne
   (question ouverte Q-01) :
   - *Site URL* : l’adresse de l’application, par exemple `https://kodi.exemple.fr` ;
   - *Redirect URLs* : `https://kodi.exemple.fr/auth/confirm`.
4. **Emails > Templates** : remplacez le contenu de
   - *Confirm signup* par celui de `supabase/templates/confirmation.html` ;
   - *Reset password* par celui de `supabase/templates/recovery.html`.
   Ces modèles envoient vers `/auth/confirm` avec un jeton : le lien
   fonctionne même s’il est ouvert sur un autre appareil.
5. **Envoi des e-mails** : le service intégré de Supabase est prévu pour les
   essais (quota très faible ; consultez ses limites actuelles dans la
   documentation Supabase). Pour de vrais utilisateurs, il faudra un
   service SMTP (question ouverte Q-09, peut devenir payant).

## 3. Déployer la base depuis GitHub

1. Dans Supabase : **Account > Access Tokens > Generate new token**. Copiez
   le jeton.
2. Dans Supabase : **Project Settings > General** : copiez le *Project ID*
   (identifiant de 20 caractères).
3. Sur GitHub, dépôt KODI : **Settings > Secrets and variables > Actions >
   New repository secret**, trois fois :
   - `SUPABASE_ACCESS_TOKEN` : le jeton de l’étape 1 ;
   - `SUPABASE_PROJECT_REF` : l’identifiant de l’étape 2 ;
   - `SUPABASE_DB_PASSWORD` : le mot de passe de base de données.
4. Sur GitHub : **Actions > Base Supabase — déployer > Run workflow**.
   - Laissez d’abord **dry_run** coché : le journal liste les migrations qui
     seraient appliquées, sans rien modifier.
   - Relancez en décochant **dry_run** pour appliquer réellement les
     migrations et charger les 68 questions **en relecture** (non publiques).

## 4. Brancher l’application

Dans **Project Settings > API Keys**, relevez :

- l’URL du projet (`https://<id>.supabase.co`) ;
- la clé **publishable** (`sb_publishable_…`).

Ces deux valeurs sont **publiques** par conception. Elles se définissent chez
l’hébergeur de l’application (pas encore choisi, Q-01) :

```
NEXT_PUBLIC_SUPABASE_URL=https://<id>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_…
```

> **Ne jamais** placer la clé secrète (`sb_secret_…`) ou `service_role` dans
> l’application, le dépôt ou une variable `NEXT_PUBLIC_…`. Si cela arrivait,
> KODI la refuse et reste en mode local. L’application n’utilise aucune clé
> secrète : toute la sécurité repose sur RLS.

## 5. Devenir relecteur des questions

Après avoir créé votre compte dans KODI et confirmé votre adresse :
Supabase > **SQL Editor** > exécutez (avec votre adresse) :

```sql
insert into public.staff (user_id, role)
select id, 'editor' from auth.users where email = 'votre@adresse.fr';
```

Les contenus que vous validez (par exemple dans `docs/RELECTURE.md`) sont
passés au statut « validé » dans `content/` par l’agent, avec la trace de la
relecture, puis publiés en base par l’import `supabase/seed/content.sql`
(workflow de déploiement). Voir `docs/CONTENU.md`.

## Ce qui est vérifié automatiquement

`npm run test:db` (et la CI) applique toutes les migrations sur un
PostgreSQL réel qui reproduit les rôles et privilèges par défaut de Supabase,
puis vérifie notamment :

- RLS actif sur toutes les tables, droits accordés au strict nécessaire ;
- isolation des données entre utilisateurs (lecture et modification) ;
- contenus non publiés invisibles, bonnes réponses illisibles ;
- aucune bonne réponse exposée avant la remise d’un examen ;
- impossibilité de falsifier un score, un examen ou un abonnement ;
- journal d’audit en ajout seul.

Limite : ces tests n’exécutent pas Supabase lui-même (Auth, PostgREST,
Realtime). Le parcours complet (inscription, e-mail, lien, synchronisation
entre deux appareils) reste à vérifier manuellement une fois le projet créé
et l’application hébergée.
