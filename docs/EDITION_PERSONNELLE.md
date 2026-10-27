# Édition personnelle : mettre KODI en ligne gratuitement et l’installer sur iPhone

Décision : D-032 (27/10/2026). KODI sert à une seule personne, sans paiement
ni compte. Tout fonctionne dans le navigateur de l’iPhone ; aucune base de
données n’est nécessaire.

## Ce qui marche sans aucun service

- **S’entraîner** : séries de 10 questions, tous thèmes ou un seul thème,
  correction, explication et source après chaque question.
- **Simuler** : examen officiel simulé (40 questions, réussite à partir de 35)
  et examen express (10 questions), corrigés à la fin.
- **Apprendre**, **Révisions**, **Progression**, **Coach** : les erreurs
  alimentent les révisions ; tout est enregistré sur l’iPhone.
- **Profil > Données** : télécharger une sauvegarde et la restaurer.

## Ce qui ne marche pas, et pourquoi

- **Professeur IA** : une IA connectée est un service payant à l’usage (clé
  d’API facturée). Il reste en mode « sans IA » : explications prédéfinies.
- **Comptes en ligne et synchronisation** : demandent un projet Supabase.
  Inutile pour un seul iPhone.
- **Questions non relues** : les 136 questions réelles sont originales,
  rédigées à partir des pages officielles citées, mais **aucune n’a été
  relue** par une personne compétente. Elles ne remplacent pas un outil
  d’entraînement officiel ou d’auto-école, ni la banque officielle (1 037
  questions, avec photos et vidéos, non publique).

## Mise en ligne (gratuite, à faire une fois, depuis l’iPhone)

Hébergeur : Vercel, plan **Hobby**, gratuit et réservé à un usage personnel
non commercial (documentation Vercel « Hobby Plan », consultée le
27/10/2026).

1. Le code doit être sur la branche `main` du dépôt GitHub (l’agent le fait
   avec votre accord).
2. Dans Safari, ouvrir `vercel.com`, créer un compte en se connectant avec
   GitHub, et choisir le plan **Hobby** (gratuit). Si une carte bancaire ou
   un plan payant est demandé, s’arrêter : ce n’est pas nécessaire.
3. Créer un projet (« Add New… > Project »), choisir le dépôt `kodi`, puis
   l’importer (« Import »). Les libellés exacts peuvent varier.
4. Ne rien changer (Next.js est détecté, aucune variable à ajouter), puis
   **Deploy**. Attendre la fin (quelques minutes).
5. Ouvrir l’adresse donnée par Vercel (du type `https://…vercel.app`).

À chaque nouvelle version poussée sur `main`, Vercel remet le site à jour
tout seul.

## Installation sur l’iPhone

1. Ouvrir l’adresse du site dans **Safari**.
2. Bouton **Partager** (carré avec une flèche), puis **Sur l’écran
   d’accueil**, puis **Ajouter**.
3. Lancer KODI depuis l’icône : il s’ouvre en plein écran, comme une
   application.

## Ne pas perdre sa progression

La progression est enregistrée dans l’iPhone, pour ce site seulement. Elle
peut disparaître si les données de Safari sont effacées, si l’iPhone est
changé, ou si le système libère de la place. **Une fois par semaine** :
Profil > Données > **Télécharger mes données**, et garder le fichier (dans
Fichiers ou iCloud Drive). Pour la récupérer : **Restaurer une sauvegarde**.

## Méthode conseillée pour la dernière semaine

1. Chaque jour : une série par thème faible (S’entraîner > Thème), puis les
   révisions proposées.
2. Un examen officiel simulé tous les deux jours ; viser 35/40 ou plus.
3. En parallèle, l’outil d’entraînement de votre auto-école ou un outil
   officiel : c’est lui qui reproduit l’épreuve (photos, vidéos).
4. En cas de doute sur une correction de KODI, la source officielle citée
   sous la question fait foi.
