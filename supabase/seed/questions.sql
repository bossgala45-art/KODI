-- FICHIER GÉNÉRÉ par « npm run seed:questions » : ne pas modifier à la main.
-- Charge les questions de l'examen blanc au statut « in_review » (non publiques).
-- Rejouable : les questions déjà publiées ne sont pas modifiées.

create or replace function pg_temp.seed_question(
  p_ref text, p_topic text, p_prompt text, p_explanation text, p_sources jsonb,
  p_choices text[], p_correct int[]
) returns void language plpgsql as $$
declare
  qid uuid;
  current_status public.content_status;
  cid uuid;
begin
  select id, status into qid, current_status from public.questions where external_ref = p_ref;
  if current_status = 'published' then
    return;
  end if;
  if qid is null then
    insert into public.questions (external_ref, topic, prompt, explanation, sources, status)
    values (p_ref, p_topic, p_prompt, p_explanation, p_sources, 'in_review')
    returning id into qid;
  else
    update public.questions
    set topic = p_topic, prompt = p_prompt, explanation = p_explanation, sources = p_sources
    where id = qid;
    delete from public.question_choices where question_id = qid;
  end if;
  for i in 1 .. array_length(p_choices, 1) loop
    insert into public.question_choices (question_id, position, label)
    values (qid, i - 1, p_choices[i])
    returning id into cid;
    if (i - 1) = any (p_correct) then
      insert into public.question_answers (question_id, choice_id) values (qid, cid);
    end if;
  end loop;
end;
$$;

begin;

select pg_temp.seed_question(
  'ex-001', 'Priorités',
  'J’arrive à une intersection sans panneau, sans feu et sans agent. Un véhicule arrive par la route située à ma droite. Je dois :',
  'Sans signalisation, le conducteur venant par la gauche doit céder le passage : c’est la priorité à droite.',
  '[{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb,
  array['Lui céder le passage', 'Passer en premier', 'Passer en premier si ma route est plus large']::text[],
  array[0]::int[]
);

select pg_temp.seed_question(
  'ex-002', 'Priorités',
  'À une intersection, le feu est vert pour moi, mais un agent de la circulation m’ordonne de m’arrêter. J’obéis :',
  'Les indications d’un agent de la circulation priment sur les feux et sur les panneaux.',
  '[{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb,
  array['Au feu', 'À l’agent', 'Au panneau placé à l’intersection']::text[],
  array[1]::int[]
);

select pg_temp.seed_question(
  'ex-003', 'Priorités',
  'Le feu d’une intersection ne fonctionne pas. Un panneau « Cédez le passage » est placé de mon côté. Je dois :',
  'Les feux priment sur les panneaux ; si le feu ne fonctionne pas, on applique la règle de priorité indiquée par le panneau.',
  '[{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb,
  array['Appliquer la règle indiquée par le panneau', 'Passer : le feu étant éteint, je suis prioritaire', 'Appliquer obligatoirement la priorité à droite']::text[],
  array[0]::int[]
);

select pg_temp.seed_question(
  'ex-004', 'Priorités',
  'J’arrive à une intersection marquée d’un panneau « Stop ». Je dois :',
  'Au « Stop », il faut s’arrêter et laisser passer les conducteurs venant de droite et de gauche avant de s’engager.',
  '[{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb,
  array['Marquer l’arrêt', 'Laisser passer les véhicules venant de droite et de gauche', 'Seulement ralentir si la voie paraît libre']::text[],
  array[0, 1]::int[]
);

select pg_temp.seed_question(
  'ex-005', 'Priorités',
  'Je sors d’un parking privé pour m’engager sur la route. Suis-je prioritaire sur les véhicules qui y circulent ?',
  'Le conducteur qui débouche d’un accès non ouvert à la circulation publique (parking, chemin de terre, sortie privée) n’est pas prioritaire : il s’engage seulement s’il peut le faire sans danger.',
  '[{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb,
  array['Oui', 'Non']::text[],
  array[1]::int[]
);

select pg_temp.seed_question(
  'ex-006', 'Priorités',
  'Un véhicule de pompiers arrive derrière moi, gyrophare et sirène en marche. Je dois :',
  'Les véhicules d’intérêt général prioritaires qui annoncent leur approche par leurs avertisseurs doivent pouvoir passer : il faut leur céder le passage et leur faciliter croisement et dépassement.',
  '[{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb,
  array['Lui faciliter le passage', 'Continuer normalement, sauf s’il me fait un signe', 'Accélérer pour rester devant lui']::text[],
  array[0]::int[]
);

select pg_temp.seed_question(
  'ex-007', 'Priorités',
  'Un engin de service hivernal circule avec son gyrophare allumé. Il bénéficie de la facilité de passage. Aux intersections, il est :',
  'Il faut faciliter son croisement et son dépassement, mais un véhicule bénéficiant de la facilité de passage n’est pas prioritaire aux intersections.',
  '[{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb,
  array['Prioritaire sur tous les usagers', 'Soumis aux règles de priorité habituelles']::text[],
  array[1]::int[]
);

