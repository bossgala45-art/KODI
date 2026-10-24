# Freemium et paiements (Stripe)

État au 24/10/2026 : **aucun paiement n’est possible.** Stripe n’est pas
configuré, aucun compte Stripe n’existe pour KODI et aucune somme n’a jamais
été prélevée. L’intégration est prête et testée sans réseau. Les pages le
disent : « Paiement non disponible ».

Décisions : `docs/DECISIONS.md`, D-030. Questions ouvertes : Q-16 à Q-21.

## Offres

| Fonctionnalité | Gratuit | Premium | Contrôle du droit |
| --- | --- | --- | --- |
| Cours | Cours essentiels (`access: "gratuit"`) | Tous (`access: "premium"`) | **Serveur** (RLS sur `lessons`) ; voir la limite ci-dessous |
| Quiz, entraînement, corrections | Inclus | Inclus | — |
| Examens blancs | 1 par jour (jour civil de Paris), tous modes | Illimités | **Serveur** (`start_exam_mode`) |
| Scènes 3D | Scènes de découverte (`DISCOVERY_SCENES`) | Toutes | Appareil |
| Statistiques | Essentielles | Avancées (par mode, sessions détaillées) | Appareil |
| Coach | Basique | Étendu (révisions sur 7 jours, suivi des examens) | Appareil |
| Professeur IA | Explications prédéfinies | IA selon les quotas (D-029) | **Serveur** (`/api/professeur`) |

Prix **envisagé** : 4,99 € TTC par mois, **à confirmer** avant toute
commercialisation (`ENVISAGED_PRICE.confirmed = false`). Tant qu’il n’est pas
confirmé, la production Stripe est refusée par le code.

« Appareil » : les statistiques, le coach et les scènes sont calculés sur
l’appareil, à partir des données de la personne. Le verrou est un choix
d’offre, pas une protection : quelqu’un qui modifie l’application peut le
contourner, sans accéder à aucune donnée du serveur.

**Limite connue** : le dépôt est public. Le texte d’une leçon Premium écrite
dans `content/` serait lisible sur GitHub et dans le code de la page, même si
la base ne le sert qu’aux abonnés. Aucune leçon n’est Premium aujourd’hui
(Q-18).

## Fonctionnement

- **Souscription** : page Premium → acceptation des CGV, demande d’accès
  immédiat → bouton « Commander avec obligation de paiement » →
  `POST /api/paiement/session` → page de paiement **Stripe Checkout**
  (abonnement mensuel, Stripe Billing).
- **Droits** : écrits uniquement par le **webhook** `POST /api/stripe/webhook`.
  La signature `Stripe-Signature` est vérifiée sur le corps brut avec le
  secret du point de terminaison (SDK officiel `stripe`, tolérance de 5
  minutes contre le rejeu). Pour chaque événement lié à un abonnement,
  l’abonnement à jour est relu chez Stripe : l’ordre de livraison n’a donc
  pas d’importance.
- **Idempotence** : l’identifiant de l’événement est enregistré dans
  `private.billing_events` par la même fonction SQL qui applique le
  changement (`public.billing_apply_subscription`, réservée à
  `service_role`). Un événement reçu deux fois n’est appliqué qu’une fois.
  Si Stripe est injoignable, la route répond 500 et rien n’est enregistré :
  Stripe renvoie l’événement (jusqu’à 3 jours en production).
- **Statuts Stripe → accès** : `active`, `trialing`, `past_due` donnent
  Premium ; `canceled`, `unpaid`, `incomplete`, `incomplete_expired`,
  `paused` le retirent. Marge de 2 jours après la fin de période si le
  renouvellement n’est pas encore arrivé.
- **Échec de paiement** : `past_due` garde l’accès pendant les relances de
  Stripe ; la page « Mon abonnement » demande de mettre à jour le moyen de
  paiement (portail client Stripe). Après les relances, Stripe passe
  l’abonnement en `canceled` ou `unpaid` (réglage du tableau de bord) et
  l’accès est retiré.
- **Résiliation en 3 clics** : « Résilier votre contrat » → récapitulatif
  (compte, contrat, date de fin, effets) → « Notifier la résiliation ». La
  fin a lieu à l’échéance déjà payée, sans frais. Un accusé de réception
  s’affiche à l’écran (date et heure).
- **Rétractation** : « Renoncer au contrat ici », proposé pendant le délai
  (14 jours à compter du lendemain, reporté après un week-end, plus 2 jours
  de marge pour les jours fériés) → « Confirmer la rétractation » → arrêt
  immédiat et **remboursement intégral** du dernier paiement. Si le
  remboursement échoue, la page le dit et il doit être fait à la main.