select pg_temp.seed_question(
  'ex-008', 'Priorités',
  'Je veux tourner à gauche à une intersection. Une voiture arrive en face de moi. Je dois :',
  'Le conducteur qui tourne à gauche doit céder le passage aux véhicules qui arrivent en face de lui.',
  '[{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb,
  array['La laisser passer', 'Passer avant elle', 'Passer avant elle si j’ai mis mon clignotant']::text[],
  array[0]::int[]
);

select pg_temp.seed_question(
  'ex-009', 'Priorités',
  'Le feu est vert, mais l’intersection est encombrée : si je m’engage, je risque d’y rester bloqué. Je m’engage :',
  'On ne doit s’engager dans une intersection que si son véhicule ne risque pas d’y être immobilisé et d’empêcher le passage des autres.',
  '[{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb,
  array['Oui, le feu est vert', 'Non']::text[],
  array[1]::int[]
);

select pg_temp.seed_question(
  'ex-010', 'Priorités',
  'Un piéton attend au bord d’un passage piéton et montre son intention de traverser. Je dois :',
  'Il faut céder le passage aux piétons engagés sur un passage piéton ou souhaitant le faire.',
  '[{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb,
  array['Lui céder le passage', 'Passer : il n’est pas encore engagé']::text[],
  array[0]::int[]
);

select pg_temp.seed_question(
  'ex-011', 'Priorités',
  'Ne pas respecter une règle de priorité (par exemple la priorité à droite) entraîne de plein droit un retrait de :',
  'Cette contravention de 4ᵉ classe entraîne de plein droit la réduction de quatre points du permis de conduire.',
  '[{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb,
  array['2 points', '4 points', '6 points']::text[],
  array[1]::int[]
);

select pg_temp.seed_question(
  'ex-012', 'Autoroute',
  'Je rejoins une autoroute par une bretelle puis une voie d’accélération. Je dois :',
  'Le conducteur qui rejoint l’autoroute doit céder le passage aux véhicules qui y circulent, en accélérant suffisamment pour s’insérer sans gêner.',
  '[{"title":"Autoroute","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/autoroute","consulted_at":"2026-10-22"},{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb,
  array['Accélérer suffisamment pour m’insérer sans gêner', 'Céder le passage aux véhicules circulant sur l’autoroute', 'M’arrêter systématiquement au bout de la voie']::text[],
  array[0, 1]::int[]
);

select pg_temp.seed_question(
  'ex-013', 'Croisement et dépassement',
  'Hors agglomération, je croise un cycliste. Je dois laisser une distance latérale d’au moins :',
  'Hors agglomération, il faut laisser au moins 1,50 m latéralement avec les deux-roues et les piétons.',
  '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb,
  array['50 cm', '1 m', '1,50 m']::text[],
  array[2]::int[]
);

select pg_temp.seed_question(
  'ex-014', 'Croisement et dépassement',
  'En agglomération, je croise un piéton qui marche au bord de la chaussée. Je dois laisser une distance latérale d’au moins :',
  'En agglomération, la distance minimale est de 1 m avec les deux-roues et les piétons.',
  '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb,
  array['50 cm', '1 m', '1,50 m']::text[],
  array[1]::int[]
);

select pg_temp.seed_question(
  'ex-015', 'Croisement et dépassement',
  'Au milieu de la chaussée, une ligne mixte est continue du côté de la voie d’en face et discontinue de mon côté. La voie est libre et dégagée. Ai-je le droit de dépasser ?',
  'Une ligne mixte discontinue de son côté autorise le dépassement, à condition qu’il se fasse sans danger.',
  '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb,
  array['Oui', 'Non']::text[],
  array[0]::int[]
);

select pg_temp.seed_question(
  'ex-016', 'Croisement et dépassement',
  'Je m’apprête à dépasser quand j’aperçois une première flèche de rabattement au sol. Je :',
  'Les flèches de rabattement annoncent une ligne continue ou la fin d’un créneau de dépassement : il faut renoncer à dépasser dès la première flèche.',
  '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb,
  array['Renonce à dépasser', 'Dépasse rapidement avant la ligne continue']::text[],
  array[0]::int[]
);

select pg_temp.seed_question(
  'ex-017', 'Croisement et dépassement',
  'Je peux entreprendre un dépassement si :',
  'Il faut notamment une bonne visibilité vers l’avant et la possibilité de reprendre sa place sans gêner ; il est interdit de dépasser quand on est soi-même sur le point d’être dépassé.',
  '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb,
  array['J’ai une bonne visibilité vers l’avant', 'Je suis moi-même sur le point d’être dépassé', 'Je peux reprendre ma place sans gêner la circulation']::text[],
  array[0, 2]::int[]
);

select pg_temp.seed_question(
  'ex-018', 'Croisement et dépassement',
  'Je suis sur le point d’être dépassé. Je dois :',
  'Le conducteur sur le point d’être dépassé doit serrer immédiatement sur sa droite sans accélérer l’allure.',
  '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb,
  array['Serrer à droite sans accélérer', 'Accélérer pour ne pas gêner', 'Freiner fortement']::text[],
  array[0]::int[]
);

select pg_temp.seed_question(
  'ex-019', 'Croisement et dépassement',
  'La voiture devant moi signale qu’elle va tourner à gauche et l’espace à sa droite est suffisant. Je la dépasse :',
  'Les dépassements se font par la gauche, sauf exceptions : on dépasse par la droite le conducteur qui signale qu’il change de direction vers la gauche, si l’espace est suffisant.',
  '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb,
  array['Par la droite', 'Par la gauche']::text[],
  array[0]::int[]
);

select pg_temp.seed_question(
  'ex-020', 'Croisement et dépassement',
  'Sur une route à double sens, j’approche du sommet d’une côte et je ne vois pas assez loin devant moi. Je dépasse la voiture qui me précède :',
  'Tout dépassement est interdit sur une route à double sens lorsque la visibilité vers l’avant est insuffisante, notamment au sommet d’une côte.',
  '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb,
  array['Oui, si je klaxonne', 'Non']::text[],
  array[1]::int[]
);

select pg_temp.seed_question(
  'ex-021', 'Croisement et dépassement',
  'À une intersection, je peux dépasser :',
  'Aux intersections, tout dépassement autre que celui des véhicules à deux roues est interdit.',
  '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb,
  array['Une voiture', 'Un véhicule à deux roues', 'Un camion']::text[],
  array[1]::int[]
);

select pg_temp.seed_question(
  'ex-022', 'Croisement et dépassement',
  'Un tramway est arrêté et des voyageurs descendent du côté où je voudrais le dépasser. Je peux le dépasser de ce côté :',
  'Il est interdit de dépasser un tramway à l’arrêt du côté où s’effectuent la montée ou la descente des voyageurs.',
  '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb,
  array['Oui, au pas', 'Non']::text[],
  array[1]::int[]
);

select pg_temp.seed_question(
  'ex-023', 'Éclairage et météo',
  'La nuit, hors agglomération, je roule en feux de route et une voiture arrive en face. Je dois :',
  'Au moment de croiser un autre véhicule, il faut utiliser les feux de croisement, suffisamment tôt pour ne pas éblouir.',
  '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb,
  array['Passer en feux de croisement', 'Garder mes feux de route', 'Allumer mes feux de brouillard']::text[],
  array[0]::int[]
);

select pg_temp.seed_question(
  'ex-024', 'Éclairage et météo',
  'La nuit, hors agglomération, je suis une voiture à faible distance sans vouloir la dépasser. J’utilise :',
  'Quand on suit un autre véhicule à faible distance (hors manœuvre de dépassement), on circule en feux de croisement pour ne pas éblouir.',
  '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb,
  array['Mes feux de croisement', 'Mes feux de route']::text[],
  array[0]::int[]
);

select pg_temp.seed_question(
  'ex-025', 'Éclairage et météo',
  'Il pleut fortement, sans brouillard ni neige. J’allume mes feux de brouillard arrière :',
  'Les feux de brouillard arrière sont très éblouissants : seulement en cas de brouillard ou de chute de neige, jamais sous la pluie.',
  '[{"title":"Conduire par temps de brouillard","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-selon-la-meteo/conduire-par-temps-de-brouillard","consulted_at":"2026-10-22"}]'::jsonb,
  array['Oui', 'Non']::text[],
  array[1]::int[]
);

select pg_temp.seed_question(
  'ex-026', 'Éclairage et météo',
  'En entrant dans un tunnel bien éclairé, j’allume :',
  'En entrant dans un tunnel, il faut allumer les feux de croisement, même si le tunnel est éclairé.',
  '[{"title":"Conduire dans un tunnel","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/conduire-dans-un-tunnel","consulted_at":"2026-10-22"}]'::jsonb,
  array['Mes feux de croisement', 'Aucun feu : le tunnel est éclairé', 'Mes feux de brouillard arrière']::text[],
  array[0]::int[]
);

select pg_temp.seed_question(
  'ex-027', 'Autoroute',
  'Sur autoroute, j’ai manqué ma sortie. J’ai le droit de faire marche arrière sur la bande d’arrêt d’urgence :',
  'Sur autoroute, la marche arrière et le demi-tour sont interdits, même par une interruption du terre-plein central.',
  '[{"title":"Autoroute","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/autoroute","consulted_at":"2026-10-22"}]'::jsonb,
  array['Oui, si personne n’arrive', 'Non']::text[],
  array[1]::int[]
);

select pg_temp.seed_question(
  'ex-028', 'Autoroute',
  'Parmi ces usagers, lesquels sont interdits sur autoroute ?',
  'L’autoroute est notamment interdite aux piétons, aux animaux, aux véhicules sans moteur et aux cyclomoteurs. Les motocyclettes ne figurent pas dans cette liste.',
  '[{"title":"Autoroute","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/autoroute","consulted_at":"2026-10-22"}]'::jsonb,
  array['Les piétons', 'Les cyclomoteurs', 'Les motocyclettes']::text[],
  array[0, 1]::int[]
);

select pg_temp.seed_question(
  'ex-029', 'Autoroute',
  'Sur autoroute, je peux m’arrêter sur la bande d’arrêt d’urgence :',
  'Sauf nécessité absolue, il est interdit de s’arrêter ou de stationner sur la bande d’arrêt d’urgence.',
  '[{"title":"Autoroute","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/autoroute","consulted_at":"2026-10-22"}]'::jsonb,
  array['Pour téléphoner', 'Uniquement en cas de nécessité absolue', 'Pour me reposer quelques minutes']::text[],
  array[1]::int[]
);