- **Sécurité des routes** : session Supabase obligatoire, origine de la
  requête vérifiée, secrets lus par `src/lib/billing/server.ts` seulement
  (`server-only`, un test le vérifie).
- **Test d’abord** : une clé `sk_live_…` est refusée sauf si
  `KODI_BILLING_ALLOW_LIVE=oui` **et** prix confirmé **et** informations du
  vendeur complètes (`src/content/legal.ts`). En mode test, chaque page de
  paiement l’annonce.

## Obligations commerciales vérifiées

Sources consultées le 24/10/2026 (pages officielles lues en entier ;
Légifrance n’est pas accessible depuis l’environnement de développement : les
articles cités le sont par ces pages).

| Obligation | Source | Dans KODI |
| --- | --- | --- |
| Information précontractuelle : caractéristiques, prix TTC, durée de l’abonnement, résiliation, droit de rétractation, identité du vendeur, médiateur | Entreprendre Service-Public, « Conditions générales de vente » (F33527, vérifiée le 01/07/2026) et « Faire du commerce en ligne » (F23455, vérifiée le 19/06/2026) | Page Premium : offre, prix TTC, durée, résiliation, rétractation. **Manque** : identité du vendeur, médiateur, CGV (Q-16, Q-17) |
| Prix affiché en euros TTC | Entreprendre Service-Public, « Affichage des prix » (F34344) | « 4,99 € TTC par mois » |
| Commande en 3 étapes, bouton « Commande avec obligation de paiement » ou formule sans ambiguïté | F23455 | Bouton « Commander avec obligation de paiement » ; récapitulatif et validation sur la page Stripe. **[À VÉRIFIER]** : libellé du bouton de Stripe Checkout |
| Droit de rétractation de 14 jours ; pour un service dont l’exécution commence pendant le délai, à la demande expresse | Service-Public, « Achat à distance : droit de rétractation » (F10485, vérifiée le 01/01/2026) | Rétractation proposée et remboursement intégral (plus favorable que le minimum) |
| Fonctionnalité de rétractation en ligne (« renoncer au contrat ici », « confirmer la rétractation »), accusé de réception sur support durable, depuis le 19/06/2026 | F23455 | Fonctionnalité en place ; accusé à l’écran. **Manque** : accusé par e-mail (Q-19) |
| Résiliation « en 3 clics », gratuite, sans création d’un espace personnel ; confirmation de réception et date de fin | Entreprendre Service-Public, actualité A16599 (mise à jour le 14/09/2023, signalée « ancienne » par le site) | Parcours en 3 clics, confirmation à l’écran. **Manque** : résiliation sans connexion et confirmation par e-mail (Q-19) |
| Mentions légales : identité, coordonnées, immatriculation, TVA, hébergeur, directeur de la publication | Entreprendre Service-Public, « Mentions obligatoires sur le site internet » (F37351, vérifiée le 13/10/2026) | Page « Mentions légales » : **pas encore publiée** (Q-16) |
| Médiateur de la consommation : coordonnées et site sur le site, les CGV et les bons de commande | economie.gouv.fr (médiation de la consommation), lu via la recherche : page protégée contre les robots, **non relue en entier** **[À VÉRIFIER]** | À désigner (Q-17, coût éventuel) |
| Données personnelles (RGPD), cookies | F23455 | Politique de confidentialité à rédiger avant le lancement (phase 11) |

Hors de portée de l’agent : choix de la structure juridique, TVA
(franchise ou non), immatriculation, choix du médiateur. **Aucune de ces
informations n’est inventée** : `src/content/legal.ts` est vide.

## Hébergement : conditions vérifiées

- **Vercel, plan Hobby** (gratuit) : « restricted to non-commercial personal
  use only. All commercial usage of the platform requires either a Pro or
  Enterprise plan » (vercel.com/docs/limits/fair-use-guidelines, lu le
  24/10/2026). Un site avec abonnement payant est un usage commercial :
  **Hobby est exclu pour la vente** ; le plan Pro est payant (Q-02).
- **Netlify** : un plan gratuit existe (« Build and deploy free forever »,
  300 crédits par mois, netlify.com/pricing lu le 24/10/2026). Ses conditions
  d’usage commercial n’ont **pas** été vérifiées **[À VÉRIFIER]**.
- **Cloudflare** : non vérifié **[À VÉRIFIER]**.
- Le webhook exige une adresse publique en HTTPS (`KODI_SITE_URL`) : pas de
  paiement de test de bout en bout sans hébergement (Q-01).