select pg_temp.seed_question(
  'ex-030', 'Autoroute',
  'Ma voiture tombe en panne sur autoroute ; je l’arrête sur la bande d’arrêt d’urgence. Je :',
  'Feux de détresse, gilet porté avant de sortir, puis tout le monde à l’abri derrière la barrière de sécurité en attendant les secours.',
  '[{"title":"Véhicule en panne : conseils pratiques","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/vehicule-en-panne-conseils-pratiques","consulted_at":"2026-10-22"},{"title":"Équipements obligatoires en voiture","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-modes-de-deplacements/en-voiture/equipements-obligatoires-en-voiture","consulted_at":"2026-10-22"}]'::jsonb,
  array['Allume mes feux de détresse', 'Enfile mon gilet avant de sortir', 'Mets mes passagers à l’abri derrière la barrière de sécurité', 'Reste dans la voiture avec mes passagers']::text[],
  array[0, 1, 2]::int[]
);

select pg_temp.seed_question(
  'ex-031', 'Autoroute',
  'Après un arrêt d’urgence sur la bande d’arrêt d’urgence d’une autoroute, je sors de mon véhicule :',
  'Sur autoroute, revêtu de son gilet, le conducteur sort côté passager et se place au plus vite derrière les glissières.',
  '[{"title":"Équipements obligatoires en voiture","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-modes-de-deplacements/en-voiture/equipements-obligatoires-en-voiture","consulted_at":"2026-10-22"}]'::jsonb,
  array['Côté conducteur', 'Côté passager']::text[],
  array[1]::int[]
);

select pg_temp.seed_question(
  'ex-032', 'Vitesse',
  'Sur autoroute, par temps de pluie, la vitesse maximale autorisée pour une voiture (hors permis probatoire) est de :',
  'Sur autoroute : 130 km/h en conditions normales, 110 km/h par temps de pluie ou autres précipitations.',
  '[{"title":"Réglementation de la vitesse au volant","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-risques/reglementation-de-la-vitesse-au-volant","consulted_at":"2026-10-22"}]'::jsonb,
  array['130 km/h', '110 km/h', '90 km/h']::text[],
  array[1]::int[]
);

select pg_temp.seed_question(
  'ex-033', 'Vitesse',
  'Le brouillard réduit la visibilité à moins de 50 mètres. Sur autoroute, la vitesse maximale autorisée est de :',
  'Par visibilité inférieure à 50 m, la vitesse maximale est abaissée à 50 km/h sur l’ensemble du réseau.',
  '[{"title":"Réglementation de la vitesse au volant","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-risques/reglementation-de-la-vitesse-au-volant","consulted_at":"2026-10-22"},{"title":"Conduire par temps de brouillard","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-selon-la-meteo/conduire-par-temps-de-brouillard","consulted_at":"2026-10-22"}]'::jsonb,
  array['50 km/h', '70 km/h', '90 km/h']::text[],
  array[0]::int[]
);

select pg_temp.seed_question(
  'ex-034', 'Vitesse',
  'J’ai mon permis depuis un an (permis probatoire, sans apprentissage anticipé). Sur une autoroute limitée à 130 km/h, par beau temps, je ne dois pas dépasser :',
  'Pendant la période probatoire, la vitesse est limitée à 110 km/h sur autoroute.',
  '[{"title":"Réglementation de la vitesse au volant","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-risques/reglementation-de-la-vitesse-au-volant","consulted_at":"2026-10-22"}]'::jsonb,
  array['130 km/h', '110 km/h', '90 km/h']::text[],
  array[1]::int[]
);

select pg_temp.seed_question(
  'ex-035', 'Vitesse',
  'En agglomération, sauf signalisation contraire, la vitesse maximale autorisée est de :',
  'En agglomération, la vitesse est limitée à 50 km/h.',
  '[{"title":"Réglementation de la vitesse au volant","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-risques/reglementation-de-la-vitesse-au-volant","consulted_at":"2026-10-22"}]'::jsonb,
  array['30 km/h', '50 km/h', '70 km/h']::text[],
  array[1]::int[]
);

select pg_temp.seed_question(
  'ex-036', 'Vitesse',
  'Hors agglomération, sur une route à double sens sans séparateur central, la vitesse maximale est en principe de :',
  '80 km/h en principe ; le président du conseil départemental peut la relever à 90 km/h, après avis du préfet et de la commission départementale de sécurité routière.',
  '[{"title":"Réglementation de la vitesse au volant","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-risques/reglementation-de-la-vitesse-au-volant","consulted_at":"2026-10-22"}]'::jsonb,
  array['80 km/h', '100 km/h', '110 km/h']::text[],
  array[0]::int[]
);

select pg_temp.seed_question(
  'ex-037', 'Vitesse',
  'Sur une route limitée à 50 km/h, l’excès de vitesse retenu contre moi est de 14 km/h. Je perds :',
  'Un excès de moins de 20 km/h, là où la vitesse maximale est inférieure ou égale à 50 km/h, entraîne le retrait d’un point (et une amende forfaitaire de 135 €).',
  '[{"title":"Réglementation de la vitesse au volant","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-risques/reglementation-de-la-vitesse-au-volant","consulted_at":"2026-10-22"}]'::jsonb,
  array['1 point', '2 points', '3 points']::text[],
  array[0]::int[]
);

select pg_temp.seed_question(
  'ex-038', 'Alcool et stupéfiants',
  'Je suis titulaire d’un permis probatoire. Le taux d’alcool à ne pas atteindre est de :',
  'Pour les permis probatoires et les conducteurs en apprentissage, la limite est de 0,2 g/l de sang (0,10 mg/l d’air expiré).',
  '[{"title":"Réglementation de l’alcool au volant","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-risques/reglementation-de-lalcool-au-volant","consulted_at":"2026-10-22"}]'::jsonb,
  array['0,2 g par litre de sang', '0,5 g par litre de sang', '0,8 g par litre de sang']::text[],
  array[0]::int[]
);

select pg_temp.seed_question(
  'ex-039', 'Alcool et stupéfiants',
  'La limite de 0,5 g d’alcool par litre de sang correspond, dans l’air expiré, à :',
  '0,5 g/l de sang équivaut à 0,25 mg/l d’air expiré.',
  '[{"title":"Réglementation de l’alcool au volant","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-risques/reglementation-de-lalcool-au-volant","consulted_at":"2026-10-22"}]'::jsonb,
  array['0,10 mg par litre', '0,25 mg par litre', '0,40 mg par litre']::text[],
  array[1]::int[]
);

select pg_temp.seed_question(
  'ex-040', 'Alcool et stupéfiants',
  'Pour faire baisser plus vite mon taux d’alcool, je peux :',
  'L’alcoolémie baisse en moyenne de 0,10 à 0,15 g/l par heure ; aucun « truc » ne permet d’éliminer l’alcool plus vite.',
  '[{"title":"Réglementation de l’alcool au volant","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-risques/reglementation-de-lalcool-au-volant","consulted_at":"2026-10-22"}]'::jsonb,
  array['Boire un café salé', 'Avaler une cuillerée d’huile', 'Rien : seul le temps fait baisser le taux']::text[],
  array[2]::int[]
);

select pg_temp.seed_question(
  'ex-041', 'Alcool et stupéfiants',
  'Conduire avec un taux d’alcool égal ou supérieur à 0,8 g par litre de sang constitue :',
  'Entre 0,5 et 0,8 g/l, c’est une contravention de 4ᵉ classe ; à partir de 0,8 g/l, c’est un délit.',
  '[{"title":"Réglementation de l’alcool au volant","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-risques/reglementation-de-lalcool-au-volant","consulted_at":"2026-10-22"}]'::jsonb,
  array['Une contravention', 'Un délit']::text[],
  array[1]::int[]
);

select pg_temp.seed_question(
  'ex-042', 'Alcool et stupéfiants',
  'La conduite après usage de stupéfiants est interdite :',
  'Conduire après avoir fait usage de stupéfiants est interdit, quelle que soit la quantité absorbée.',
  '[{"title":"Réglementation de la drogue au volant","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-risques/reglementation-de-la-drogue-au-volant","consulted_at":"2026-10-22"}]'::jsonb,
  array['Au-delà d’une certaine quantité consommée', 'Quelle que soit la quantité consommée']::text[],
  array[1]::int[]
);

select pg_temp.seed_question(
  'ex-043', 'Téléphone',
  'En conduisant, j’ai le droit de téléphoner avec :',
  'Le téléphone tenu en main et tout dispositif porté à l’oreille sont interdits. Un véhicule momentanément arrêté sur la voie (à un feu, par exemple) est toujours considéré en circulation.',
  '[{"title":"Réglementation du téléphone au volant","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-risques/reglementation-du-telephone-au-volant","consulted_at":"2026-10-22","cited_articles":["R412-6-1"]}]'::jsonb,
  array['Un dispositif intégré au véhicule', 'Une oreillette Bluetooth', 'Mon téléphone tenu en main, arrêté à un feu rouge']::text[],
  array[0]::int[]
);

select pg_temp.seed_question(
  'ex-044', 'Téléphone',
  'Tenir son téléphone en main en conduisant est sanctionné par une amende et un retrait de :',
  'Amende forfaitaire de 135 € et retrait de 3 points ; le préfet peut en outre suspendre le permis jusqu’à 6 mois.',
  '[{"title":"Réglementation du téléphone au volant","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-risques/reglementation-du-telephone-au-volant","consulted_at":"2026-10-22","cited_articles":["R412-6-1"]}]'::jsonb,
  array['1 point', '3 points', '6 points']::text[],
  array[1]::int[]
);

select pg_temp.seed_question(
  'ex-045', 'Ceinture et équipements',
  'Dans ma voiture, mon passager de 16 ans n’a pas attaché sa ceinture. Qui est responsable ?',
  'Le conducteur d’un véhicule de 9 places au plus est responsable du port de la ceinture (ou d’un système de retenue adapté) par ses passagers de moins de 18 ans.',
  '[{"title":"Réglementation du port de la ceinture","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-modes-de-deplacements/en-voiture/reglementation-du-port-de-la-ceinture","consulted_at":"2026-10-22","cited_articles":["R412-2","R411-23-1"]}]'::jsonb,
  array['Le passager seul', 'Moi, le conducteur']::text[],
  array[1]::int[]
);