## Coûts Stripe (dépense future, Q-20)

Tarifs publics (stripe.com/fr/pricing, lus le 24/10/2026) : cartes standard
de l’Espace économique européen **1,5 % + 0,25 €** par paiement réussi ;
Stripe Billing **0,7 %** du volume (paiement à l’utilisation). Pour
4,99 € : environ 0,07 € + 0,25 € + 0,03 € ≈ **0,36 €** par mois et par
abonné (calcul, pas une mesure ; hors TVA et autres frais éventuels). Aucun
abonnement mensuel Stripe n’est nécessaire. Stripe Tax n’est pas utilisé.

## Actions manuelles (par le porteur, depuis un navigateur)

À faire seulement après validation de cette phase, dans l’ordre.

1. **Hébergement** (Q-01, Q-02) : choisir un hébergeur compatible avec un
   usage commercial et obtenir l’adresse publique (`https://…`).
2. **Supabase** : déployer les migrations (docs/SUPABASE.md), puis relever la
   **clé secrète** (`sb_secret_…`, Project Settings > API Keys) : elle se
   met **uniquement** dans les variables de l’hébergeur, jamais dans le dépôt
   ni dans une variable `NEXT_PUBLIC_`.
3. **Compte Stripe** (gratuit à l’ouverture) : créer le compte et rester
   dans un **environnement de test (sandbox)**.
4. **Produit et prix** (sandbox) : produit « KODI Premium », prix récurrent
   **mensuel** 4,99 € (EUR). Relever l’identifiant `price_…`.
5. **Webhook** (Workbench > Webhooks, sandbox) : point de terminaison
   `https://<adresse>/api/stripe/webhook`, événements :
   `checkout.session.completed`, `customer.subscription.created`,
   `customer.subscription.updated`, `customer.subscription.deleted`,
   `customer.subscription.paused`, `customer.subscription.resumed`,
   `invoice.paid`, `invoice.payment_failed`. Relever le secret `whsec_…`.
6. **Portail client** (Paramètres > Billing > Portail client, sandbox) :
   autoriser la mise à jour du moyen de paiement et l’historique des
   factures. Les intitulés exacts des réglages sont **[À VÉRIFIER]** le jour
   même.
7. **Relances et e-mails** (Paramètres > Billing) : activer les nouvelles
   tentatives de paiement, choisir l’état final après échec (`canceled`
   recommandé), activer les e-mails de reçu et de remboursement. Intitulés
   **[À VÉRIFIER]**.
8. **Variables chez l’hébergeur** (jamais dans le dépôt) :

   ```
   STRIPE_SECRET_KEY=sk_test_…
   STRIPE_WEBHOOK_SECRET=whsec_…
   STRIPE_PRICE_ID=price_…
   KODI_SITE_URL=https://<adresse>
   SUPABASE_SECRET_KEY=sb_secret_…
   ```

9. **Essais en mode test** : s’abonner avec une carte de test Stripe,
   vérifier « Mon abonnement », résilier, se rétracter, simuler un échec de
   paiement (cartes de test de Stripe), vérifier que les droits suivent.
10. **Avant la production** (après validation explicite du porteur) :
    structure juridique et informations du vendeur dans
    `src/content/legal.ts`, CGV et mentions légales rédigées et relues,
    médiateur désigné, accusés de réception par e-mail, prix confirmé
    (`ENVISAGED_PRICE.confirmed = true`), politique de confidentialité ;
    puis copier le produit en production, créer le webhook de production,
    remplacer les clés par `sk_live_…` et ajouter
    `KODI_BILLING_ALLOW_LIVE=oui`. Le code refuse la production tant qu’un
    de ces points manque.

## Code

```
supabase/migrations/20261025120000_billing.sql  abonnements, événements, droits, 1 examen/jour, leçons Premium
supabase/tests/billing.test.ts                  tests sur PostgreSQL réel
src/lib/billing/plans.ts                        offres, prix envisagé
src/lib/billing/config.ts                       configuration (test d'abord, garde-fous de production)
src/lib/billing/stripe-events.ts                événements Stripe → abonnement
src/lib/billing/service.ts                      paiement, portail, résiliation, rétractation, webhook
src/lib/billing/withdrawal.ts                   délai de rétractation
src/lib/billing/server.ts, http.ts              clés et routes (serveur uniquement)
src/lib/billing/use-entitlements.ts             droits pour l'affichage
src/app/api/paiement/*, src/app/api/stripe/webhook
src/components/billing/                         verrou Premium, souscription, abonnement
src/content/legal.ts                            informations du vendeur (vides)
```