select pg_temp.seed_question(
  'ex-046', 'Ceinture et équipements',
  'La ceinture de sécurité est-elle obligatoire aux places arrière d’une voiture ?',
  'Dès que les sièges en sont équipés, la ceinture est obligatoire à l’avant comme à l’arrière, à tout âge.',
  '[{"title":"Réglementation du port de la ceinture","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-modes-de-deplacements/en-voiture/reglementation-du-port-de-la-ceinture","consulted_at":"2026-10-22","cited_articles":["R412-2","R411-23-1"]}]'::jsonb,
  array['Oui, dès lors que le siège en est équipé', 'Non, seulement à l’avant']::text[],
  array[0]::int[]
);

select pg_temp.seed_question(
  'ex-047', 'Ceinture et équipements',
  'Dans ma voiture, je dois obligatoirement avoir :',
  'Gilet de sécurité et triangle de signalisation sont obligatoires. La boîte d’ampoules n’est pas obligatoire, mais utile.',
  '[{"title":"Équipements obligatoires en voiture","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-modes-de-deplacements/en-voiture/equipements-obligatoires-en-voiture","consulted_at":"2026-10-22"}]'::jsonb,
  array['Un gilet de sécurité', 'Un triangle de signalisation', 'Une boîte d’ampoules de rechange']::text[],
  array[0, 1]::int[]
);

select pg_temp.seed_question(
  'ex-048', 'Ceinture et équipements',
  'Le pare-brise et les vitres latérales avant doivent transmettre au moins :',
  'Le pare-brise et les vitres latérales avant doivent transmettre au moins 70 % de la lumière.',
  '[{"title":"Équipements obligatoires en voiture","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-modes-de-deplacements/en-voiture/equipements-obligatoires-en-voiture","consulted_at":"2026-10-22"}]'::jsonb,
  array['50 % de la lumière', '70 % de la lumière', '90 % de la lumière']::text[],
  array[1]::int[]
);

select pg_temp.seed_question(
  'ex-063', 'Ceinture et équipements',
  'Ma voiture est immobilisée sur la chaussée et constitue un danger pour la circulation. Je place le triangle de présignalisation :',
  'Le triangle se place à 30 mètres ou plus de la voiture pour la signaler aux autres conducteurs.',
  '[{"title":"Équipements obligatoires en voiture : gilet de sécurité, triangle…","publisher":"Service-Public.gouv.fr (DILA)","url":"https://www.service-public.gouv.fr/particuliers/vosdroits/F19459","consulted_at":"2026-10-22","cited_articles":["R416-17 à R416-20","Arrêté du 30 septembre 2008 relatif à la présignalisation des véhicules"]}]'::jsonb,
  array['À 5 mètres de ma voiture', 'À 30 mètres ou plus de ma voiture', 'Juste derrière mon pare-chocs']::text[],
  array[1]::int[]
);

select pg_temp.seed_question(
  'ex-064', 'Ceinture et équipements',
  'Dans quelles situations dois-je utiliser mon triangle de présignalisation ?',
  'Le triangle s’utilise quand l’immobilisation de la voiture est un danger pour la circulation : près d’une intersection, d’un virage, d’un sommet de côte, d’un passage à niveau ou par visibilité insuffisante.',
  '[{"title":"Équipements obligatoires en voiture : gilet de sécurité, triangle…","publisher":"Service-Public.gouv.fr (DILA)","url":"https://www.service-public.gouv.fr/particuliers/vosdroits/F19459","consulted_at":"2026-10-22","cited_articles":["R416-17 à R416-20","Arrêté du 30 septembre 2008 relatif à la présignalisation des véhicules"]}]'::jsonb,
  array['Ma voiture en panne est immobilisée juste après un virage', 'Ma voiture est garée sur une place de stationnement', 'Ma voiture est immobilisée près du sommet d’une côte']::text[],
  array[0, 2]::int[]
);

select pg_temp.seed_question(
  'ex-065', 'Ceinture et équipements',
  'Je signale ma voiture immobilisée avec le triangle. Je dois aussi :',
  'Avec le triangle placé à 30 mètres ou plus, il faut allumer ses feux de détresse.',
  '[{"title":"Équipements obligatoires en voiture : gilet de sécurité, triangle…","publisher":"Service-Public.gouv.fr (DILA)","url":"https://www.service-public.gouv.fr/particuliers/vosdroits/F19459","consulted_at":"2026-10-22","cited_articles":["R416-17 à R416-20","Arrêté du 30 septembre 2008 relatif à la présignalisation des véhicules"]}]'::jsonb,
  array['Allumer mes feux de détresse', 'Allumer mes feux de brouillard arrière', 'Éteindre tous mes feux']::text[],
  array[0]::int[]
);

select pg_temp.seed_question(
  'ex-066', 'Ceinture et équipements',
  'Aller poser le triangle mettrait ma vie en danger (circulation dense, aucun espace pour marcher). Suis-je obligé de le placer ?',
  'On n’est pas obligé de mettre en place le triangle si l’on estime que cela peut mettre sa vie en danger.',
  '[{"title":"Équipements obligatoires en voiture : gilet de sécurité, triangle…","publisher":"Service-Public.gouv.fr (DILA)","url":"https://www.service-public.gouv.fr/particuliers/vosdroits/F19459","consulted_at":"2026-10-22","cited_articles":["R416-17 à R416-20","Arrêté du 30 septembre 2008 relatif à la présignalisation des véhicules"]},{"title":"Équipements obligatoires en voiture","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-modes-de-deplacements/en-voiture/equipements-obligatoires-en-voiture","consulted_at":"2026-10-22"}]'::jsonb,
  array['Oui, dans tous les cas', 'Non']::text[],
  array[1]::int[]
);

select pg_temp.seed_question(
  'ex-067', 'Ceinture et équipements',
  'Après un arrêt d’urgence, je dois revêtir mon gilet de haute visibilité :',
  'Le gilet se porte dès que l’on quitte un véhicule immobilisé sur la chaussée ou ses abords, de nuit comme de jour, quelles que soient les conditions de visibilité.',
  '[{"title":"Équipements obligatoires en voiture : gilet de sécurité, triangle…","publisher":"Service-Public.gouv.fr (DILA)","url":"https://www.service-public.gouv.fr/particuliers/vosdroits/F19459","consulted_at":"2026-10-22","cited_articles":["R416-17 à R416-20","Arrêté du 30 septembre 2008 relatif à la présignalisation des véhicules"]},{"title":"Équipements obligatoires en voiture","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-modes-de-deplacements/en-voiture/equipements-obligatoires-en-voiture","consulted_at":"2026-10-22"}]'::jsonb,
  array['Seulement la nuit', 'Avant de quitter mon véhicule immobilisé sur la chaussée ou ses abords, de jour comme de nuit', 'Seulement sur autoroute']::text[],
  array[1]::int[]
);

select pg_temp.seed_question(
  'ex-068', 'Ceinture et équipements',
  'Mon gilet de haute visibilité doit être rangé :',
  'Le gilet doit être rangé à portée de main, pour pouvoir l’enfiler avant de sortir du véhicule.',
  '[{"title":"Équipements obligatoires en voiture : gilet de sécurité, triangle…","publisher":"Service-Public.gouv.fr (DILA)","url":"https://www.service-public.gouv.fr/particuliers/vosdroits/F19459","consulted_at":"2026-10-22","cited_articles":["R416-17 à R416-20","Arrêté du 30 septembre 2008 relatif à la présignalisation des véhicules"]}]'::jsonb,
  array['À portée de main', 'Dans le coffre, sous les bagages']::text[],
  array[0]::int[]
);

select pg_temp.seed_question(
  'ex-049', 'Accident et secours',
  'En cas d’accident, les trois actions à mener, dans l’ordre, sont :',
  'Protéger, alerter, secourir.',
  '[{"title":"Accident de la route","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/accident-de-la-route","consulted_at":"2026-10-22"}]'::jsonb,
  array['Alerter, protéger, secourir', 'Protéger, alerter, secourir', 'Secourir, alerter, protéger']::text[],
  array[1]::int[]
);

select pg_temp.seed_question(
  'ex-050', 'Accident et secours',
  'Témoin d’un accident, je m’approche d’un motard blessé. Je :',
  'Il ne faut pas retirer le casque d’un motard ni donner à boire ou à manger à un blessé ; on le couvre et on le réconforte.',
  '[{"title":"Accident de la route","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/accident-de-la-route","consulted_at":"2026-10-22"}]'::jsonb,
  array['Ne retire pas son casque', 'Lui donne à boire', 'Le couvre et le rassure en lui parlant']::text[],
  array[0, 2]::int[]
);

select pg_temp.seed_question(
  'ex-051', 'Accident et secours',
  'Je peux déplacer un blessé :',
  'On ne déplace pas un blessé, sauf en cas de danger imminent comme un incendie.',
  '[{"title":"Accident de la route","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/accident-de-la-route","consulted_at":"2026-10-22"}]'::jsonb,
  array['En cas de danger imminent, un incendie par exemple', 'Pour l’installer plus confortablement', 'Jamais, même en cas d’incendie']::text[],
  array[0]::int[]
);

select pg_temp.seed_question(
  'ex-052', 'Accident et secours',
  'Après un accident, je dois remettre le constat amiable à mon assureur dans un délai de :',
  'Le constat complété doit être remis à l’assureur dans les 5 jours ouvrés suivant l’accident.',
  '[{"title":"Accident de la route","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/accident-de-la-route","consulted_at":"2026-10-22"}]'::jsonb,
  array['48 heures', '5 jours ouvrés', '1 mois']::text[],
  array[1]::int[]
);

select pg_temp.seed_question(
  'ex-053', 'Passages à niveau et tunnels',
  'À un passage à niveau, le feu rouge se met à clignoter mais je ne vois aucun train. Je :',
  'Il faut s’arrêter dès que le feu rouge clignote : les trains ont la priorité absolue.',
  '[{"title":"Passage à niveau","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/passage-niveau","consulted_at":"2026-10-22","cited_articles":["R422-3","R412-30"]}]'::jsonb,
  array['M’arrête', 'Passe rapidement']::text[],
  array[0]::int[]
);

select pg_temp.seed_question(
  'ex-054', 'Passages à niveau et tunnels',
  'Mon véhicule est immobilisé sur la voie ferrée et les barrières se ferment. Je :',
  'La barrière est conçue pour céder : on dégage le véhicule en l’enfonçant, on évacue les passagers et on alerte un agent SNCF.',
  '[{"title":"Passage à niveau","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/passage-niveau","consulted_at":"2026-10-22","cited_articles":["R422-3","R412-30"]}]'::jsonb,
  array['Dégage mon véhicule en enfonçant la barrière', 'Fais évacuer tous les passagers', 'Attends dans le véhicule que le train passe']::text[],
  array[0, 1]::int[]
);

select pg_temp.seed_question(
  'ex-055', 'Passages à niveau et tunnels',
  'Après le passage d’un train, les barrières commencent à se relever. Je redémarre :',
  'Il faut attendre l’ouverture complète des barrières : un autre train peut arriver.',
  '[{"title":"Passage à niveau","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/passage-niveau","consulted_at":"2026-10-22","cited_articles":["R422-3","R412-30"]}]'::jsonb,
  array['Dès qu’elles commencent à se lever', 'Quand elles sont complètement ouvertes']::text[],
  array[1]::int[]
);

select pg_temp.seed_question(
  'ex-056', 'Passages à niveau et tunnels',
  'Dans un tunnel, de la fumée apparaît. Je :',
  'On coupe le moteur en laissant la clé sur le contact et on quitte le véhicule par les issues de secours. Le demi-tour est interdit dans un tunnel.',
  '[{"title":"Conduire dans un tunnel","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/conduire-dans-un-tunnel","consulted_at":"2026-10-22"}]'::jsonb,
  array['Coupe le moteur en laissant la clé sur le contact', 'Quitte le véhicule avec mes passagers par une issue de secours', 'Fais demi-tour pour ressortir']::text[],
  array[0, 1]::int[]
);

select pg_temp.seed_question(
  'ex-057', 'Éco-conduite',
  'Pour réduire ma consommation de carburant :',
  'Des pneus sous-gonflés et un coffre de toit inutile augmentent la consommation ; lors d’un arrêt prolongé, mieux vaut couper le moteur.',
  '[{"title":"Éco-conduite en voiture","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chacun-son-mode-de-deplacement/dangers-de-la-route-en-voiture/mieux-conduire-en-voiture/eco","consulted_at":"2026-10-22"}]'::jsonb,
  array['Je vérifie la pression des pneus', 'Je démonte le coffre de toit après utilisation', 'Je laisse tourner le moteur lors d’un arrêt prolongé']::text[],
  array[0, 1]::int[]
);

select pg_temp.seed_question(
  'ex-058', 'Éco-conduite',
  'Pour ralentir en consommant moins, je privilégie :',
  'Anticiper les ralentissements et utiliser le frein moteur plutôt que la pédale de frein réduit la consommation.',
  '[{"title":"Éco-conduite en voiture","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chacun-son-mode-de-deplacement/dangers-de-la-route-en-voiture/mieux-conduire-en-voiture/eco","consulted_at":"2026-10-22"}]'::jsonb,
  array['Le frein moteur', 'La pédale de frein']::text[],
  array[0]::int[]
);

select pg_temp.seed_question(
  'ex-059', 'Ville et stationnement',
  'Dans une zone de rencontre, la vitesse est limitée à :',
  'Zone de rencontre : vitesse limitée à 20 km/h, piétons prioritaires sur tous les véhicules sauf les tramways.',
  '[{"title":"Le code de la rue","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/le-code-de-la-rue","consulted_at":"2026-10-22"}]'::jsonb,
  array['20 km/h', '30 km/h', '50 km/h']::text[],
  array[0]::int[]
);

select pg_temp.seed_question(
  'ex-060', 'Ville et stationnement',
  'Dans une aire piétonne, les véhicules autorisés à y circuler doivent rouler :',
  'Dans une aire piétonne, les piétons sont prioritaires sur tous les véhicules sauf les tramways, et les véhicules autorisés roulent au pas.',
  '[{"title":"Le code de la rue","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/le-code-de-la-rue","consulted_at":"2026-10-22"}]'::jsonb,
  array['Au pas', 'À 20 km/h au plus', 'À 30 km/h au plus']::text[],
  array[0]::int[]
);

select pg_temp.seed_question(
  'ex-061', 'Ville et stationnement',
  'Sur une route à double sens, je stationne :',
  'Sur une route à double sens, on stationne du côté droit ; sur une route à sens unique, à droite ou à gauche.',
  '[{"title":"Arrêt et stationnement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/arret-et-stationnement","consulted_at":"2026-10-22"}]'::jsonb,
  array['Sur le côté droit', 'Du côté de mon choix']::text[],
  array[0]::int[]
);

select pg_temp.seed_question(
  'ex-062', 'Ville et stationnement',
  'Je suis garé le long du trottoir et un cycliste arrive derrière moi. J’ouvre ma portière :',
  'Il est interdit d’ouvrir une portière lorsque cela peut être dangereux pour soi ou pour les autres usagers.',
  '[{"title":"Arrêt et stationnement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/arret-et-stationnement","consulted_at":"2026-10-22"}]'::jsonb,
  array['Après son passage', 'Tout de suite : c’est à lui de m’éviter']::text[],
  array[0]::int[]
);

commit;
