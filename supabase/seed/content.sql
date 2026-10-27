-- FICHIER GÉNÉRÉ par « npm run content:build » : ne pas modifier à la main.
-- Importe le catalogue pédagogique (rejouable). Seuls les contenus au statut
-- « valide » (published) deviennent visibles pour les utilisateurs.
begin;

insert into public.courses (id, external_ref, slug, title, description, position, planned_lessons, status)
values ('747dd721-14d5-5cf1-9e9c-aab450befcd6', 'u01', 'arret-stationnement', 'Arrêt et stationnement', '', 1, 6, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, slug = excluded.slug, title = excluded.title,
  description = excluded.description, position = excluded.position, planned_lessons = excluded.planned_lessons, status = excluded.status;
insert into public.courses (id, external_ref, slug, title, description, position, planned_lessons, status)
values ('7265e8a4-832d-5f31-8022-a19764c4869f', 'u02', 'croisement-depassement', 'Croisement et dépassement', '', 2, 7, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, slug = excluded.slug, title = excluded.title,
  description = excluded.description, position = excluded.position, planned_lessons = excluded.planned_lessons, status = excluded.status;
insert into public.courses (id, external_ref, slug, title, description, position, planned_lessons, status)
values ('c03c1fd4-c5d7-544e-89fe-acaee287bade', 'u03', 'economie-ecoconduite', 'Économie et écoconduite', '', 3, 4, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, slug = excluded.slug, title = excluded.title,
  description = excluded.description, position = excluded.position, planned_lessons = excluded.planned_lessons, status = excluded.status;
insert into public.courses (id, external_ref, slug, title, description, position, planned_lessons, status)
values ('b40b1e6b-339f-5488-87ce-0f0a50a67276', 'u04', 'regles-priorites', 'Règles de priorités', '', 4, 8, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, slug = excluded.slug, title = excluded.title,
  description = excluded.description, position = excluded.position, planned_lessons = excluded.planned_lessons, status = excluded.status;
insert into public.courses (id, external_ref, slug, title, description, position, planned_lessons, status)
values ('d71a9053-9167-58ee-a908-e78d956a30ca', 'u05', 'regles-circulation', 'Règles de circulation', '', 5, 10, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, slug = excluded.slug, title = excluded.title,
  description = excluded.description, position = excluded.position, planned_lessons = excluded.planned_lessons, status = excluded.status;
insert into public.courses (id, external_ref, slug, title, description, position, planned_lessons, status)
values ('08a74e39-3861-5818-8c79-9aee611d8d69', 'u06', 'signalisation', 'Signalisation', '', 6, 9, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, slug = excluded.slug, title = excluded.title,
  description = excluded.description, position = excluded.position, planned_lessons = excluded.planned_lessons, status = excluded.status;
insert into public.courses (id, external_ref, slug, title, description, position, planned_lessons, status)
values ('a3bf0425-c118-51aa-a517-005e92d684ab', 'u07', 'tunnels-passages-niveau', 'Tunnels et passages à niveau', '', 7, 5, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, slug = excluded.slug, title = excluded.title,
  description = excluded.description, position = excluded.position, planned_lessons = excluded.planned_lessons, status = excluded.status;
insert into public.courses (id, external_ref, slug, title, description, position, planned_lessons, status)
values ('7c29a785-68f1-5989-9abc-03bccb3d6e6b', 'u08', 'visibilite-eclairage', 'Visibilité et éclairage', '', 8, 6, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, slug = excluded.slug, title = excluded.title,
  description = excluded.description, position = excluded.position, planned_lessons = excluded.planned_lessons, status = excluded.status;
insert into public.courses (id, external_ref, slug, title, description, position, planned_lessons, status)
values ('07a41a51-b64e-51f2-a198-5b59c5b86b09', 'u09', 'usagers-espace-public', 'Usagers, partage de l’espace public', '', 9, 8, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, slug = excluded.slug, title = excluded.title,
  description = excluded.description, position = excluded.position, planned_lessons = excluded.planned_lessons, status = excluded.status;
insert into public.courses (id, external_ref, slug, title, description, position, planned_lessons, status)
values ('9e728136-4b6b-520c-ab36-e70c5f417e2b', 'u10', 'prise-conscience-risques', 'Prise de conscience des risques', '', 10, 9, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, slug = excluded.slug, title = excluded.title,
  description = excluded.description, position = excluded.position, planned_lessons = excluded.planned_lessons, status = excluded.status;
insert into public.competences (id, external_ref, course_id, slug, title, description, position, status)
values ('24f9e463-bc22-5e54-98a3-661f9dcceb33', 'c-accident-secours', '9e728136-4b6b-520c-ab36-e70c5f417e2b', 'c-accident-secours', 'Réagir à un accident : protéger, alerter, secourir', '', 1, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, course_id = excluded.course_id, slug = excluded.slug,
  title = excluded.title, description = excluded.description, position = excluded.position, status = excluded.status;
insert into public.competences (id, external_ref, course_id, slug, title, description, position, status)
values ('3675dc03-ddc7-5e0a-975b-07979a5a2cfd', 'c-alcool-stupefiants', '9e728136-4b6b-520c-ab36-e70c5f417e2b', 'c-alcool-stupefiants', 'Alcool, stupéfiants et conduite', '', 2, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, course_id = excluded.course_id, slug = excluded.slug,
  title = excluded.title, description = excluded.description, position = excluded.position, status = excluded.status;
insert into public.competences (id, external_ref, course_id, slug, title, description, position, status)
values ('4a75d17c-eda5-5f78-8dfd-d1fca5ba8560', 'c-autoroute', 'd71a9053-9167-58ee-a908-e78d956a30ca', 'c-autoroute', 'Circuler sur autoroute', '', 3, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, course_id = excluded.course_id, slug = excluded.slug,
  title = excluded.title, description = excluded.description, position = excluded.position, status = excluded.status;
insert into public.competences (id, external_ref, course_id, slug, title, description, position, status)
values ('0fb3c8fd-0a66-5281-9a1b-fae51c48915e', 'c-croiser', '7265e8a4-832d-5f31-8022-a19764c4869f', 'c-croiser', 'Croiser les autres usagers en sécurité', '', 4, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, course_id = excluded.course_id, slug = excluded.slug,
  title = excluded.title, description = excluded.description, position = excluded.position, status = excluded.status;
insert into public.competences (id, external_ref, course_id, slug, title, description, position, status)
values ('826bd571-a74b-5e7b-ba38-3d612ce34756', 'c-depasser', '7265e8a4-832d-5f31-8022-a19764c4869f', 'c-depasser', 'Dépasser en sécurité', '', 5, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, course_id = excluded.course_id, slug = excluded.slug,
  title = excluded.title, description = excluded.description, position = excluded.position, status = excluded.status;
insert into public.competences (id, external_ref, course_id, slug, title, description, position, status)
values ('eea0603b-7708-5f30-bc92-8d6dd69ba622', 'c-distractions', '9e728136-4b6b-520c-ab36-e70c5f417e2b', 'c-distractions', 'Éviter les distractions au volant', '', 6, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, course_id = excluded.course_id, slug = excluded.slug,
  title = excluded.title, description = excluded.description, position = excluded.position, status = excluded.status;
insert into public.competences (id, external_ref, course_id, slug, title, description, position, status)
values ('41854bad-69c9-5799-91e7-71d22ffef121', 'c-ecoconduite', 'c03c1fd4-c5d7-544e-89fe-acaee287bade', 'c-ecoconduite', 'Conduire de façon économe', '', 7, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, course_id = excluded.course_id, slug = excluded.slug,
  title = excluded.title, description = excluded.description, position = excluded.position, status = excluded.status;
insert into public.competences (id, external_ref, course_id, slug, title, description, position, status)
values ('94064f20-6a59-54df-ab7d-ca1026477fd3', 'c-equipements-securite', '9e728136-4b6b-520c-ab36-e70c5f417e2b', 'c-equipements-securite', 'Utiliser les équipements de sécurité', '', 8, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, course_id = excluded.course_id, slug = excluded.slug,
  title = excluded.title, description = excluded.description, position = excluded.position, status = excluded.status;
insert into public.competences (id, external_ref, course_id, slug, title, description, position, status)
values ('6dbd753d-1595-5e3e-817c-9cdb33b47aec', 'c-feux', '7c29a785-68f1-5989-9abc-03bccb3d6e6b', 'c-feux', 'Utiliser les feux du véhicule', '', 9, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, course_id = excluded.course_id, slug = excluded.slug,
  title = excluded.title, description = excluded.description, position = excluded.position, status = excluded.status;
insert into public.competences (id, external_ref, course_id, slug, title, description, position, status)
values ('c3bbdb5b-a721-594f-bacd-c67f7cd97d76', 'c-marquages', '08a74e39-3861-5818-8c79-9aee611d8d69', 'c-marquages', 'Lire le marquage au sol', '', 10, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, course_id = excluded.course_id, slug = excluded.slug,
  title = excluded.title, description = excluded.description, position = excluded.position, status = excluded.status;
insert into public.competences (id, external_ref, course_id, slug, title, description, position, status)
values ('3647f5af-2b62-567f-a0e2-281cc052752d', 'c-meteo', '7c29a785-68f1-5989-9abc-03bccb3d6e6b', 'c-meteo', 'Adapter sa conduite à la météo', '', 11, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, course_id = excluded.course_id, slug = excluded.slug,
  title = excluded.title, description = excluded.description, position = excluded.position, status = excluded.status;
insert into public.competences (id, external_ref, course_id, slug, title, description, position, status)
values ('ad7e4ff8-02e2-51f2-955e-6689b0731b71', 'c-panne', '9e728136-4b6b-520c-ab36-e70c5f417e2b', 'c-panne', 'Réagir à une panne', '', 12, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, course_id = excluded.course_id, slug = excluded.slug,
  title = excluded.title, description = excluded.description, position = excluded.position, status = excluded.status;
insert into public.competences (id, external_ref, course_id, slug, title, description, position, status)
values ('5b02c6df-9f1f-52ff-93e1-f191b1ff6234', 'c-panneaux-feux', '08a74e39-3861-5818-8c79-9aee611d8d69', 'c-panneaux-feux', 'Respecter panneaux, feux et signaux', '', 13, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, course_id = excluded.course_id, slug = excluded.slug,
  title = excluded.title, description = excluded.description, position = excluded.position, status = excluded.status;
insert into public.competences (id, external_ref, course_id, slug, title, description, position, status)
values ('a8754ce0-1402-5b0e-b697-869bd4098e21', 'c-passages-niveau', 'a3bf0425-c118-51aa-a517-005e92d684ab', 'c-passages-niveau', 'Franchir un passage à niveau', '', 14, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, course_id = excluded.course_id, slug = excluded.slug,
  title = excluded.title, description = excluded.description, position = excluded.position, status = excluded.status;
insert into public.competences (id, external_ref, course_id, slug, title, description, position, status)
values ('7fe7f3e9-aecc-5413-942d-e5c19bff2e3c', 'c-priorite-intersection', 'b40b1e6b-339f-5488-87ce-0f0a50a67276', 'c-priorite-intersection', 'Appliquer les règles de priorité aux intersections', '', 15, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, course_id = excluded.course_id, slug = excluded.slug,
  title = excluded.title, description = excluded.description, position = excluded.position, status = excluded.status;
insert into public.competences (id, external_ref, course_id, slug, title, description, position, status)
values ('9633e039-8208-5c8f-b4e6-22f0326ab7f3', 'c-stationner', '747dd721-14d5-5cf1-9e9c-aab450befcd6', 'c-stationner', 'Arrêter et stationner sans danger', '', 16, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, course_id = excluded.course_id, slug = excluded.slug,
  title = excluded.title, description = excluded.description, position = excluded.position, status = excluded.status;
insert into public.competences (id, external_ref, course_id, slug, title, description, position, status)
values ('8d9197d8-6c24-50f3-b193-ada8b816fe81', 'c-tunnels', 'a3bf0425-c118-51aa-a517-005e92d684ab', 'c-tunnels', 'Circuler dans un tunnel', '', 17, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, course_id = excluded.course_id, slug = excluded.slug,
  title = excluded.title, description = excluded.description, position = excluded.position, status = excluded.status;
insert into public.competences (id, external_ref, course_id, slug, title, description, position, status)
values ('4d2a0934-e1b1-5172-9c6f-eacb55406515', 'c-usagers-vulnerables', '07a41a51-b64e-51f2-a198-5b59c5b86b09', 'c-usagers-vulnerables', 'Protéger piétons et cyclistes', '', 18, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, course_id = excluded.course_id, slug = excluded.slug,
  title = excluded.title, description = excluded.description, position = excluded.position, status = excluded.status;
insert into public.competences (id, external_ref, course_id, slug, title, description, position, status)
values ('8b6c3b03-7335-537f-a299-7577bc2e6c3d', 'c-vehicules-prioritaires', 'b40b1e6b-339f-5488-87ce-0f0a50a67276', 'c-vehicules-prioritaires', 'Faciliter le passage des véhicules prioritaires', '', 19, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, course_id = excluded.course_id, slug = excluded.slug,
  title = excluded.title, description = excluded.description, position = excluded.position, status = excluded.status;
insert into public.competences (id, external_ref, course_id, slug, title, description, position, status)
values ('a338089b-b643-5a4b-aa5f-17931e569ec7', 'c-vitesses', 'd71a9053-9167-58ee-a908-e78d956a30ca', 'c-vitesses', 'Respecter les vitesses maximales', '', 20, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, course_id = excluded.course_id, slug = excluded.slug,
  title = excluded.title, description = excluded.description, position = excluded.position, status = excluded.status;
insert into public.competences (id, external_ref, course_id, slug, title, description, position, status)
values ('22ccf1ae-d20c-5540-84d9-7af8f655864b', 'c-zones-apaisees', '07a41a51-b64e-51f2-a198-5b59c5b86b09', 'c-zones-apaisees', 'Circuler en zone de rencontre et aire piétonne', '', 21, 'in_review'::public.content_status)
on conflict (id) do update set external_ref = excluded.external_ref, course_id = excluded.course_id, slug = excluded.slug,
  title = excluded.title, description = excluded.description, position = excluded.position, status = excluded.status;
insert into public.lessons (id, external_ref, course_id, slug, title, summary, position, status, is_demo, blocks, sources, reviewer_name, reviewed_at, access)
values ('8e12b044-e311-5cff-9739-7f70d56540de', 'l-u04-priorite-a-droite', 'b40b1e6b-339f-5488-87ce-0f0a50a67276', 'priorite-a-droite', 'Priorité à droite et intersections', 'Qui passe en premier quand rien n’est indiqué, et qui l’emporte entre agent, feux et panneaux.', 1, 'draft'::public.content_status, true, '[{"type":"text","title":"La règle de base","paragraphs":["Lorsque deux conducteurs abordent une intersection par des routes différentes, celui qui vient par la gauche doit céder le passage à l’autre (article R415-5 du code de la route, cité par la Sécurité routière).","Sans panneau, sans feu et sans agent, on cède donc le passage aux véhicules qui arrivent par la droite.","Avoir la priorité n’est pas un droit absolu : on ralentit, on contrôle ses rétroviseurs et on vérifie que les autres usagers nous laissent bien passer."]},{"type":"image","src":"/contenus/demo/intersection-priorite-droite.svg","alt":"Schéma vu de dessus d’une intersection sans signalisation : votre voiture bleue arrive par le bas et s’arrête ; la voiture verte, qui arrive par votre droite, passe en premier.","caption":"Sans signalisation, le véhicule venant de droite est prioritaire.","credit":"Schéma original KODI (démonstration)","width":400,"height":300},{"type":"text","title":"Qui l’emporte ?","paragraphs":["Les indications d’un agent de la circulation priment sur les feux et sur les panneaux.","Les feux priment sur les panneaux. Si le feu ne fonctionne pas, on applique la règle indiquée par le panneau."]},{"type":"simulation","sceneSlug":"intersection-sans-signalisation","camera":"conducteur","instructions":"Observez l’arrivée des véhicules et repérez celui qui doit céder le passage."}]'::jsonb, '[{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb, null, null, 'gratuit')
on conflict (id) do update set external_ref = excluded.external_ref, course_id = excluded.course_id, slug = excluded.slug,
  title = excluded.title, summary = excluded.summary, position = excluded.position, status = excluded.status,
  is_demo = excluded.is_demo, blocks = excluded.blocks, sources = excluded.sources,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, access = excluded.access;
delete from public.lesson_competences where lesson_id = '8e12b044-e311-5cff-9739-7f70d56540de';
insert into public.lesson_competences (lesson_id, competence_id) values ('8e12b044-e311-5cff-9739-7f70d56540de', '7fe7f3e9-aecc-5413-942d-e5c19bff2e3c');
insert into public.lessons (id, external_ref, course_id, slug, title, summary, position, status, is_demo, blocks, sources, reviewer_name, reviewed_at, access)
values ('9857c203-7a8f-53cf-aceb-c4a06a75962e', 'l-u07-passage-a-niveau', 'a3bf0425-c118-51aa-a517-005e92d684ab', 'passage-a-niveau', 'Franchir un passage à niveau', 'Les bons réflexes à l’approche d’une voie ferrée, et que faire si l’on est bloqué.', 1, 'draft'::public.content_status, true, '[{"type":"text","title":"À l’approche","paragraphs":["Un passage à niveau est toujours annoncé par un panneau : ralentissez.","Ne vous engagez que si vous êtes certain de pouvoir dégager rapidement la voie ferrée, et ne vous y arrêtez jamais."]},{"type":"text","title":"Feux et barrières","paragraphs":["Dès que le feu rouge clignote, arrêtez-vous : le code de la route accorde la priorité absolue aux trains.","Après le passage d’un train, attendez l’ouverture complète des barrières : un autre train peut arriver.","La distance d’arrêt d’un train peut atteindre 800 mètres."]},{"type":"video","title":"Bien franchir un passage à niveau","transcript":"Vidéo à produire. Contenu prévu : approche d’un passage à niveau, arrêt dès que le feu rouge clignote, attente de l’ouverture complète des barrières, puis franchissement.","toProduce":true},{"type":"simulation","sceneSlug":"passage-a-niveau","camera":"aerienne","instructions":"Identifiez le moment exact où vous devez vous arrêter."}]'::jsonb, '[{"title":"Passage à niveau","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/passage-niveau","consulted_at":"2026-10-22","cited_articles":["R422-3","R412-30"]}]'::jsonb, null, null, 'gratuit')
on conflict (id) do update set external_ref = excluded.external_ref, course_id = excluded.course_id, slug = excluded.slug,
  title = excluded.title, summary = excluded.summary, position = excluded.position, status = excluded.status,
  is_demo = excluded.is_demo, blocks = excluded.blocks, sources = excluded.sources,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, access = excluded.access;
delete from public.lesson_competences where lesson_id = '9857c203-7a8f-53cf-aceb-c4a06a75962e';
insert into public.lesson_competences (lesson_id, competence_id) values ('9857c203-7a8f-53cf-aceb-c4a06a75962e', 'a8754ce0-1402-5b0e-b697-869bd4098e21');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('c9f2a434-0772-53bf-9f42-87f34edcd98a', 'ex-001', 'Priorités', 'J’arrive à une intersection sans panneau, sans feu et sans agent. Un véhicule arrive par la route située à ma droite. Je dois :', 'Sans signalisation, le conducteur venant par la gauche doit céder le passage : c’est la priorité à droite.', '[{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb, 'in_review'::public.content_status, null, null, '8e12b044-e311-5cff-9739-7f70d56540de', false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'c9f2a434-0772-53bf-9f42-87f34edcd98a';
delete from public.question_choices where question_id = 'c9f2a434-0772-53bf-9f42-87f34edcd98a' and id not in ('221f3144-b39c-56d6-8f41-fa4c98d3ac8f', '8ba7aef5-a35a-5669-a380-1744fdf71eeb', '71f7141c-c33a-5f44-b19d-b0418b218dac');
insert into public.question_choices (id, question_id, position, label) values ('221f3144-b39c-56d6-8f41-fa4c98d3ac8f', 'c9f2a434-0772-53bf-9f42-87f34edcd98a', 0, 'Lui céder le passage')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('8ba7aef5-a35a-5669-a380-1744fdf71eeb', 'c9f2a434-0772-53bf-9f42-87f34edcd98a', 1, 'Passer en premier')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('71f7141c-c33a-5f44-b19d-b0418b218dac', 'c9f2a434-0772-53bf-9f42-87f34edcd98a', 2, 'Passer en premier si ma route est plus large')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('c9f2a434-0772-53bf-9f42-87f34edcd98a', '221f3144-b39c-56d6-8f41-fa4c98d3ac8f');
delete from public.question_competences where question_id = 'c9f2a434-0772-53bf-9f42-87f34edcd98a';
insert into public.question_competences (question_id, competence_id) values ('c9f2a434-0772-53bf-9f42-87f34edcd98a', '7fe7f3e9-aecc-5413-942d-e5c19bff2e3c');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('e5fc2d38-d978-55c1-9e5e-f18bcc9d877e', 'ex-002', 'Priorités', 'À une intersection, le feu est vert pour moi, mais un agent de la circulation m’ordonne de m’arrêter. J’obéis :', 'Les indications d’un agent de la circulation priment sur les feux et sur les panneaux.', '[{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb, 'in_review'::public.content_status, null, null, '8e12b044-e311-5cff-9739-7f70d56540de', false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'e5fc2d38-d978-55c1-9e5e-f18bcc9d877e';
delete from public.question_choices where question_id = 'e5fc2d38-d978-55c1-9e5e-f18bcc9d877e' and id not in ('feb3fca4-86e5-5c34-9876-3c2a6dd3a102', 'e599bb13-d171-53bc-b5a2-04320d23dc43', 'a0608eb3-9154-50e3-9692-5601757ab5f8');
insert into public.question_choices (id, question_id, position, label) values ('feb3fca4-86e5-5c34-9876-3c2a6dd3a102', 'e5fc2d38-d978-55c1-9e5e-f18bcc9d877e', 0, 'Au feu')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('e599bb13-d171-53bc-b5a2-04320d23dc43', 'e5fc2d38-d978-55c1-9e5e-f18bcc9d877e', 1, 'À l’agent')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('a0608eb3-9154-50e3-9692-5601757ab5f8', 'e5fc2d38-d978-55c1-9e5e-f18bcc9d877e', 2, 'Au panneau placé à l’intersection')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('e5fc2d38-d978-55c1-9e5e-f18bcc9d877e', 'e599bb13-d171-53bc-b5a2-04320d23dc43');
delete from public.question_competences where question_id = 'e5fc2d38-d978-55c1-9e5e-f18bcc9d877e';
insert into public.question_competences (question_id, competence_id) values ('e5fc2d38-d978-55c1-9e5e-f18bcc9d877e', '7fe7f3e9-aecc-5413-942d-e5c19bff2e3c');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('4d17fe6b-d8df-552d-9c21-eebd8a35c49e', 'ex-003', 'Priorités', 'Le feu d’une intersection ne fonctionne pas. Un panneau « Cédez le passage » est placé de mon côté. Je dois :', 'Les feux priment sur les panneaux ; si le feu ne fonctionne pas, on applique la règle de priorité indiquée par le panneau.', '[{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb, 'in_review'::public.content_status, null, null, '8e12b044-e311-5cff-9739-7f70d56540de', false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '4d17fe6b-d8df-552d-9c21-eebd8a35c49e';
delete from public.question_choices where question_id = '4d17fe6b-d8df-552d-9c21-eebd8a35c49e' and id not in ('934b1bd3-bf34-52e0-8948-e01c918704e1', '3cc94339-e4a9-55af-9226-8cd88d40e9b1', '2a77ed9e-473d-5950-b8a4-c8bca2b1ef40');
insert into public.question_choices (id, question_id, position, label) values ('934b1bd3-bf34-52e0-8948-e01c918704e1', '4d17fe6b-d8df-552d-9c21-eebd8a35c49e', 0, 'Appliquer la règle indiquée par le panneau')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('3cc94339-e4a9-55af-9226-8cd88d40e9b1', '4d17fe6b-d8df-552d-9c21-eebd8a35c49e', 1, 'Passer : le feu étant éteint, je suis prioritaire')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('2a77ed9e-473d-5950-b8a4-c8bca2b1ef40', '4d17fe6b-d8df-552d-9c21-eebd8a35c49e', 2, 'Appliquer obligatoirement la priorité à droite')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('4d17fe6b-d8df-552d-9c21-eebd8a35c49e', '934b1bd3-bf34-52e0-8948-e01c918704e1');
delete from public.question_competences where question_id = '4d17fe6b-d8df-552d-9c21-eebd8a35c49e';
insert into public.question_competences (question_id, competence_id) values ('4d17fe6b-d8df-552d-9c21-eebd8a35c49e', '7fe7f3e9-aecc-5413-942d-e5c19bff2e3c');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('2a9d03d9-e1d0-5fc0-9698-8664fce6495d', 'ex-004', 'Priorités', 'J’arrive à une intersection marquée d’un panneau « Stop ». Je dois :', 'Au « Stop », il faut s’arrêter et laisser passer les conducteurs venant de droite et de gauche avant de s’engager.', '[{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '2a9d03d9-e1d0-5fc0-9698-8664fce6495d';
delete from public.question_choices where question_id = '2a9d03d9-e1d0-5fc0-9698-8664fce6495d' and id not in ('9bb95a7c-9878-58d7-b05d-acd348258f90', 'edd6247c-804f-5dca-916d-0008928d6278', '25139901-e6aa-5989-8f9f-e489831a9710');
insert into public.question_choices (id, question_id, position, label) values ('9bb95a7c-9878-58d7-b05d-acd348258f90', '2a9d03d9-e1d0-5fc0-9698-8664fce6495d', 0, 'Marquer l’arrêt')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('edd6247c-804f-5dca-916d-0008928d6278', '2a9d03d9-e1d0-5fc0-9698-8664fce6495d', 1, 'Laisser passer les véhicules venant de droite et de gauche')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('25139901-e6aa-5989-8f9f-e489831a9710', '2a9d03d9-e1d0-5fc0-9698-8664fce6495d', 2, 'Seulement ralentir si la voie paraît libre')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('2a9d03d9-e1d0-5fc0-9698-8664fce6495d', '9bb95a7c-9878-58d7-b05d-acd348258f90');
insert into public.question_answers (question_id, choice_id) values ('2a9d03d9-e1d0-5fc0-9698-8664fce6495d', 'edd6247c-804f-5dca-916d-0008928d6278');
delete from public.question_competences where question_id = '2a9d03d9-e1d0-5fc0-9698-8664fce6495d';
insert into public.question_competences (question_id, competence_id) values ('2a9d03d9-e1d0-5fc0-9698-8664fce6495d', '7fe7f3e9-aecc-5413-942d-e5c19bff2e3c');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('ee48727f-68c2-568e-98dd-33578bb23658', 'ex-005', 'Priorités', 'Je sors d’un parking privé pour m’engager sur la route. Suis-je prioritaire sur les véhicules qui y circulent ?', 'Le conducteur qui débouche d’un accès non ouvert à la circulation publique (parking, chemin de terre, sortie privée) n’est pas prioritaire : il s’engage seulement s’il peut le faire sans danger.', '[{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'ee48727f-68c2-568e-98dd-33578bb23658';
delete from public.question_choices where question_id = 'ee48727f-68c2-568e-98dd-33578bb23658' and id not in ('a31fe2d9-4209-5f50-9607-1f6564e225b3', '7bffd65d-05ca-5ab3-b3f8-6ff694a5d901');
insert into public.question_choices (id, question_id, position, label) values ('a31fe2d9-4209-5f50-9607-1f6564e225b3', 'ee48727f-68c2-568e-98dd-33578bb23658', 0, 'Oui')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('7bffd65d-05ca-5ab3-b3f8-6ff694a5d901', 'ee48727f-68c2-568e-98dd-33578bb23658', 1, 'Non')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('ee48727f-68c2-568e-98dd-33578bb23658', '7bffd65d-05ca-5ab3-b3f8-6ff694a5d901');
delete from public.question_competences where question_id = 'ee48727f-68c2-568e-98dd-33578bb23658';
insert into public.question_competences (question_id, competence_id) values ('ee48727f-68c2-568e-98dd-33578bb23658', '7fe7f3e9-aecc-5413-942d-e5c19bff2e3c');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('33d13105-d480-503a-989e-2b68ca359345', 'ex-006', 'Priorités', 'Un véhicule de pompiers arrive derrière moi, gyrophare et sirène en marche. Je dois :', 'Les véhicules d’intérêt général prioritaires qui annoncent leur approche par leurs avertisseurs doivent pouvoir passer : il faut leur céder le passage et leur faciliter croisement et dépassement.', '[{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '33d13105-d480-503a-989e-2b68ca359345';
delete from public.question_choices where question_id = '33d13105-d480-503a-989e-2b68ca359345' and id not in ('3541a1e5-e6fa-5a3f-a6bf-b39dfe3fddc6', '6b912639-693e-53db-90d3-a6cf60a3669c', '3f53bf6a-5322-5542-bb9a-e966a2394617');
insert into public.question_choices (id, question_id, position, label) values ('3541a1e5-e6fa-5a3f-a6bf-b39dfe3fddc6', '33d13105-d480-503a-989e-2b68ca359345', 0, 'Lui faciliter le passage')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('6b912639-693e-53db-90d3-a6cf60a3669c', '33d13105-d480-503a-989e-2b68ca359345', 1, 'Continuer normalement, sauf s’il me fait un signe')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('3f53bf6a-5322-5542-bb9a-e966a2394617', '33d13105-d480-503a-989e-2b68ca359345', 2, 'Accélérer pour rester devant lui')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('33d13105-d480-503a-989e-2b68ca359345', '3541a1e5-e6fa-5a3f-a6bf-b39dfe3fddc6');
delete from public.question_competences where question_id = '33d13105-d480-503a-989e-2b68ca359345';
insert into public.question_competences (question_id, competence_id) values ('33d13105-d480-503a-989e-2b68ca359345', '8b6c3b03-7335-537f-a299-7577bc2e6c3d');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('5be64319-5e65-591e-a06f-02b7348e2fc3', 'ex-007', 'Priorités', 'Un engin de service hivernal circule avec son gyrophare allumé. Il bénéficie de la facilité de passage. Aux intersections, il est :', 'Il faut faciliter son croisement et son dépassement, mais un véhicule bénéficiant de la facilité de passage n’est pas prioritaire aux intersections.', '[{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '5be64319-5e65-591e-a06f-02b7348e2fc3';
delete from public.question_choices where question_id = '5be64319-5e65-591e-a06f-02b7348e2fc3' and id not in ('54bc71f9-e906-528b-b2da-c787b7ab26a2', 'cd0cf63e-98e4-58c6-b359-cae63d873c7d');
insert into public.question_choices (id, question_id, position, label) values ('54bc71f9-e906-528b-b2da-c787b7ab26a2', '5be64319-5e65-591e-a06f-02b7348e2fc3', 0, 'Prioritaire sur tous les usagers')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('cd0cf63e-98e4-58c6-b359-cae63d873c7d', '5be64319-5e65-591e-a06f-02b7348e2fc3', 1, 'Soumis aux règles de priorité habituelles')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('5be64319-5e65-591e-a06f-02b7348e2fc3', 'cd0cf63e-98e4-58c6-b359-cae63d873c7d');
delete from public.question_competences where question_id = '5be64319-5e65-591e-a06f-02b7348e2fc3';
insert into public.question_competences (question_id, competence_id) values ('5be64319-5e65-591e-a06f-02b7348e2fc3', '8b6c3b03-7335-537f-a299-7577bc2e6c3d');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('52437d98-840d-52f6-bad7-cd8a1aca1217', 'ex-008', 'Priorités', 'Je veux tourner à gauche à une intersection. Une voiture arrive en face de moi. Je dois :', 'Le conducteur qui tourne à gauche doit céder le passage aux véhicules qui arrivent en face de lui.', '[{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb, 'in_review'::public.content_status, null, null, '8e12b044-e311-5cff-9739-7f70d56540de', false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '52437d98-840d-52f6-bad7-cd8a1aca1217';
delete from public.question_choices where question_id = '52437d98-840d-52f6-bad7-cd8a1aca1217' and id not in ('e7669162-c7e2-5d1b-8627-1a4e9a4b1395', '7d0d93d5-dfb8-5d4b-9479-28a1e423188d', 'b866adb3-f31c-5b00-8bb1-29ee641511b2');
insert into public.question_choices (id, question_id, position, label) values ('e7669162-c7e2-5d1b-8627-1a4e9a4b1395', '52437d98-840d-52f6-bad7-cd8a1aca1217', 0, 'La laisser passer')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('7d0d93d5-dfb8-5d4b-9479-28a1e423188d', '52437d98-840d-52f6-bad7-cd8a1aca1217', 1, 'Passer avant elle')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('b866adb3-f31c-5b00-8bb1-29ee641511b2', '52437d98-840d-52f6-bad7-cd8a1aca1217', 2, 'Passer avant elle si j’ai mis mon clignotant')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('52437d98-840d-52f6-bad7-cd8a1aca1217', 'e7669162-c7e2-5d1b-8627-1a4e9a4b1395');
delete from public.question_competences where question_id = '52437d98-840d-52f6-bad7-cd8a1aca1217';
insert into public.question_competences (question_id, competence_id) values ('52437d98-840d-52f6-bad7-cd8a1aca1217', '7fe7f3e9-aecc-5413-942d-e5c19bff2e3c');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('67250126-c654-5dfb-a928-9506eab68b2b', 'ex-009', 'Priorités', 'Le feu est vert, mais l’intersection est encombrée : si je m’engage, je risque d’y rester bloqué. Je m’engage :', 'On ne doit s’engager dans une intersection que si son véhicule ne risque pas d’y être immobilisé et d’empêcher le passage des autres.', '[{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '67250126-c654-5dfb-a928-9506eab68b2b';
delete from public.question_choices where question_id = '67250126-c654-5dfb-a928-9506eab68b2b' and id not in ('25402279-8a4c-5e70-96c1-8c330518a489', '953839e9-a1ea-5e51-85f0-2d3508507880');
insert into public.question_choices (id, question_id, position, label) values ('25402279-8a4c-5e70-96c1-8c330518a489', '67250126-c654-5dfb-a928-9506eab68b2b', 0, 'Oui, le feu est vert')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('953839e9-a1ea-5e51-85f0-2d3508507880', '67250126-c654-5dfb-a928-9506eab68b2b', 1, 'Non')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('67250126-c654-5dfb-a928-9506eab68b2b', '953839e9-a1ea-5e51-85f0-2d3508507880');
delete from public.question_competences where question_id = '67250126-c654-5dfb-a928-9506eab68b2b';
insert into public.question_competences (question_id, competence_id) values ('67250126-c654-5dfb-a928-9506eab68b2b', '7fe7f3e9-aecc-5413-942d-e5c19bff2e3c');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('1556f3dd-2e63-52a5-bca6-0eb4aef2da0a', 'ex-010', 'Priorités', 'Un piéton attend au bord d’un passage piéton et montre son intention de traverser. Je dois :', 'Il faut céder le passage aux piétons engagés sur un passage piéton ou souhaitant le faire.', '[{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '1556f3dd-2e63-52a5-bca6-0eb4aef2da0a';
delete from public.question_choices where question_id = '1556f3dd-2e63-52a5-bca6-0eb4aef2da0a' and id not in ('cda6c594-3ad0-571a-804a-d3b756e5915f', 'e55891f0-574f-5645-8dce-b939812ff7e3');
insert into public.question_choices (id, question_id, position, label) values ('cda6c594-3ad0-571a-804a-d3b756e5915f', '1556f3dd-2e63-52a5-bca6-0eb4aef2da0a', 0, 'Lui céder le passage')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('e55891f0-574f-5645-8dce-b939812ff7e3', '1556f3dd-2e63-52a5-bca6-0eb4aef2da0a', 1, 'Passer : il n’est pas encore engagé')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('1556f3dd-2e63-52a5-bca6-0eb4aef2da0a', 'cda6c594-3ad0-571a-804a-d3b756e5915f');
delete from public.question_competences where question_id = '1556f3dd-2e63-52a5-bca6-0eb4aef2da0a';
insert into public.question_competences (question_id, competence_id) values ('1556f3dd-2e63-52a5-bca6-0eb4aef2da0a', '7fe7f3e9-aecc-5413-942d-e5c19bff2e3c');
insert into public.question_competences (question_id, competence_id) values ('1556f3dd-2e63-52a5-bca6-0eb4aef2da0a', '4d2a0934-e1b1-5172-9c6f-eacb55406515');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('b690add1-dfe2-51bb-bc0f-d6c4c7b2caa5', 'ex-011', 'Priorités', 'Ne pas respecter une règle de priorité (par exemple la priorité à droite) entraîne de plein droit un retrait de :', 'Cette contravention de 4ᵉ classe entraîne de plein droit la réduction de quatre points du permis de conduire.', '[{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'b690add1-dfe2-51bb-bc0f-d6c4c7b2caa5';
delete from public.question_choices where question_id = 'b690add1-dfe2-51bb-bc0f-d6c4c7b2caa5' and id not in ('907af908-7cd9-54b9-b541-cf08d0213bdf', '8e6ada43-35c2-5bd8-9b8d-3b6bcc8078b0', '436dd40d-cf16-5f12-b716-bcef8dbd36e6');
insert into public.question_choices (id, question_id, position, label) values ('907af908-7cd9-54b9-b541-cf08d0213bdf', 'b690add1-dfe2-51bb-bc0f-d6c4c7b2caa5', 0, '2 points')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('8e6ada43-35c2-5bd8-9b8d-3b6bcc8078b0', 'b690add1-dfe2-51bb-bc0f-d6c4c7b2caa5', 1, '4 points')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('436dd40d-cf16-5f12-b716-bcef8dbd36e6', 'b690add1-dfe2-51bb-bc0f-d6c4c7b2caa5', 2, '6 points')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('b690add1-dfe2-51bb-bc0f-d6c4c7b2caa5', '8e6ada43-35c2-5bd8-9b8d-3b6bcc8078b0');
delete from public.question_competences where question_id = 'b690add1-dfe2-51bb-bc0f-d6c4c7b2caa5';
insert into public.question_competences (question_id, competence_id) values ('b690add1-dfe2-51bb-bc0f-d6c4c7b2caa5', '7fe7f3e9-aecc-5413-942d-e5c19bff2e3c');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('256aa3ac-8596-55dd-a1f2-2dfe1d0102e8', 'ex-012', 'Autoroute', 'Je rejoins une autoroute par une bretelle puis une voie d’accélération. Je dois :', 'Le conducteur qui rejoint l’autoroute doit céder le passage aux véhicules qui y circulent, en accélérant suffisamment pour s’insérer sans gêner.', '[{"title":"Autoroute","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/autoroute","consulted_at":"2026-10-22"},{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '256aa3ac-8596-55dd-a1f2-2dfe1d0102e8';
delete from public.question_choices where question_id = '256aa3ac-8596-55dd-a1f2-2dfe1d0102e8' and id not in ('94c3085f-d910-58c2-8832-7c7ad913e76d', '2e085665-1e67-5d1e-a5b7-2dd4adef9dc3', 'e62e989b-b471-5a76-ad4c-bff5504cc541');
insert into public.question_choices (id, question_id, position, label) values ('94c3085f-d910-58c2-8832-7c7ad913e76d', '256aa3ac-8596-55dd-a1f2-2dfe1d0102e8', 0, 'Accélérer suffisamment pour m’insérer sans gêner')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('2e085665-1e67-5d1e-a5b7-2dd4adef9dc3', '256aa3ac-8596-55dd-a1f2-2dfe1d0102e8', 1, 'Céder le passage aux véhicules circulant sur l’autoroute')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('e62e989b-b471-5a76-ad4c-bff5504cc541', '256aa3ac-8596-55dd-a1f2-2dfe1d0102e8', 2, 'M’arrêter systématiquement au bout de la voie')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('256aa3ac-8596-55dd-a1f2-2dfe1d0102e8', '94c3085f-d910-58c2-8832-7c7ad913e76d');
insert into public.question_answers (question_id, choice_id) values ('256aa3ac-8596-55dd-a1f2-2dfe1d0102e8', '2e085665-1e67-5d1e-a5b7-2dd4adef9dc3');
delete from public.question_competences where question_id = '256aa3ac-8596-55dd-a1f2-2dfe1d0102e8';
insert into public.question_competences (question_id, competence_id) values ('256aa3ac-8596-55dd-a1f2-2dfe1d0102e8', '4a75d17c-eda5-5f78-8dfd-d1fca5ba8560');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('c8a25486-924e-52cd-9615-ff56016859e2', 'ex-013', 'Croisement et dépassement', 'Hors agglomération, je croise un cycliste. Je dois laisser une distance latérale d’au moins :', 'Hors agglomération, il faut laisser au moins 1,50 m latéralement avec les deux-roues et les piétons.', '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'c8a25486-924e-52cd-9615-ff56016859e2';
delete from public.question_choices where question_id = 'c8a25486-924e-52cd-9615-ff56016859e2' and id not in ('e7cb9795-1d4b-5cdc-9206-04cc171efa1c', '18940c74-64d0-5e5b-b282-92dcad1b63ce', '059266e2-ece9-533f-a972-43bacdb73eeb');
insert into public.question_choices (id, question_id, position, label) values ('e7cb9795-1d4b-5cdc-9206-04cc171efa1c', 'c8a25486-924e-52cd-9615-ff56016859e2', 0, '50 cm')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('18940c74-64d0-5e5b-b282-92dcad1b63ce', 'c8a25486-924e-52cd-9615-ff56016859e2', 1, '1 m')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('059266e2-ece9-533f-a972-43bacdb73eeb', 'c8a25486-924e-52cd-9615-ff56016859e2', 2, '1,50 m')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('c8a25486-924e-52cd-9615-ff56016859e2', '059266e2-ece9-533f-a972-43bacdb73eeb');
delete from public.question_competences where question_id = 'c8a25486-924e-52cd-9615-ff56016859e2';
insert into public.question_competences (question_id, competence_id) values ('c8a25486-924e-52cd-9615-ff56016859e2', '0fb3c8fd-0a66-5281-9a1b-fae51c48915e');
insert into public.question_competences (question_id, competence_id) values ('c8a25486-924e-52cd-9615-ff56016859e2', '4d2a0934-e1b1-5172-9c6f-eacb55406515');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('7ea7aabb-6dd7-5356-a113-1f260d284d71', 'ex-014', 'Croisement et dépassement', 'En agglomération, je croise un piéton qui marche au bord de la chaussée. Je dois laisser une distance latérale d’au moins :', 'En agglomération, la distance minimale est de 1 m avec les deux-roues et les piétons.', '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '7ea7aabb-6dd7-5356-a113-1f260d284d71';
delete from public.question_choices where question_id = '7ea7aabb-6dd7-5356-a113-1f260d284d71' and id not in ('db97387a-0b15-59fa-b7a9-3f7db53442ff', 'aac5f991-ca91-5fee-ac6b-7bd8995960f9', '5847778a-ac62-5996-b66b-c497f19073d4');
insert into public.question_choices (id, question_id, position, label) values ('db97387a-0b15-59fa-b7a9-3f7db53442ff', '7ea7aabb-6dd7-5356-a113-1f260d284d71', 0, '50 cm')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('aac5f991-ca91-5fee-ac6b-7bd8995960f9', '7ea7aabb-6dd7-5356-a113-1f260d284d71', 1, '1 m')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('5847778a-ac62-5996-b66b-c497f19073d4', '7ea7aabb-6dd7-5356-a113-1f260d284d71', 2, '1,50 m')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('7ea7aabb-6dd7-5356-a113-1f260d284d71', 'aac5f991-ca91-5fee-ac6b-7bd8995960f9');
delete from public.question_competences where question_id = '7ea7aabb-6dd7-5356-a113-1f260d284d71';
insert into public.question_competences (question_id, competence_id) values ('7ea7aabb-6dd7-5356-a113-1f260d284d71', '0fb3c8fd-0a66-5281-9a1b-fae51c48915e');
insert into public.question_competences (question_id, competence_id) values ('7ea7aabb-6dd7-5356-a113-1f260d284d71', '4d2a0934-e1b1-5172-9c6f-eacb55406515');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('aff2617e-4cd3-59ba-9d84-a9451a047ebd', 'ex-015', 'Croisement et dépassement', 'Au milieu de la chaussée, une ligne mixte est continue du côté de la voie d’en face et discontinue de mon côté. La voie est libre et dégagée. Ai-je le droit de dépasser ?', 'Une ligne mixte discontinue de son côté autorise le dépassement, à condition qu’il se fasse sans danger.', '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'aff2617e-4cd3-59ba-9d84-a9451a047ebd';
delete from public.question_choices where question_id = 'aff2617e-4cd3-59ba-9d84-a9451a047ebd' and id not in ('9349d1de-962b-52be-9b21-90d81bc25fc4', '4ffd4dea-e573-5031-be7e-bcf88f21b770');
insert into public.question_choices (id, question_id, position, label) values ('9349d1de-962b-52be-9b21-90d81bc25fc4', 'aff2617e-4cd3-59ba-9d84-a9451a047ebd', 0, 'Oui')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('4ffd4dea-e573-5031-be7e-bcf88f21b770', 'aff2617e-4cd3-59ba-9d84-a9451a047ebd', 1, 'Non')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('aff2617e-4cd3-59ba-9d84-a9451a047ebd', '9349d1de-962b-52be-9b21-90d81bc25fc4');
delete from public.question_competences where question_id = 'aff2617e-4cd3-59ba-9d84-a9451a047ebd';
insert into public.question_competences (question_id, competence_id) values ('aff2617e-4cd3-59ba-9d84-a9451a047ebd', '826bd571-a74b-5e7b-ba38-3d612ce34756');
insert into public.question_competences (question_id, competence_id) values ('aff2617e-4cd3-59ba-9d84-a9451a047ebd', 'c3bbdb5b-a721-594f-bacd-c67f7cd97d76');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('1ab524f6-c329-58e7-969a-b07148634893', 'ex-016', 'Croisement et dépassement', 'Je m’apprête à dépasser quand j’aperçois une première flèche de rabattement au sol. Je :', 'Les flèches de rabattement annoncent une ligne continue ou la fin d’un créneau de dépassement : il faut renoncer à dépasser dès la première flèche.', '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '1ab524f6-c329-58e7-969a-b07148634893';
delete from public.question_choices where question_id = '1ab524f6-c329-58e7-969a-b07148634893' and id not in ('cc2ed0b7-14dc-51df-ac57-e5defaefc646', 'c55a7912-66b2-5cff-9239-f46244b46a95');
insert into public.question_choices (id, question_id, position, label) values ('cc2ed0b7-14dc-51df-ac57-e5defaefc646', '1ab524f6-c329-58e7-969a-b07148634893', 0, 'Renonce à dépasser')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('c55a7912-66b2-5cff-9239-f46244b46a95', '1ab524f6-c329-58e7-969a-b07148634893', 1, 'Dépasse rapidement avant la ligne continue')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('1ab524f6-c329-58e7-969a-b07148634893', 'cc2ed0b7-14dc-51df-ac57-e5defaefc646');
delete from public.question_competences where question_id = '1ab524f6-c329-58e7-969a-b07148634893';
insert into public.question_competences (question_id, competence_id) values ('1ab524f6-c329-58e7-969a-b07148634893', '826bd571-a74b-5e7b-ba38-3d612ce34756');
insert into public.question_competences (question_id, competence_id) values ('1ab524f6-c329-58e7-969a-b07148634893', 'c3bbdb5b-a721-594f-bacd-c67f7cd97d76');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('163d9cea-4e1f-5f04-ad75-03158bb3a180', 'ex-017', 'Croisement et dépassement', 'Je peux entreprendre un dépassement si :', 'Il faut notamment une bonne visibilité vers l’avant et la possibilité de reprendre sa place sans gêner ; il est interdit de dépasser quand on est soi-même sur le point d’être dépassé.', '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '163d9cea-4e1f-5f04-ad75-03158bb3a180';
delete from public.question_choices where question_id = '163d9cea-4e1f-5f04-ad75-03158bb3a180' and id not in ('65dc824f-c6b3-5a1b-a751-74a28b6a8e99', 'b89d237e-9ad1-5434-a82d-9f843d5703dd', '8d2b28f3-c1f0-5f0f-8311-834e0686de58');
insert into public.question_choices (id, question_id, position, label) values ('65dc824f-c6b3-5a1b-a751-74a28b6a8e99', '163d9cea-4e1f-5f04-ad75-03158bb3a180', 0, 'J’ai une bonne visibilité vers l’avant')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('b89d237e-9ad1-5434-a82d-9f843d5703dd', '163d9cea-4e1f-5f04-ad75-03158bb3a180', 1, 'Je suis moi-même sur le point d’être dépassé')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('8d2b28f3-c1f0-5f0f-8311-834e0686de58', '163d9cea-4e1f-5f04-ad75-03158bb3a180', 2, 'Je peux reprendre ma place sans gêner la circulation')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('163d9cea-4e1f-5f04-ad75-03158bb3a180', '65dc824f-c6b3-5a1b-a751-74a28b6a8e99');
insert into public.question_answers (question_id, choice_id) values ('163d9cea-4e1f-5f04-ad75-03158bb3a180', '8d2b28f3-c1f0-5f0f-8311-834e0686de58');
delete from public.question_competences where question_id = '163d9cea-4e1f-5f04-ad75-03158bb3a180';
insert into public.question_competences (question_id, competence_id) values ('163d9cea-4e1f-5f04-ad75-03158bb3a180', '826bd571-a74b-5e7b-ba38-3d612ce34756');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('af13b8da-7210-5734-9015-aa8f225023b3', 'ex-018', 'Croisement et dépassement', 'Je suis sur le point d’être dépassé. Je dois :', 'Le conducteur sur le point d’être dépassé doit serrer immédiatement sur sa droite sans accélérer l’allure.', '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'af13b8da-7210-5734-9015-aa8f225023b3';
delete from public.question_choices where question_id = 'af13b8da-7210-5734-9015-aa8f225023b3' and id not in ('beceee00-93e9-5a7d-94ef-517c09962877', '016a82d5-e9de-5abf-a34c-d53b480edbd1', '75ea1043-e7a6-5dc9-b4a0-a1abd69120b6');
insert into public.question_choices (id, question_id, position, label) values ('beceee00-93e9-5a7d-94ef-517c09962877', 'af13b8da-7210-5734-9015-aa8f225023b3', 0, 'Serrer à droite sans accélérer')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('016a82d5-e9de-5abf-a34c-d53b480edbd1', 'af13b8da-7210-5734-9015-aa8f225023b3', 1, 'Accélérer pour ne pas gêner')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('75ea1043-e7a6-5dc9-b4a0-a1abd69120b6', 'af13b8da-7210-5734-9015-aa8f225023b3', 2, 'Freiner fortement')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('af13b8da-7210-5734-9015-aa8f225023b3', 'beceee00-93e9-5a7d-94ef-517c09962877');
delete from public.question_competences where question_id = 'af13b8da-7210-5734-9015-aa8f225023b3';
insert into public.question_competences (question_id, competence_id) values ('af13b8da-7210-5734-9015-aa8f225023b3', '826bd571-a74b-5e7b-ba38-3d612ce34756');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('457d6fa1-227f-5778-97a6-77ca6b8969bf', 'ex-019', 'Croisement et dépassement', 'La voiture devant moi signale qu’elle va tourner à gauche et l’espace à sa droite est suffisant. Je la dépasse :', 'Les dépassements se font par la gauche, sauf exceptions : on dépasse par la droite le conducteur qui signale qu’il change de direction vers la gauche, si l’espace est suffisant.', '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '457d6fa1-227f-5778-97a6-77ca6b8969bf';
delete from public.question_choices where question_id = '457d6fa1-227f-5778-97a6-77ca6b8969bf' and id not in ('b78e2d07-8e35-5726-8827-e02f9f2010b9', '4f73cd58-c3ed-5a5a-9218-86ec51377a8c');
insert into public.question_choices (id, question_id, position, label) values ('b78e2d07-8e35-5726-8827-e02f9f2010b9', '457d6fa1-227f-5778-97a6-77ca6b8969bf', 0, 'Par la droite')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('4f73cd58-c3ed-5a5a-9218-86ec51377a8c', '457d6fa1-227f-5778-97a6-77ca6b8969bf', 1, 'Par la gauche')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('457d6fa1-227f-5778-97a6-77ca6b8969bf', 'b78e2d07-8e35-5726-8827-e02f9f2010b9');
delete from public.question_competences where question_id = '457d6fa1-227f-5778-97a6-77ca6b8969bf';
insert into public.question_competences (question_id, competence_id) values ('457d6fa1-227f-5778-97a6-77ca6b8969bf', '826bd571-a74b-5e7b-ba38-3d612ce34756');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('b4dda051-112a-54b6-b53a-beecd4941d94', 'ex-020', 'Croisement et dépassement', 'Sur une route à double sens, j’approche du sommet d’une côte et je ne vois pas assez loin devant moi. Je dépasse la voiture qui me précède :', 'Tout dépassement est interdit sur une route à double sens lorsque la visibilité vers l’avant est insuffisante, notamment au sommet d’une côte.', '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'b4dda051-112a-54b6-b53a-beecd4941d94';
delete from public.question_choices where question_id = 'b4dda051-112a-54b6-b53a-beecd4941d94' and id not in ('919720e0-7874-5d11-974d-da099a967cf5', '1f134ef0-1030-57b9-ac55-3c0d6ebffbe6');
insert into public.question_choices (id, question_id, position, label) values ('919720e0-7874-5d11-974d-da099a967cf5', 'b4dda051-112a-54b6-b53a-beecd4941d94', 0, 'Oui, si je klaxonne')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('1f134ef0-1030-57b9-ac55-3c0d6ebffbe6', 'b4dda051-112a-54b6-b53a-beecd4941d94', 1, 'Non')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('b4dda051-112a-54b6-b53a-beecd4941d94', '1f134ef0-1030-57b9-ac55-3c0d6ebffbe6');
delete from public.question_competences where question_id = 'b4dda051-112a-54b6-b53a-beecd4941d94';
insert into public.question_competences (question_id, competence_id) values ('b4dda051-112a-54b6-b53a-beecd4941d94', '826bd571-a74b-5e7b-ba38-3d612ce34756');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('0453b0e6-f700-5341-a16b-8c7ba951a59e', 'ex-021', 'Croisement et dépassement', 'À une intersection, je peux dépasser :', 'Aux intersections, tout dépassement autre que celui des véhicules à deux roues est interdit.', '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '0453b0e6-f700-5341-a16b-8c7ba951a59e';
delete from public.question_choices where question_id = '0453b0e6-f700-5341-a16b-8c7ba951a59e' and id not in ('17b17a8d-92ad-51d5-8dcb-38c068c997ca', 'aa76e238-cd81-588b-b7fe-736408685dfa', 'e53aa856-5f42-5238-a01e-e78d91b066d2');
insert into public.question_choices (id, question_id, position, label) values ('17b17a8d-92ad-51d5-8dcb-38c068c997ca', '0453b0e6-f700-5341-a16b-8c7ba951a59e', 0, 'Une voiture')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('aa76e238-cd81-588b-b7fe-736408685dfa', '0453b0e6-f700-5341-a16b-8c7ba951a59e', 1, 'Un véhicule à deux roues')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('e53aa856-5f42-5238-a01e-e78d91b066d2', '0453b0e6-f700-5341-a16b-8c7ba951a59e', 2, 'Un camion')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('0453b0e6-f700-5341-a16b-8c7ba951a59e', 'aa76e238-cd81-588b-b7fe-736408685dfa');
delete from public.question_competences where question_id = '0453b0e6-f700-5341-a16b-8c7ba951a59e';
insert into public.question_competences (question_id, competence_id) values ('0453b0e6-f700-5341-a16b-8c7ba951a59e', '826bd571-a74b-5e7b-ba38-3d612ce34756');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('d13bbd7d-7bf5-587f-956c-7024655e773d', 'ex-022', 'Croisement et dépassement', 'Un tramway est arrêté et des voyageurs descendent du côté où je voudrais le dépasser. Je peux le dépasser de ce côté :', 'Il est interdit de dépasser un tramway à l’arrêt du côté où s’effectuent la montée ou la descente des voyageurs.', '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'd13bbd7d-7bf5-587f-956c-7024655e773d';
delete from public.question_choices where question_id = 'd13bbd7d-7bf5-587f-956c-7024655e773d' and id not in ('6da491bd-41d2-5e59-a92c-ac3673160bfd', '998022c6-29b6-56a4-8556-c441797f313e');
insert into public.question_choices (id, question_id, position, label) values ('6da491bd-41d2-5e59-a92c-ac3673160bfd', 'd13bbd7d-7bf5-587f-956c-7024655e773d', 0, 'Oui, au pas')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('998022c6-29b6-56a4-8556-c441797f313e', 'd13bbd7d-7bf5-587f-956c-7024655e773d', 1, 'Non')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('d13bbd7d-7bf5-587f-956c-7024655e773d', '998022c6-29b6-56a4-8556-c441797f313e');
delete from public.question_competences where question_id = 'd13bbd7d-7bf5-587f-956c-7024655e773d';
insert into public.question_competences (question_id, competence_id) values ('d13bbd7d-7bf5-587f-956c-7024655e773d', '826bd571-a74b-5e7b-ba38-3d612ce34756');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('c0de73eb-ea78-5219-9a0f-9306c38c436f', 'ex-023', 'Éclairage et météo', 'La nuit, hors agglomération, je roule en feux de route et une voiture arrive en face. Je dois :', 'Au moment de croiser un autre véhicule, il faut utiliser les feux de croisement, suffisamment tôt pour ne pas éblouir.', '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'c0de73eb-ea78-5219-9a0f-9306c38c436f';
delete from public.question_choices where question_id = 'c0de73eb-ea78-5219-9a0f-9306c38c436f' and id not in ('8851526f-f5a2-56d8-8230-393069f9c1c4', 'fa194f45-acea-5ff3-a261-95dbcd110ab3', 'b007b208-6b18-53d3-bea0-f5e1bf913b23');
insert into public.question_choices (id, question_id, position, label) values ('8851526f-f5a2-56d8-8230-393069f9c1c4', 'c0de73eb-ea78-5219-9a0f-9306c38c436f', 0, 'Passer en feux de croisement')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('fa194f45-acea-5ff3-a261-95dbcd110ab3', 'c0de73eb-ea78-5219-9a0f-9306c38c436f', 1, 'Garder mes feux de route')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('b007b208-6b18-53d3-bea0-f5e1bf913b23', 'c0de73eb-ea78-5219-9a0f-9306c38c436f', 2, 'Allumer mes feux de brouillard')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('c0de73eb-ea78-5219-9a0f-9306c38c436f', '8851526f-f5a2-56d8-8230-393069f9c1c4');
delete from public.question_competences where question_id = 'c0de73eb-ea78-5219-9a0f-9306c38c436f';
insert into public.question_competences (question_id, competence_id) values ('c0de73eb-ea78-5219-9a0f-9306c38c436f', '6dbd753d-1595-5e3e-817c-9cdb33b47aec');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('cc9772bb-94b7-5224-9319-629691e3b89f', 'ex-024', 'Éclairage et météo', 'La nuit, hors agglomération, je suis une voiture à faible distance sans vouloir la dépasser. J’utilise :', 'Quand on suit un autre véhicule à faible distance (hors manœuvre de dépassement), on circule en feux de croisement pour ne pas éblouir.', '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'cc9772bb-94b7-5224-9319-629691e3b89f';
delete from public.question_choices where question_id = 'cc9772bb-94b7-5224-9319-629691e3b89f' and id not in ('1acf690c-aa45-581a-a143-79cf59f7e36c', '6e00e2cf-ff55-52ee-b1a3-808896db28a0');
insert into public.question_choices (id, question_id, position, label) values ('1acf690c-aa45-581a-a143-79cf59f7e36c', 'cc9772bb-94b7-5224-9319-629691e3b89f', 0, 'Mes feux de croisement')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('6e00e2cf-ff55-52ee-b1a3-808896db28a0', 'cc9772bb-94b7-5224-9319-629691e3b89f', 1, 'Mes feux de route')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('cc9772bb-94b7-5224-9319-629691e3b89f', '1acf690c-aa45-581a-a143-79cf59f7e36c');
delete from public.question_competences where question_id = 'cc9772bb-94b7-5224-9319-629691e3b89f';
insert into public.question_competences (question_id, competence_id) values ('cc9772bb-94b7-5224-9319-629691e3b89f', '6dbd753d-1595-5e3e-817c-9cdb33b47aec');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('b997ba88-68d0-5af9-bc82-010f8f168d6b', 'ex-025', 'Éclairage et météo', 'Il pleut fortement, sans brouillard ni neige. J’allume mes feux de brouillard arrière :', 'Les feux de brouillard arrière sont très éblouissants : seulement en cas de brouillard ou de chute de neige, jamais sous la pluie.', '[{"title":"Conduire par temps de brouillard","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-selon-la-meteo/conduire-par-temps-de-brouillard","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'b997ba88-68d0-5af9-bc82-010f8f168d6b';
delete from public.question_choices where question_id = 'b997ba88-68d0-5af9-bc82-010f8f168d6b' and id not in ('c380d8c8-e1f7-5ab3-a8ea-64c9fddd3e67', '1731886e-e5e2-5d74-b730-cad0cb67b12a');
insert into public.question_choices (id, question_id, position, label) values ('c380d8c8-e1f7-5ab3-a8ea-64c9fddd3e67', 'b997ba88-68d0-5af9-bc82-010f8f168d6b', 0, 'Oui')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('1731886e-e5e2-5d74-b730-cad0cb67b12a', 'b997ba88-68d0-5af9-bc82-010f8f168d6b', 1, 'Non')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('b997ba88-68d0-5af9-bc82-010f8f168d6b', '1731886e-e5e2-5d74-b730-cad0cb67b12a');
delete from public.question_competences where question_id = 'b997ba88-68d0-5af9-bc82-010f8f168d6b';
insert into public.question_competences (question_id, competence_id) values ('b997ba88-68d0-5af9-bc82-010f8f168d6b', '6dbd753d-1595-5e3e-817c-9cdb33b47aec');
insert into public.question_competences (question_id, competence_id) values ('b997ba88-68d0-5af9-bc82-010f8f168d6b', '3647f5af-2b62-567f-a0e2-281cc052752d');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('45556d84-a8d1-5bc9-a389-4171f971a0cc', 'ex-026', 'Éclairage et météo', 'En entrant dans un tunnel bien éclairé, j’allume :', 'En entrant dans un tunnel, il faut allumer les feux de croisement, même si le tunnel est éclairé.', '[{"title":"Conduire dans un tunnel","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/conduire-dans-un-tunnel","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '45556d84-a8d1-5bc9-a389-4171f971a0cc';
delete from public.question_choices where question_id = '45556d84-a8d1-5bc9-a389-4171f971a0cc' and id not in ('c4e003c2-3b87-5b26-af76-1ad9680598ac', '4bb4d02c-5663-54cc-9594-ea1e34e28a14', 'ea73a010-c271-5314-bfff-0d0c8d5bc8d5');
insert into public.question_choices (id, question_id, position, label) values ('c4e003c2-3b87-5b26-af76-1ad9680598ac', '45556d84-a8d1-5bc9-a389-4171f971a0cc', 0, 'Mes feux de croisement')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('4bb4d02c-5663-54cc-9594-ea1e34e28a14', '45556d84-a8d1-5bc9-a389-4171f971a0cc', 1, 'Aucun feu : le tunnel est éclairé')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('ea73a010-c271-5314-bfff-0d0c8d5bc8d5', '45556d84-a8d1-5bc9-a389-4171f971a0cc', 2, 'Mes feux de brouillard arrière')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('45556d84-a8d1-5bc9-a389-4171f971a0cc', 'c4e003c2-3b87-5b26-af76-1ad9680598ac');
delete from public.question_competences where question_id = '45556d84-a8d1-5bc9-a389-4171f971a0cc';
insert into public.question_competences (question_id, competence_id) values ('45556d84-a8d1-5bc9-a389-4171f971a0cc', '6dbd753d-1595-5e3e-817c-9cdb33b47aec');
insert into public.question_competences (question_id, competence_id) values ('45556d84-a8d1-5bc9-a389-4171f971a0cc', '8d9197d8-6c24-50f3-b193-ada8b816fe81');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('efed8a3a-59ac-587e-b795-774e9b73a1f8', 'ex-027', 'Autoroute', 'Sur autoroute, j’ai manqué ma sortie. J’ai le droit de faire marche arrière sur la bande d’arrêt d’urgence :', 'Sur autoroute, la marche arrière et le demi-tour sont interdits, même par une interruption du terre-plein central.', '[{"title":"Autoroute","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/autoroute","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'efed8a3a-59ac-587e-b795-774e9b73a1f8';
delete from public.question_choices where question_id = 'efed8a3a-59ac-587e-b795-774e9b73a1f8' and id not in ('ee2769c9-41d4-524d-903c-ca32210d1fb6', '33d6db43-abfb-5b6d-973e-4eba33be185e');
insert into public.question_choices (id, question_id, position, label) values ('ee2769c9-41d4-524d-903c-ca32210d1fb6', 'efed8a3a-59ac-587e-b795-774e9b73a1f8', 0, 'Oui, si personne n’arrive')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('33d6db43-abfb-5b6d-973e-4eba33be185e', 'efed8a3a-59ac-587e-b795-774e9b73a1f8', 1, 'Non')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('efed8a3a-59ac-587e-b795-774e9b73a1f8', '33d6db43-abfb-5b6d-973e-4eba33be185e');
delete from public.question_competences where question_id = 'efed8a3a-59ac-587e-b795-774e9b73a1f8';
insert into public.question_competences (question_id, competence_id) values ('efed8a3a-59ac-587e-b795-774e9b73a1f8', '4a75d17c-eda5-5f78-8dfd-d1fca5ba8560');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('124c56d7-4524-5e91-8788-55641d9eb27d', 'ex-028', 'Autoroute', 'Parmi ces usagers, lesquels sont interdits sur autoroute ?', 'L’autoroute est notamment interdite aux piétons, aux animaux, aux véhicules sans moteur et aux cyclomoteurs. Les motocyclettes ne figurent pas dans cette liste.', '[{"title":"Autoroute","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/autoroute","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '124c56d7-4524-5e91-8788-55641d9eb27d';
delete from public.question_choices where question_id = '124c56d7-4524-5e91-8788-55641d9eb27d' and id not in ('636de2c4-53ee-5cb8-85ec-9f147401b32d', 'ca32ca13-e755-51cb-9d1e-479f263718c2', '91b10f71-8b07-584a-afa1-807b618115cc');
insert into public.question_choices (id, question_id, position, label) values ('636de2c4-53ee-5cb8-85ec-9f147401b32d', '124c56d7-4524-5e91-8788-55641d9eb27d', 0, 'Les piétons')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('ca32ca13-e755-51cb-9d1e-479f263718c2', '124c56d7-4524-5e91-8788-55641d9eb27d', 1, 'Les cyclomoteurs')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('91b10f71-8b07-584a-afa1-807b618115cc', '124c56d7-4524-5e91-8788-55641d9eb27d', 2, 'Les motocyclettes')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('124c56d7-4524-5e91-8788-55641d9eb27d', '636de2c4-53ee-5cb8-85ec-9f147401b32d');
insert into public.question_answers (question_id, choice_id) values ('124c56d7-4524-5e91-8788-55641d9eb27d', 'ca32ca13-e755-51cb-9d1e-479f263718c2');
delete from public.question_competences where question_id = '124c56d7-4524-5e91-8788-55641d9eb27d';
insert into public.question_competences (question_id, competence_id) values ('124c56d7-4524-5e91-8788-55641d9eb27d', '4a75d17c-eda5-5f78-8dfd-d1fca5ba8560');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('89d4195d-9ff8-595a-be37-37bfc0b9c484', 'ex-029', 'Autoroute', 'Sur autoroute, je peux m’arrêter sur la bande d’arrêt d’urgence :', 'Sauf nécessité absolue, il est interdit de s’arrêter ou de stationner sur la bande d’arrêt d’urgence.', '[{"title":"Autoroute","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/autoroute","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '89d4195d-9ff8-595a-be37-37bfc0b9c484';
delete from public.question_choices where question_id = '89d4195d-9ff8-595a-be37-37bfc0b9c484' and id not in ('eb135bc4-621f-50f6-8d82-113a467326ba', '50946a26-ca4a-54b3-979e-84f6054d568d', 'c90fba34-0009-5c9a-b6e6-b0ff644fd1f2');
insert into public.question_choices (id, question_id, position, label) values ('eb135bc4-621f-50f6-8d82-113a467326ba', '89d4195d-9ff8-595a-be37-37bfc0b9c484', 0, 'Pour téléphoner')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('50946a26-ca4a-54b3-979e-84f6054d568d', '89d4195d-9ff8-595a-be37-37bfc0b9c484', 1, 'Uniquement en cas de nécessité absolue')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('c90fba34-0009-5c9a-b6e6-b0ff644fd1f2', '89d4195d-9ff8-595a-be37-37bfc0b9c484', 2, 'Pour me reposer quelques minutes')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('89d4195d-9ff8-595a-be37-37bfc0b9c484', '50946a26-ca4a-54b3-979e-84f6054d568d');
delete from public.question_competences where question_id = '89d4195d-9ff8-595a-be37-37bfc0b9c484';
insert into public.question_competences (question_id, competence_id) values ('89d4195d-9ff8-595a-be37-37bfc0b9c484', '4a75d17c-eda5-5f78-8dfd-d1fca5ba8560');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('453aa7bf-a96f-5a45-8168-feb0244163ce', 'ex-030', 'Autoroute', 'Ma voiture tombe en panne sur autoroute ; je l’arrête sur la bande d’arrêt d’urgence. Je :', 'Feux de détresse, gilet porté avant de sortir, puis tout le monde à l’abri derrière la barrière de sécurité en attendant les secours.', '[{"title":"Véhicule en panne : conseils pratiques","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/vehicule-en-panne-conseils-pratiques","consulted_at":"2026-10-22"},{"title":"Équipements obligatoires en voiture","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-modes-de-deplacements/en-voiture/equipements-obligatoires-en-voiture","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '453aa7bf-a96f-5a45-8168-feb0244163ce';
delete from public.question_choices where question_id = '453aa7bf-a96f-5a45-8168-feb0244163ce' and id not in ('fff9bc67-3774-5c67-bdb1-0bd594033ff3', 'fa17a846-ce60-51e9-824c-ec227557303f', 'ecbf4542-cf47-526c-83f7-c713e28fa20b', 'cc174167-06b7-5739-9ba6-4348787668b5');
insert into public.question_choices (id, question_id, position, label) values ('fff9bc67-3774-5c67-bdb1-0bd594033ff3', '453aa7bf-a96f-5a45-8168-feb0244163ce', 0, 'Allume mes feux de détresse')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('fa17a846-ce60-51e9-824c-ec227557303f', '453aa7bf-a96f-5a45-8168-feb0244163ce', 1, 'Enfile mon gilet avant de sortir')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('ecbf4542-cf47-526c-83f7-c713e28fa20b', '453aa7bf-a96f-5a45-8168-feb0244163ce', 2, 'Mets mes passagers à l’abri derrière la barrière de sécurité')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('cc174167-06b7-5739-9ba6-4348787668b5', '453aa7bf-a96f-5a45-8168-feb0244163ce', 3, 'Reste dans la voiture avec mes passagers')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('453aa7bf-a96f-5a45-8168-feb0244163ce', 'fff9bc67-3774-5c67-bdb1-0bd594033ff3');
insert into public.question_answers (question_id, choice_id) values ('453aa7bf-a96f-5a45-8168-feb0244163ce', 'fa17a846-ce60-51e9-824c-ec227557303f');
insert into public.question_answers (question_id, choice_id) values ('453aa7bf-a96f-5a45-8168-feb0244163ce', 'ecbf4542-cf47-526c-83f7-c713e28fa20b');
delete from public.question_competences where question_id = '453aa7bf-a96f-5a45-8168-feb0244163ce';
insert into public.question_competences (question_id, competence_id) values ('453aa7bf-a96f-5a45-8168-feb0244163ce', 'ad7e4ff8-02e2-51f2-955e-6689b0731b71');
insert into public.question_competences (question_id, competence_id) values ('453aa7bf-a96f-5a45-8168-feb0244163ce', '4a75d17c-eda5-5f78-8dfd-d1fca5ba8560');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('56f6f8d4-4aa5-5884-97bc-c2caa65c6b98', 'ex-031', 'Autoroute', 'Après un arrêt d’urgence sur la bande d’arrêt d’urgence d’une autoroute, je sors de mon véhicule :', 'Sur autoroute, revêtu de son gilet, le conducteur sort côté passager et se place au plus vite derrière les glissières.', '[{"title":"Équipements obligatoires en voiture","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-modes-de-deplacements/en-voiture/equipements-obligatoires-en-voiture","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '56f6f8d4-4aa5-5884-97bc-c2caa65c6b98';
delete from public.question_choices where question_id = '56f6f8d4-4aa5-5884-97bc-c2caa65c6b98' and id not in ('6e6d0f6e-711c-55ef-a077-8ff045cf0a59', '2e4092d6-dd50-5e03-9ed5-7d3f5e9bf4e0');
insert into public.question_choices (id, question_id, position, label) values ('6e6d0f6e-711c-55ef-a077-8ff045cf0a59', '56f6f8d4-4aa5-5884-97bc-c2caa65c6b98', 0, 'Côté conducteur')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('2e4092d6-dd50-5e03-9ed5-7d3f5e9bf4e0', '56f6f8d4-4aa5-5884-97bc-c2caa65c6b98', 1, 'Côté passager')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('56f6f8d4-4aa5-5884-97bc-c2caa65c6b98', '2e4092d6-dd50-5e03-9ed5-7d3f5e9bf4e0');
delete from public.question_competences where question_id = '56f6f8d4-4aa5-5884-97bc-c2caa65c6b98';
insert into public.question_competences (question_id, competence_id) values ('56f6f8d4-4aa5-5884-97bc-c2caa65c6b98', 'ad7e4ff8-02e2-51f2-955e-6689b0731b71');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('385a5650-d4eb-5814-86f4-4d677e6bf42b', 'ex-032', 'Vitesse', 'Sur autoroute, par temps de pluie, la vitesse maximale autorisée pour une voiture (hors permis probatoire) est de :', 'Sur autoroute : 130 km/h en conditions normales, 110 km/h par temps de pluie ou autres précipitations.', '[{"title":"Réglementation de la vitesse au volant","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-risques/reglementation-de-la-vitesse-au-volant","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '385a5650-d4eb-5814-86f4-4d677e6bf42b';
delete from public.question_choices where question_id = '385a5650-d4eb-5814-86f4-4d677e6bf42b' and id not in ('437ea533-c79e-5a0c-aa8d-94ffdba9f5dd', '2b6be47d-d0ab-52ed-9603-ebda7a1a56d7', '6776f0df-9516-5d70-b4b8-1a506a705a73');
insert into public.question_choices (id, question_id, position, label) values ('437ea533-c79e-5a0c-aa8d-94ffdba9f5dd', '385a5650-d4eb-5814-86f4-4d677e6bf42b', 0, '130 km/h')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('2b6be47d-d0ab-52ed-9603-ebda7a1a56d7', '385a5650-d4eb-5814-86f4-4d677e6bf42b', 1, '110 km/h')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('6776f0df-9516-5d70-b4b8-1a506a705a73', '385a5650-d4eb-5814-86f4-4d677e6bf42b', 2, '90 km/h')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('385a5650-d4eb-5814-86f4-4d677e6bf42b', '2b6be47d-d0ab-52ed-9603-ebda7a1a56d7');
delete from public.question_competences where question_id = '385a5650-d4eb-5814-86f4-4d677e6bf42b';
insert into public.question_competences (question_id, competence_id) values ('385a5650-d4eb-5814-86f4-4d677e6bf42b', 'a338089b-b643-5a4b-aa5f-17931e569ec7');
insert into public.question_competences (question_id, competence_id) values ('385a5650-d4eb-5814-86f4-4d677e6bf42b', '3647f5af-2b62-567f-a0e2-281cc052752d');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('0d28c496-b304-5e84-90b2-8f28a1a578db', 'ex-033', 'Vitesse', 'Le brouillard réduit la visibilité à moins de 50 mètres. Sur autoroute, la vitesse maximale autorisée est de :', 'Par visibilité inférieure à 50 m, la vitesse maximale est abaissée à 50 km/h sur l’ensemble du réseau.', '[{"title":"Réglementation de la vitesse au volant","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-risques/reglementation-de-la-vitesse-au-volant","consulted_at":"2026-10-22"},{"title":"Conduire par temps de brouillard","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-selon-la-meteo/conduire-par-temps-de-brouillard","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '0d28c496-b304-5e84-90b2-8f28a1a578db';
delete from public.question_choices where question_id = '0d28c496-b304-5e84-90b2-8f28a1a578db' and id not in ('78c1fe64-65f2-5d53-aeab-ea5873ef4553', 'bb273f42-45a3-5639-9e73-25b89c6cbe8c', 'b5478581-998b-5628-a3f3-1db71b296ea0');
insert into public.question_choices (id, question_id, position, label) values ('78c1fe64-65f2-5d53-aeab-ea5873ef4553', '0d28c496-b304-5e84-90b2-8f28a1a578db', 0, '50 km/h')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('bb273f42-45a3-5639-9e73-25b89c6cbe8c', '0d28c496-b304-5e84-90b2-8f28a1a578db', 1, '70 km/h')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('b5478581-998b-5628-a3f3-1db71b296ea0', '0d28c496-b304-5e84-90b2-8f28a1a578db', 2, '90 km/h')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('0d28c496-b304-5e84-90b2-8f28a1a578db', '78c1fe64-65f2-5d53-aeab-ea5873ef4553');
delete from public.question_competences where question_id = '0d28c496-b304-5e84-90b2-8f28a1a578db';
insert into public.question_competences (question_id, competence_id) values ('0d28c496-b304-5e84-90b2-8f28a1a578db', 'a338089b-b643-5a4b-aa5f-17931e569ec7');
insert into public.question_competences (question_id, competence_id) values ('0d28c496-b304-5e84-90b2-8f28a1a578db', '3647f5af-2b62-567f-a0e2-281cc052752d');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('de7890a5-ae95-52a6-9d35-6a7878ccd7df', 'ex-034', 'Vitesse', 'J’ai mon permis depuis un an (permis probatoire, sans apprentissage anticipé). Sur une autoroute limitée à 130 km/h, par beau temps, je ne dois pas dépasser :', 'Pendant la période probatoire, la vitesse est limitée à 110 km/h sur autoroute.', '[{"title":"Réglementation de la vitesse au volant","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-risques/reglementation-de-la-vitesse-au-volant","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'de7890a5-ae95-52a6-9d35-6a7878ccd7df';
delete from public.question_choices where question_id = 'de7890a5-ae95-52a6-9d35-6a7878ccd7df' and id not in ('b58d8456-5f1c-5a3e-94bc-d8dededb6f59', 'a71f1e7b-219a-5fce-9f82-6f37b9dfc8a5', '04cc24e4-da33-52b4-9794-e393b45eea92');
insert into public.question_choices (id, question_id, position, label) values ('b58d8456-5f1c-5a3e-94bc-d8dededb6f59', 'de7890a5-ae95-52a6-9d35-6a7878ccd7df', 0, '130 km/h')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('a71f1e7b-219a-5fce-9f82-6f37b9dfc8a5', 'de7890a5-ae95-52a6-9d35-6a7878ccd7df', 1, '110 km/h')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('04cc24e4-da33-52b4-9794-e393b45eea92', 'de7890a5-ae95-52a6-9d35-6a7878ccd7df', 2, '90 km/h')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('de7890a5-ae95-52a6-9d35-6a7878ccd7df', 'a71f1e7b-219a-5fce-9f82-6f37b9dfc8a5');
delete from public.question_competences where question_id = 'de7890a5-ae95-52a6-9d35-6a7878ccd7df';
insert into public.question_competences (question_id, competence_id) values ('de7890a5-ae95-52a6-9d35-6a7878ccd7df', 'a338089b-b643-5a4b-aa5f-17931e569ec7');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('592fb035-fcc3-5f20-a126-0d777171be35', 'ex-035', 'Vitesse', 'En agglomération, sauf signalisation contraire, la vitesse maximale autorisée est de :', 'En agglomération, la vitesse est limitée à 50 km/h.', '[{"title":"Réglementation de la vitesse au volant","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-risques/reglementation-de-la-vitesse-au-volant","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '592fb035-fcc3-5f20-a126-0d777171be35';
delete from public.question_choices where question_id = '592fb035-fcc3-5f20-a126-0d777171be35' and id not in ('2912532b-3c1d-54e1-95c0-09485e257c5b', 'ba55e664-e476-5b74-b1ec-e7820e4405cc', 'd12ce07b-b630-59be-a254-9c0cd8a4c572');
insert into public.question_choices (id, question_id, position, label) values ('2912532b-3c1d-54e1-95c0-09485e257c5b', '592fb035-fcc3-5f20-a126-0d777171be35', 0, '30 km/h')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('ba55e664-e476-5b74-b1ec-e7820e4405cc', '592fb035-fcc3-5f20-a126-0d777171be35', 1, '50 km/h')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('d12ce07b-b630-59be-a254-9c0cd8a4c572', '592fb035-fcc3-5f20-a126-0d777171be35', 2, '70 km/h')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('592fb035-fcc3-5f20-a126-0d777171be35', 'ba55e664-e476-5b74-b1ec-e7820e4405cc');
delete from public.question_competences where question_id = '592fb035-fcc3-5f20-a126-0d777171be35';
insert into public.question_competences (question_id, competence_id) values ('592fb035-fcc3-5f20-a126-0d777171be35', 'a338089b-b643-5a4b-aa5f-17931e569ec7');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('22f538dc-d159-5104-a0e6-7647f306c856', 'ex-036', 'Vitesse', 'Hors agglomération, sur une route à double sens sans séparateur central, la vitesse maximale est en principe de :', '80 km/h en principe ; le président du conseil départemental peut la relever à 90 km/h, après avis du préfet et de la commission départementale de sécurité routière.', '[{"title":"Réglementation de la vitesse au volant","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-risques/reglementation-de-la-vitesse-au-volant","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '22f538dc-d159-5104-a0e6-7647f306c856';
delete from public.question_choices where question_id = '22f538dc-d159-5104-a0e6-7647f306c856' and id not in ('fcf25fd0-77f5-5be0-8a19-1706f7413b68', '2d21cc74-f212-52f0-86cf-92971d29bab6', '8dad4eb5-d323-5e53-a8ee-14154fb488e6');
insert into public.question_choices (id, question_id, position, label) values ('fcf25fd0-77f5-5be0-8a19-1706f7413b68', '22f538dc-d159-5104-a0e6-7647f306c856', 0, '80 km/h')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('2d21cc74-f212-52f0-86cf-92971d29bab6', '22f538dc-d159-5104-a0e6-7647f306c856', 1, '100 km/h')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('8dad4eb5-d323-5e53-a8ee-14154fb488e6', '22f538dc-d159-5104-a0e6-7647f306c856', 2, '110 km/h')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('22f538dc-d159-5104-a0e6-7647f306c856', 'fcf25fd0-77f5-5be0-8a19-1706f7413b68');
delete from public.question_competences where question_id = '22f538dc-d159-5104-a0e6-7647f306c856';
insert into public.question_competences (question_id, competence_id) values ('22f538dc-d159-5104-a0e6-7647f306c856', 'a338089b-b643-5a4b-aa5f-17931e569ec7');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('d71775a5-bc16-55d9-a786-96251797e1d1', 'ex-037', 'Vitesse', 'Sur une route limitée à 50 km/h, l’excès de vitesse retenu contre moi est de 14 km/h. Je perds :', 'Un excès de moins de 20 km/h, là où la vitesse maximale est inférieure ou égale à 50 km/h, entraîne le retrait d’un point (et une amende forfaitaire de 135 €).', '[{"title":"Réglementation de la vitesse au volant","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-risques/reglementation-de-la-vitesse-au-volant","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'd71775a5-bc16-55d9-a786-96251797e1d1';
delete from public.question_choices where question_id = 'd71775a5-bc16-55d9-a786-96251797e1d1' and id not in ('865ef62a-4044-575e-b057-353bbf5527d4', '508c01b5-371c-5479-99b2-bf3410d689d3', 'b1011180-e28c-5290-aef7-a06df8a275c6');
insert into public.question_choices (id, question_id, position, label) values ('865ef62a-4044-575e-b057-353bbf5527d4', 'd71775a5-bc16-55d9-a786-96251797e1d1', 0, '1 point')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('508c01b5-371c-5479-99b2-bf3410d689d3', 'd71775a5-bc16-55d9-a786-96251797e1d1', 1, '2 points')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('b1011180-e28c-5290-aef7-a06df8a275c6', 'd71775a5-bc16-55d9-a786-96251797e1d1', 2, '3 points')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('d71775a5-bc16-55d9-a786-96251797e1d1', '865ef62a-4044-575e-b057-353bbf5527d4');
delete from public.question_competences where question_id = 'd71775a5-bc16-55d9-a786-96251797e1d1';
insert into public.question_competences (question_id, competence_id) values ('d71775a5-bc16-55d9-a786-96251797e1d1', 'a338089b-b643-5a4b-aa5f-17931e569ec7');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('13a4b45d-8c08-5d28-b901-7ad7ba90c87d', 'ex-038', 'Alcool et stupéfiants', 'Je suis titulaire d’un permis probatoire. Le taux d’alcool à ne pas atteindre est de :', 'Pour les permis probatoires et les conducteurs en apprentissage, la limite est de 0,2 g/l de sang (0,10 mg/l d’air expiré).', '[{"title":"Réglementation de l’alcool au volant","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-risques/reglementation-de-lalcool-au-volant","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '13a4b45d-8c08-5d28-b901-7ad7ba90c87d';
delete from public.question_choices where question_id = '13a4b45d-8c08-5d28-b901-7ad7ba90c87d' and id not in ('ad4fd9de-cfec-596d-9e63-9740c24f2b3f', '9dd2fae8-b05c-5590-8482-0d43c13dcf12', '07a9b215-d8a7-5ea7-9631-9171e3b6e8af');
insert into public.question_choices (id, question_id, position, label) values ('ad4fd9de-cfec-596d-9e63-9740c24f2b3f', '13a4b45d-8c08-5d28-b901-7ad7ba90c87d', 0, '0,2 g par litre de sang')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('9dd2fae8-b05c-5590-8482-0d43c13dcf12', '13a4b45d-8c08-5d28-b901-7ad7ba90c87d', 1, '0,5 g par litre de sang')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('07a9b215-d8a7-5ea7-9631-9171e3b6e8af', '13a4b45d-8c08-5d28-b901-7ad7ba90c87d', 2, '0,8 g par litre de sang')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('13a4b45d-8c08-5d28-b901-7ad7ba90c87d', 'ad4fd9de-cfec-596d-9e63-9740c24f2b3f');
delete from public.question_competences where question_id = '13a4b45d-8c08-5d28-b901-7ad7ba90c87d';
insert into public.question_competences (question_id, competence_id) values ('13a4b45d-8c08-5d28-b901-7ad7ba90c87d', '3675dc03-ddc7-5e0a-975b-07979a5a2cfd');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('08452b50-d08b-5bf7-916a-4468ba083e43', 'ex-039', 'Alcool et stupéfiants', 'La limite de 0,5 g d’alcool par litre de sang correspond, dans l’air expiré, à :', '0,5 g/l de sang équivaut à 0,25 mg/l d’air expiré.', '[{"title":"Réglementation de l’alcool au volant","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-risques/reglementation-de-lalcool-au-volant","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '08452b50-d08b-5bf7-916a-4468ba083e43';
delete from public.question_choices where question_id = '08452b50-d08b-5bf7-916a-4468ba083e43' and id not in ('638e5671-21ff-57bf-a186-3b45ad85d2c8', '304bf968-0dfb-516d-bbfb-50c975dea0d1', 'edb5af3e-b81a-5b4f-9607-8c3baa2f5e4a');
insert into public.question_choices (id, question_id, position, label) values ('638e5671-21ff-57bf-a186-3b45ad85d2c8', '08452b50-d08b-5bf7-916a-4468ba083e43', 0, '0,10 mg par litre')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('304bf968-0dfb-516d-bbfb-50c975dea0d1', '08452b50-d08b-5bf7-916a-4468ba083e43', 1, '0,25 mg par litre')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('edb5af3e-b81a-5b4f-9607-8c3baa2f5e4a', '08452b50-d08b-5bf7-916a-4468ba083e43', 2, '0,40 mg par litre')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('08452b50-d08b-5bf7-916a-4468ba083e43', '304bf968-0dfb-516d-bbfb-50c975dea0d1');
delete from public.question_competences where question_id = '08452b50-d08b-5bf7-916a-4468ba083e43';
insert into public.question_competences (question_id, competence_id) values ('08452b50-d08b-5bf7-916a-4468ba083e43', '3675dc03-ddc7-5e0a-975b-07979a5a2cfd');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('d95509db-78e9-5e54-99ad-cf8f7a58cb7c', 'ex-040', 'Alcool et stupéfiants', 'Pour faire baisser plus vite mon taux d’alcool, je peux :', 'L’alcoolémie baisse en moyenne de 0,10 à 0,15 g/l par heure ; aucun « truc » ne permet d’éliminer l’alcool plus vite.', '[{"title":"Réglementation de l’alcool au volant","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-risques/reglementation-de-lalcool-au-volant","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'd95509db-78e9-5e54-99ad-cf8f7a58cb7c';
delete from public.question_choices where question_id = 'd95509db-78e9-5e54-99ad-cf8f7a58cb7c' and id not in ('9f8acf79-0e01-5148-9f68-c5e29943ba0d', 'a3edf5d2-007a-59cf-adc0-79b728f7845d', 'b85daa28-f929-50b6-898f-bd1e83bee65e');
insert into public.question_choices (id, question_id, position, label) values ('9f8acf79-0e01-5148-9f68-c5e29943ba0d', 'd95509db-78e9-5e54-99ad-cf8f7a58cb7c', 0, 'Boire un café salé')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('a3edf5d2-007a-59cf-adc0-79b728f7845d', 'd95509db-78e9-5e54-99ad-cf8f7a58cb7c', 1, 'Avaler une cuillerée d’huile')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('b85daa28-f929-50b6-898f-bd1e83bee65e', 'd95509db-78e9-5e54-99ad-cf8f7a58cb7c', 2, 'Rien : seul le temps fait baisser le taux')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('d95509db-78e9-5e54-99ad-cf8f7a58cb7c', 'b85daa28-f929-50b6-898f-bd1e83bee65e');
delete from public.question_competences where question_id = 'd95509db-78e9-5e54-99ad-cf8f7a58cb7c';
insert into public.question_competences (question_id, competence_id) values ('d95509db-78e9-5e54-99ad-cf8f7a58cb7c', '3675dc03-ddc7-5e0a-975b-07979a5a2cfd');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('a6cc210b-eca4-5d61-b1f3-6717c24d3c3e', 'ex-041', 'Alcool et stupéfiants', 'Conduire avec un taux d’alcool égal ou supérieur à 0,8 g par litre de sang constitue :', 'Entre 0,5 et 0,8 g/l, c’est une contravention de 4ᵉ classe ; à partir de 0,8 g/l, c’est un délit.', '[{"title":"Réglementation de l’alcool au volant","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-risques/reglementation-de-lalcool-au-volant","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'a6cc210b-eca4-5d61-b1f3-6717c24d3c3e';
delete from public.question_choices where question_id = 'a6cc210b-eca4-5d61-b1f3-6717c24d3c3e' and id not in ('057a97be-c09b-5ce9-a739-cdef56d8ce0b', 'd062c931-b78f-5794-ab3f-1b9b886791e9');
insert into public.question_choices (id, question_id, position, label) values ('057a97be-c09b-5ce9-a739-cdef56d8ce0b', 'a6cc210b-eca4-5d61-b1f3-6717c24d3c3e', 0, 'Une contravention')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('d062c931-b78f-5794-ab3f-1b9b886791e9', 'a6cc210b-eca4-5d61-b1f3-6717c24d3c3e', 1, 'Un délit')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('a6cc210b-eca4-5d61-b1f3-6717c24d3c3e', 'd062c931-b78f-5794-ab3f-1b9b886791e9');
delete from public.question_competences where question_id = 'a6cc210b-eca4-5d61-b1f3-6717c24d3c3e';
insert into public.question_competences (question_id, competence_id) values ('a6cc210b-eca4-5d61-b1f3-6717c24d3c3e', '3675dc03-ddc7-5e0a-975b-07979a5a2cfd');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('0c0b3b29-b5a3-5375-9157-072534a24d93', 'ex-042', 'Alcool et stupéfiants', 'La conduite après usage de stupéfiants est interdite :', 'Conduire après avoir fait usage de stupéfiants est interdit, quelle que soit la quantité absorbée.', '[{"title":"Réglementation de la drogue au volant","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-risques/reglementation-de-la-drogue-au-volant","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '0c0b3b29-b5a3-5375-9157-072534a24d93';
delete from public.question_choices where question_id = '0c0b3b29-b5a3-5375-9157-072534a24d93' and id not in ('4f63c787-dfaa-5f35-a931-892d70b335f2', '8c1da30d-43fd-5ee8-b209-d2107ea932de');
insert into public.question_choices (id, question_id, position, label) values ('4f63c787-dfaa-5f35-a931-892d70b335f2', '0c0b3b29-b5a3-5375-9157-072534a24d93', 0, 'Au-delà d’une certaine quantité consommée')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('8c1da30d-43fd-5ee8-b209-d2107ea932de', '0c0b3b29-b5a3-5375-9157-072534a24d93', 1, 'Quelle que soit la quantité consommée')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('0c0b3b29-b5a3-5375-9157-072534a24d93', '8c1da30d-43fd-5ee8-b209-d2107ea932de');
delete from public.question_competences where question_id = '0c0b3b29-b5a3-5375-9157-072534a24d93';
insert into public.question_competences (question_id, competence_id) values ('0c0b3b29-b5a3-5375-9157-072534a24d93', '3675dc03-ddc7-5e0a-975b-07979a5a2cfd');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('1adf3a78-33b7-5697-b581-ebff6dbdbe92', 'ex-043', 'Téléphone', 'En conduisant, j’ai le droit de téléphoner avec :', 'Le téléphone tenu en main et tout dispositif porté à l’oreille sont interdits. Un véhicule momentanément arrêté sur la voie (à un feu, par exemple) est toujours considéré en circulation.', '[{"title":"Réglementation du téléphone au volant","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-risques/reglementation-du-telephone-au-volant","consulted_at":"2026-10-22","cited_articles":["R412-6-1"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '1adf3a78-33b7-5697-b581-ebff6dbdbe92';
delete from public.question_choices where question_id = '1adf3a78-33b7-5697-b581-ebff6dbdbe92' and id not in ('85f05a25-02e6-5b1e-8a2e-e234f8343775', '95843ca1-70d7-5578-bcb3-26546c55fa68', 'bd6a2c06-1390-56a4-bd5a-8daaa72bd717');
insert into public.question_choices (id, question_id, position, label) values ('85f05a25-02e6-5b1e-8a2e-e234f8343775', '1adf3a78-33b7-5697-b581-ebff6dbdbe92', 0, 'Un dispositif intégré au véhicule')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('95843ca1-70d7-5578-bcb3-26546c55fa68', '1adf3a78-33b7-5697-b581-ebff6dbdbe92', 1, 'Une oreillette Bluetooth')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('bd6a2c06-1390-56a4-bd5a-8daaa72bd717', '1adf3a78-33b7-5697-b581-ebff6dbdbe92', 2, 'Mon téléphone tenu en main, arrêté à un feu rouge')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('1adf3a78-33b7-5697-b581-ebff6dbdbe92', '85f05a25-02e6-5b1e-8a2e-e234f8343775');
delete from public.question_competences where question_id = '1adf3a78-33b7-5697-b581-ebff6dbdbe92';
insert into public.question_competences (question_id, competence_id) values ('1adf3a78-33b7-5697-b581-ebff6dbdbe92', 'eea0603b-7708-5f30-bc92-8d6dd69ba622');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('e2787bd3-173c-5e18-9eb9-fa8618275bbf', 'ex-044', 'Téléphone', 'Tenir son téléphone en main en conduisant est sanctionné par une amende et un retrait de :', 'Amende forfaitaire de 135 € et retrait de 3 points ; le préfet peut en outre suspendre le permis jusqu’à 6 mois.', '[{"title":"Réglementation du téléphone au volant","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-risques/reglementation-du-telephone-au-volant","consulted_at":"2026-10-22","cited_articles":["R412-6-1"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'e2787bd3-173c-5e18-9eb9-fa8618275bbf';
delete from public.question_choices where question_id = 'e2787bd3-173c-5e18-9eb9-fa8618275bbf' and id not in ('0432337f-2642-51f8-9a59-8047a1ee05c0', '08b8718a-26fc-5e19-b94a-06e044e67bd8', '3cc0e7b2-f178-585d-ac7d-1697d06f4b33');
insert into public.question_choices (id, question_id, position, label) values ('0432337f-2642-51f8-9a59-8047a1ee05c0', 'e2787bd3-173c-5e18-9eb9-fa8618275bbf', 0, '1 point')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('08b8718a-26fc-5e19-b94a-06e044e67bd8', 'e2787bd3-173c-5e18-9eb9-fa8618275bbf', 1, '3 points')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('3cc0e7b2-f178-585d-ac7d-1697d06f4b33', 'e2787bd3-173c-5e18-9eb9-fa8618275bbf', 2, '6 points')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('e2787bd3-173c-5e18-9eb9-fa8618275bbf', '08b8718a-26fc-5e19-b94a-06e044e67bd8');
delete from public.question_competences where question_id = 'e2787bd3-173c-5e18-9eb9-fa8618275bbf';
insert into public.question_competences (question_id, competence_id) values ('e2787bd3-173c-5e18-9eb9-fa8618275bbf', 'eea0603b-7708-5f30-bc92-8d6dd69ba622');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('b2d4e282-9015-51d3-b92f-15743d415527', 'ex-045', 'Ceinture et équipements', 'Dans ma voiture, mon passager de 16 ans n’a pas attaché sa ceinture. Qui est responsable ?', 'Le conducteur d’un véhicule de 9 places au plus est responsable du port de la ceinture (ou d’un système de retenue adapté) par ses passagers de moins de 18 ans.', '[{"title":"Réglementation du port de la ceinture","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-modes-de-deplacements/en-voiture/reglementation-du-port-de-la-ceinture","consulted_at":"2026-10-22","cited_articles":["R412-2","R411-23-1"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'b2d4e282-9015-51d3-b92f-15743d415527';
delete from public.question_choices where question_id = 'b2d4e282-9015-51d3-b92f-15743d415527' and id not in ('f9072ac0-d5e0-52b6-94d1-6113962542eb', 'a6fd3469-1eb2-5c87-a59f-bebed7b5550a');
insert into public.question_choices (id, question_id, position, label) values ('f9072ac0-d5e0-52b6-94d1-6113962542eb', 'b2d4e282-9015-51d3-b92f-15743d415527', 0, 'Le passager seul')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('a6fd3469-1eb2-5c87-a59f-bebed7b5550a', 'b2d4e282-9015-51d3-b92f-15743d415527', 1, 'Moi, le conducteur')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('b2d4e282-9015-51d3-b92f-15743d415527', 'a6fd3469-1eb2-5c87-a59f-bebed7b5550a');
delete from public.question_competences where question_id = 'b2d4e282-9015-51d3-b92f-15743d415527';
insert into public.question_competences (question_id, competence_id) values ('b2d4e282-9015-51d3-b92f-15743d415527', '94064f20-6a59-54df-ab7d-ca1026477fd3');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('c4bede35-5faf-5741-893d-0421637ce843', 'ex-046', 'Ceinture et équipements', 'La ceinture de sécurité est-elle obligatoire aux places arrière d’une voiture ?', 'Dès que les sièges en sont équipés, la ceinture est obligatoire à l’avant comme à l’arrière, à tout âge.', '[{"title":"Réglementation du port de la ceinture","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-modes-de-deplacements/en-voiture/reglementation-du-port-de-la-ceinture","consulted_at":"2026-10-22","cited_articles":["R412-2","R411-23-1"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'c4bede35-5faf-5741-893d-0421637ce843';
delete from public.question_choices where question_id = 'c4bede35-5faf-5741-893d-0421637ce843' and id not in ('24598e51-4fea-54e2-8b8c-af850897660f', '7f18ec19-3420-59fa-ac65-8eabbcb07269');
insert into public.question_choices (id, question_id, position, label) values ('24598e51-4fea-54e2-8b8c-af850897660f', 'c4bede35-5faf-5741-893d-0421637ce843', 0, 'Oui, dès lors que le siège en est équipé')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('7f18ec19-3420-59fa-ac65-8eabbcb07269', 'c4bede35-5faf-5741-893d-0421637ce843', 1, 'Non, seulement à l’avant')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('c4bede35-5faf-5741-893d-0421637ce843', '24598e51-4fea-54e2-8b8c-af850897660f');
delete from public.question_competences where question_id = 'c4bede35-5faf-5741-893d-0421637ce843';
insert into public.question_competences (question_id, competence_id) values ('c4bede35-5faf-5741-893d-0421637ce843', '94064f20-6a59-54df-ab7d-ca1026477fd3');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('75793cef-8784-5da7-83d1-46e98a6a1428', 'ex-047', 'Ceinture et équipements', 'Dans ma voiture, je dois obligatoirement avoir :', 'Gilet de sécurité et triangle de signalisation sont obligatoires. La boîte d’ampoules n’est pas obligatoire, mais utile.', '[{"title":"Équipements obligatoires en voiture","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-modes-de-deplacements/en-voiture/equipements-obligatoires-en-voiture","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '75793cef-8784-5da7-83d1-46e98a6a1428';
delete from public.question_choices where question_id = '75793cef-8784-5da7-83d1-46e98a6a1428' and id not in ('fd3ff316-52f4-5c10-a134-ae55f8f3084a', '8f49b886-f588-5016-a492-7ca94f9c328d', 'b50ac812-e3d0-5e6e-ba3a-192793967481');
insert into public.question_choices (id, question_id, position, label) values ('fd3ff316-52f4-5c10-a134-ae55f8f3084a', '75793cef-8784-5da7-83d1-46e98a6a1428', 0, 'Un gilet de sécurité')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('8f49b886-f588-5016-a492-7ca94f9c328d', '75793cef-8784-5da7-83d1-46e98a6a1428', 1, 'Un triangle de signalisation')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('b50ac812-e3d0-5e6e-ba3a-192793967481', '75793cef-8784-5da7-83d1-46e98a6a1428', 2, 'Une boîte d’ampoules de rechange')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('75793cef-8784-5da7-83d1-46e98a6a1428', 'fd3ff316-52f4-5c10-a134-ae55f8f3084a');
insert into public.question_answers (question_id, choice_id) values ('75793cef-8784-5da7-83d1-46e98a6a1428', '8f49b886-f588-5016-a492-7ca94f9c328d');
delete from public.question_competences where question_id = '75793cef-8784-5da7-83d1-46e98a6a1428';
insert into public.question_competences (question_id, competence_id) values ('75793cef-8784-5da7-83d1-46e98a6a1428', '94064f20-6a59-54df-ab7d-ca1026477fd3');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('2ca4ef88-fa3a-57f6-8173-fde40e821e2b', 'ex-048', 'Ceinture et équipements', 'Le pare-brise et les vitres latérales avant doivent transmettre au moins :', 'Le pare-brise et les vitres latérales avant doivent transmettre au moins 70 % de la lumière.', '[{"title":"Équipements obligatoires en voiture","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-modes-de-deplacements/en-voiture/equipements-obligatoires-en-voiture","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '2ca4ef88-fa3a-57f6-8173-fde40e821e2b';
delete from public.question_choices where question_id = '2ca4ef88-fa3a-57f6-8173-fde40e821e2b' and id not in ('76c05e1b-38d8-539a-b413-ae32939b3192', 'e0eab351-76ed-5b86-903e-aae4b1937c35', '8678ac40-e265-51b1-92ff-31f80c02eec6');
insert into public.question_choices (id, question_id, position, label) values ('76c05e1b-38d8-539a-b413-ae32939b3192', '2ca4ef88-fa3a-57f6-8173-fde40e821e2b', 0, '50 % de la lumière')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('e0eab351-76ed-5b86-903e-aae4b1937c35', '2ca4ef88-fa3a-57f6-8173-fde40e821e2b', 1, '70 % de la lumière')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('8678ac40-e265-51b1-92ff-31f80c02eec6', '2ca4ef88-fa3a-57f6-8173-fde40e821e2b', 2, '90 % de la lumière')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('2ca4ef88-fa3a-57f6-8173-fde40e821e2b', 'e0eab351-76ed-5b86-903e-aae4b1937c35');
delete from public.question_competences where question_id = '2ca4ef88-fa3a-57f6-8173-fde40e821e2b';
insert into public.question_competences (question_id, competence_id) values ('2ca4ef88-fa3a-57f6-8173-fde40e821e2b', '94064f20-6a59-54df-ab7d-ca1026477fd3');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('87c51c3f-8081-5157-a6fb-bbdb6203f85d', 'ex-049', 'Accident et secours', 'En cas d’accident, les trois actions à mener, dans l’ordre, sont :', 'Protéger, alerter, secourir.', '[{"title":"Accident de la route","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/accident-de-la-route","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '87c51c3f-8081-5157-a6fb-bbdb6203f85d';
delete from public.question_choices where question_id = '87c51c3f-8081-5157-a6fb-bbdb6203f85d' and id not in ('43b4bcb6-bea0-556e-b1c9-28d8d7ab07fe', '45cd2c21-636c-5a6e-b917-7fa60f270b4f', 'ea591ed3-4012-5e57-ace3-7c0806d275c7');
insert into public.question_choices (id, question_id, position, label) values ('43b4bcb6-bea0-556e-b1c9-28d8d7ab07fe', '87c51c3f-8081-5157-a6fb-bbdb6203f85d', 0, 'Alerter, protéger, secourir')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('45cd2c21-636c-5a6e-b917-7fa60f270b4f', '87c51c3f-8081-5157-a6fb-bbdb6203f85d', 1, 'Protéger, alerter, secourir')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('ea591ed3-4012-5e57-ace3-7c0806d275c7', '87c51c3f-8081-5157-a6fb-bbdb6203f85d', 2, 'Secourir, alerter, protéger')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('87c51c3f-8081-5157-a6fb-bbdb6203f85d', '45cd2c21-636c-5a6e-b917-7fa60f270b4f');
delete from public.question_competences where question_id = '87c51c3f-8081-5157-a6fb-bbdb6203f85d';
insert into public.question_competences (question_id, competence_id) values ('87c51c3f-8081-5157-a6fb-bbdb6203f85d', '24f9e463-bc22-5e54-98a3-661f9dcceb33');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('2559b171-0e88-514a-a21b-12e90835a1f4', 'ex-050', 'Accident et secours', 'Témoin d’un accident, je m’approche d’un motard blessé. Je :', 'Il ne faut pas retirer le casque d’un motard ni donner à boire ou à manger à un blessé ; on le couvre et on le réconforte.', '[{"title":"Accident de la route","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/accident-de-la-route","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '2559b171-0e88-514a-a21b-12e90835a1f4';
delete from public.question_choices where question_id = '2559b171-0e88-514a-a21b-12e90835a1f4' and id not in ('f99a2e56-48b5-51d3-902b-918d2de46c22', '761b7e49-75ba-59aa-bb7b-4cf8d802f392', '28a5be74-a2e0-5d73-9676-1a5d1bcec92f');
insert into public.question_choices (id, question_id, position, label) values ('f99a2e56-48b5-51d3-902b-918d2de46c22', '2559b171-0e88-514a-a21b-12e90835a1f4', 0, 'Ne retire pas son casque')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('761b7e49-75ba-59aa-bb7b-4cf8d802f392', '2559b171-0e88-514a-a21b-12e90835a1f4', 1, 'Lui donne à boire')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('28a5be74-a2e0-5d73-9676-1a5d1bcec92f', '2559b171-0e88-514a-a21b-12e90835a1f4', 2, 'Le couvre et le rassure en lui parlant')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('2559b171-0e88-514a-a21b-12e90835a1f4', 'f99a2e56-48b5-51d3-902b-918d2de46c22');
insert into public.question_answers (question_id, choice_id) values ('2559b171-0e88-514a-a21b-12e90835a1f4', '28a5be74-a2e0-5d73-9676-1a5d1bcec92f');
delete from public.question_competences where question_id = '2559b171-0e88-514a-a21b-12e90835a1f4';
insert into public.question_competences (question_id, competence_id) values ('2559b171-0e88-514a-a21b-12e90835a1f4', '24f9e463-bc22-5e54-98a3-661f9dcceb33');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('bb33aa96-5244-5aef-960f-93c023887972', 'ex-051', 'Accident et secours', 'Je peux déplacer un blessé :', 'On ne déplace pas un blessé, sauf en cas de danger imminent comme un incendie.', '[{"title":"Accident de la route","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/accident-de-la-route","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'bb33aa96-5244-5aef-960f-93c023887972';
delete from public.question_choices where question_id = 'bb33aa96-5244-5aef-960f-93c023887972' and id not in ('77bab08f-deb5-5285-9650-9735a28902d0', 'f557c398-4f26-527b-8026-d7d3c6fb7ab7', '8a5171ed-5d55-5b5c-9a0e-f47ac0e7c4f8');
insert into public.question_choices (id, question_id, position, label) values ('77bab08f-deb5-5285-9650-9735a28902d0', 'bb33aa96-5244-5aef-960f-93c023887972', 0, 'En cas de danger imminent, un incendie par exemple')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('f557c398-4f26-527b-8026-d7d3c6fb7ab7', 'bb33aa96-5244-5aef-960f-93c023887972', 1, 'Pour l’installer plus confortablement')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('8a5171ed-5d55-5b5c-9a0e-f47ac0e7c4f8', 'bb33aa96-5244-5aef-960f-93c023887972', 2, 'Jamais, même en cas d’incendie')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('bb33aa96-5244-5aef-960f-93c023887972', '77bab08f-deb5-5285-9650-9735a28902d0');
delete from public.question_competences where question_id = 'bb33aa96-5244-5aef-960f-93c023887972';
insert into public.question_competences (question_id, competence_id) values ('bb33aa96-5244-5aef-960f-93c023887972', '24f9e463-bc22-5e54-98a3-661f9dcceb33');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('dd7f4492-e826-5bfa-a4c5-591b0e09418a', 'ex-052', 'Accident et secours', 'Après un accident, je dois remettre le constat amiable à mon assureur dans un délai de :', 'Le constat complété doit être remis à l’assureur dans les 5 jours ouvrés suivant l’accident.', '[{"title":"Accident de la route","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/accident-de-la-route","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'dd7f4492-e826-5bfa-a4c5-591b0e09418a';
delete from public.question_choices where question_id = 'dd7f4492-e826-5bfa-a4c5-591b0e09418a' and id not in ('d89a2fa7-28cf-5242-b8e1-92fcb96439c5', 'c9b318dd-04e2-523b-94d5-d29dd23b7a2d', '05d441c7-aa07-5577-8aa2-7e2f00c44761');
insert into public.question_choices (id, question_id, position, label) values ('d89a2fa7-28cf-5242-b8e1-92fcb96439c5', 'dd7f4492-e826-5bfa-a4c5-591b0e09418a', 0, '48 heures')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('c9b318dd-04e2-523b-94d5-d29dd23b7a2d', 'dd7f4492-e826-5bfa-a4c5-591b0e09418a', 1, '5 jours ouvrés')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('05d441c7-aa07-5577-8aa2-7e2f00c44761', 'dd7f4492-e826-5bfa-a4c5-591b0e09418a', 2, '1 mois')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('dd7f4492-e826-5bfa-a4c5-591b0e09418a', 'c9b318dd-04e2-523b-94d5-d29dd23b7a2d');
delete from public.question_competences where question_id = 'dd7f4492-e826-5bfa-a4c5-591b0e09418a';
insert into public.question_competences (question_id, competence_id) values ('dd7f4492-e826-5bfa-a4c5-591b0e09418a', '24f9e463-bc22-5e54-98a3-661f9dcceb33');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('eef40612-92a8-5a6b-81de-d837cd453e56', 'ex-053', 'Passages à niveau et tunnels', 'À un passage à niveau, le feu rouge se met à clignoter mais je ne vois aucun train. Je :', 'Il faut s’arrêter dès que le feu rouge clignote : les trains ont la priorité absolue.', '[{"title":"Passage à niveau","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/passage-niveau","consulted_at":"2026-10-22","cited_articles":["R422-3","R412-30"]}]'::jsonb, 'in_review'::public.content_status, null, null, '9857c203-7a8f-53cf-aceb-c4a06a75962e', false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'eef40612-92a8-5a6b-81de-d837cd453e56';
delete from public.question_choices where question_id = 'eef40612-92a8-5a6b-81de-d837cd453e56' and id not in ('2aaaa42e-5efd-57fe-8bf8-6db70c4b7824', 'aaf2db6c-c7c5-54f0-ba8b-5cea59c9263b');
insert into public.question_choices (id, question_id, position, label) values ('2aaaa42e-5efd-57fe-8bf8-6db70c4b7824', 'eef40612-92a8-5a6b-81de-d837cd453e56', 0, 'M’arrête')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('aaf2db6c-c7c5-54f0-ba8b-5cea59c9263b', 'eef40612-92a8-5a6b-81de-d837cd453e56', 1, 'Passe rapidement')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('eef40612-92a8-5a6b-81de-d837cd453e56', '2aaaa42e-5efd-57fe-8bf8-6db70c4b7824');
delete from public.question_competences where question_id = 'eef40612-92a8-5a6b-81de-d837cd453e56';
insert into public.question_competences (question_id, competence_id) values ('eef40612-92a8-5a6b-81de-d837cd453e56', 'a8754ce0-1402-5b0e-b697-869bd4098e21');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('c3b28788-f4e7-5c42-83fd-91de805963c8', 'ex-054', 'Passages à niveau et tunnels', 'Mon véhicule est immobilisé sur la voie ferrée et les barrières se ferment. Je :', 'La barrière est conçue pour céder : on dégage le véhicule en l’enfonçant, on évacue les passagers et on alerte un agent SNCF.', '[{"title":"Passage à niveau","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/passage-niveau","consulted_at":"2026-10-22","cited_articles":["R422-3","R412-30"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'c3b28788-f4e7-5c42-83fd-91de805963c8';
delete from public.question_choices where question_id = 'c3b28788-f4e7-5c42-83fd-91de805963c8' and id not in ('69547e2e-cded-5541-a077-3324ef3f38f7', 'd031e048-42e1-55fe-b2b1-2deb6b038712', '141c5f08-bd03-5b8e-a4e6-5b00725e1057');
insert into public.question_choices (id, question_id, position, label) values ('69547e2e-cded-5541-a077-3324ef3f38f7', 'c3b28788-f4e7-5c42-83fd-91de805963c8', 0, 'Dégage mon véhicule en enfonçant la barrière')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('d031e048-42e1-55fe-b2b1-2deb6b038712', 'c3b28788-f4e7-5c42-83fd-91de805963c8', 1, 'Fais évacuer tous les passagers')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('141c5f08-bd03-5b8e-a4e6-5b00725e1057', 'c3b28788-f4e7-5c42-83fd-91de805963c8', 2, 'Attends dans le véhicule que le train passe')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('c3b28788-f4e7-5c42-83fd-91de805963c8', '69547e2e-cded-5541-a077-3324ef3f38f7');
insert into public.question_answers (question_id, choice_id) values ('c3b28788-f4e7-5c42-83fd-91de805963c8', 'd031e048-42e1-55fe-b2b1-2deb6b038712');
delete from public.question_competences where question_id = 'c3b28788-f4e7-5c42-83fd-91de805963c8';
insert into public.question_competences (question_id, competence_id) values ('c3b28788-f4e7-5c42-83fd-91de805963c8', 'a8754ce0-1402-5b0e-b697-869bd4098e21');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('95d51753-8980-5453-aded-d9a0f302288a', 'ex-055', 'Passages à niveau et tunnels', 'Après le passage d’un train, les barrières commencent à se relever. Je redémarre :', 'Il faut attendre l’ouverture complète des barrières : un autre train peut arriver.', '[{"title":"Passage à niveau","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/passage-niveau","consulted_at":"2026-10-22","cited_articles":["R422-3","R412-30"]}]'::jsonb, 'in_review'::public.content_status, null, null, '9857c203-7a8f-53cf-aceb-c4a06a75962e', false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '95d51753-8980-5453-aded-d9a0f302288a';
delete from public.question_choices where question_id = '95d51753-8980-5453-aded-d9a0f302288a' and id not in ('ea17db31-8111-5f78-80a1-6ebfd0b21126', 'f553235c-adeb-5a4b-bdb2-48261d1ebcdc');
insert into public.question_choices (id, question_id, position, label) values ('ea17db31-8111-5f78-80a1-6ebfd0b21126', '95d51753-8980-5453-aded-d9a0f302288a', 0, 'Dès qu’elles commencent à se lever')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('f553235c-adeb-5a4b-bdb2-48261d1ebcdc', '95d51753-8980-5453-aded-d9a0f302288a', 1, 'Quand elles sont complètement ouvertes')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('95d51753-8980-5453-aded-d9a0f302288a', 'f553235c-adeb-5a4b-bdb2-48261d1ebcdc');
delete from public.question_competences where question_id = '95d51753-8980-5453-aded-d9a0f302288a';
insert into public.question_competences (question_id, competence_id) values ('95d51753-8980-5453-aded-d9a0f302288a', 'a8754ce0-1402-5b0e-b697-869bd4098e21');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('cb148769-8795-5011-ba11-4f48deea6667', 'ex-056', 'Passages à niveau et tunnels', 'Dans un tunnel, de la fumée apparaît. Je :', 'On coupe le moteur en laissant la clé sur le contact et on quitte le véhicule par les issues de secours. Le demi-tour est interdit dans un tunnel.', '[{"title":"Conduire dans un tunnel","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/conduire-dans-un-tunnel","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'cb148769-8795-5011-ba11-4f48deea6667';
delete from public.question_choices where question_id = 'cb148769-8795-5011-ba11-4f48deea6667' and id not in ('eb6f0ea4-94b3-5673-80c9-cee9ad513a4e', '09636af1-1ddb-5935-bd58-bf727eb82169', '7114192a-bd43-5547-b4a2-fbf6156657db');
insert into public.question_choices (id, question_id, position, label) values ('eb6f0ea4-94b3-5673-80c9-cee9ad513a4e', 'cb148769-8795-5011-ba11-4f48deea6667', 0, 'Coupe le moteur en laissant la clé sur le contact')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('09636af1-1ddb-5935-bd58-bf727eb82169', 'cb148769-8795-5011-ba11-4f48deea6667', 1, 'Quitte le véhicule avec mes passagers par une issue de secours')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('7114192a-bd43-5547-b4a2-fbf6156657db', 'cb148769-8795-5011-ba11-4f48deea6667', 2, 'Fais demi-tour pour ressortir')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('cb148769-8795-5011-ba11-4f48deea6667', 'eb6f0ea4-94b3-5673-80c9-cee9ad513a4e');
insert into public.question_answers (question_id, choice_id) values ('cb148769-8795-5011-ba11-4f48deea6667', '09636af1-1ddb-5935-bd58-bf727eb82169');
delete from public.question_competences where question_id = 'cb148769-8795-5011-ba11-4f48deea6667';
insert into public.question_competences (question_id, competence_id) values ('cb148769-8795-5011-ba11-4f48deea6667', '8d9197d8-6c24-50f3-b193-ada8b816fe81');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('0fd08efb-8f12-5e77-986d-9afc05994bb7', 'ex-057', 'Éco-conduite', 'Pour réduire ma consommation de carburant :', 'Des pneus sous-gonflés et un coffre de toit inutile augmentent la consommation ; lors d’un arrêt prolongé, mieux vaut couper le moteur.', '[{"title":"Éco-conduite en voiture","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chacun-son-mode-de-deplacement/dangers-de-la-route-en-voiture/mieux-conduire-en-voiture/eco","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '0fd08efb-8f12-5e77-986d-9afc05994bb7';
delete from public.question_choices where question_id = '0fd08efb-8f12-5e77-986d-9afc05994bb7' and id not in ('ccdadf40-e0f5-5337-9d08-79191e5d5b20', '7a33d7b9-b0e7-5714-8ecb-8feffd896827', 'e1a2ff1c-000a-52b9-8a98-f278487a1248');
insert into public.question_choices (id, question_id, position, label) values ('ccdadf40-e0f5-5337-9d08-79191e5d5b20', '0fd08efb-8f12-5e77-986d-9afc05994bb7', 0, 'Je vérifie la pression des pneus')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('7a33d7b9-b0e7-5714-8ecb-8feffd896827', '0fd08efb-8f12-5e77-986d-9afc05994bb7', 1, 'Je démonte le coffre de toit après utilisation')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('e1a2ff1c-000a-52b9-8a98-f278487a1248', '0fd08efb-8f12-5e77-986d-9afc05994bb7', 2, 'Je laisse tourner le moteur lors d’un arrêt prolongé')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('0fd08efb-8f12-5e77-986d-9afc05994bb7', 'ccdadf40-e0f5-5337-9d08-79191e5d5b20');
insert into public.question_answers (question_id, choice_id) values ('0fd08efb-8f12-5e77-986d-9afc05994bb7', '7a33d7b9-b0e7-5714-8ecb-8feffd896827');
delete from public.question_competences where question_id = '0fd08efb-8f12-5e77-986d-9afc05994bb7';
insert into public.question_competences (question_id, competence_id) values ('0fd08efb-8f12-5e77-986d-9afc05994bb7', '41854bad-69c9-5799-91e7-71d22ffef121');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('5899d843-6146-560c-8fb3-68757542623c', 'ex-058', 'Éco-conduite', 'Pour ralentir en consommant moins, je privilégie :', 'Anticiper les ralentissements et utiliser le frein moteur plutôt que la pédale de frein réduit la consommation.', '[{"title":"Éco-conduite en voiture","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chacun-son-mode-de-deplacement/dangers-de-la-route-en-voiture/mieux-conduire-en-voiture/eco","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '5899d843-6146-560c-8fb3-68757542623c';
delete from public.question_choices where question_id = '5899d843-6146-560c-8fb3-68757542623c' and id not in ('4e17fde0-167f-560c-b4b9-b95fc043914e', 'b1c18527-2b28-5681-83b4-2996cfe9db8e');
insert into public.question_choices (id, question_id, position, label) values ('4e17fde0-167f-560c-b4b9-b95fc043914e', '5899d843-6146-560c-8fb3-68757542623c', 0, 'Le frein moteur')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('b1c18527-2b28-5681-83b4-2996cfe9db8e', '5899d843-6146-560c-8fb3-68757542623c', 1, 'La pédale de frein')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('5899d843-6146-560c-8fb3-68757542623c', '4e17fde0-167f-560c-b4b9-b95fc043914e');
delete from public.question_competences where question_id = '5899d843-6146-560c-8fb3-68757542623c';
insert into public.question_competences (question_id, competence_id) values ('5899d843-6146-560c-8fb3-68757542623c', '41854bad-69c9-5799-91e7-71d22ffef121');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('82e0d36b-beb0-535d-b637-4439a67c1183', 'ex-059', 'Ville et stationnement', 'Dans une zone de rencontre, la vitesse est limitée à :', 'Zone de rencontre : vitesse limitée à 20 km/h, piétons prioritaires sur tous les véhicules sauf les tramways.', '[{"title":"Le code de la rue","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/le-code-de-la-rue","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '82e0d36b-beb0-535d-b637-4439a67c1183';
delete from public.question_choices where question_id = '82e0d36b-beb0-535d-b637-4439a67c1183' and id not in ('b7e8bd47-f805-5c25-abc1-a99c10e839e7', 'e45e6ace-0e67-587f-8aff-8622f3a757be', 'f4227492-4e99-5b2b-8965-cc4569773d68');
insert into public.question_choices (id, question_id, position, label) values ('b7e8bd47-f805-5c25-abc1-a99c10e839e7', '82e0d36b-beb0-535d-b637-4439a67c1183', 0, '20 km/h')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('e45e6ace-0e67-587f-8aff-8622f3a757be', '82e0d36b-beb0-535d-b637-4439a67c1183', 1, '30 km/h')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('f4227492-4e99-5b2b-8965-cc4569773d68', '82e0d36b-beb0-535d-b637-4439a67c1183', 2, '50 km/h')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('82e0d36b-beb0-535d-b637-4439a67c1183', 'b7e8bd47-f805-5c25-abc1-a99c10e839e7');
delete from public.question_competences where question_id = '82e0d36b-beb0-535d-b637-4439a67c1183';
insert into public.question_competences (question_id, competence_id) values ('82e0d36b-beb0-535d-b637-4439a67c1183', '22ccf1ae-d20c-5540-84d9-7af8f655864b');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('3ac87465-419b-50ce-a8a7-c441c8953b30', 'ex-060', 'Ville et stationnement', 'Dans une aire piétonne, les véhicules autorisés à y circuler doivent rouler :', 'Dans une aire piétonne, les piétons sont prioritaires sur tous les véhicules sauf les tramways, et les véhicules autorisés roulent au pas.', '[{"title":"Le code de la rue","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/le-code-de-la-rue","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '3ac87465-419b-50ce-a8a7-c441c8953b30';
delete from public.question_choices where question_id = '3ac87465-419b-50ce-a8a7-c441c8953b30' and id not in ('4dae611f-fbe8-57e8-ae96-dcd4fcbfc023', '8ccfc76f-a589-54c2-b07f-ce24f92538ab', 'dff41f4c-272e-5b43-aea4-fb51f21e5da6');
insert into public.question_choices (id, question_id, position, label) values ('4dae611f-fbe8-57e8-ae96-dcd4fcbfc023', '3ac87465-419b-50ce-a8a7-c441c8953b30', 0, 'Au pas')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('8ccfc76f-a589-54c2-b07f-ce24f92538ab', '3ac87465-419b-50ce-a8a7-c441c8953b30', 1, 'À 20 km/h au plus')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('dff41f4c-272e-5b43-aea4-fb51f21e5da6', '3ac87465-419b-50ce-a8a7-c441c8953b30', 2, 'À 30 km/h au plus')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('3ac87465-419b-50ce-a8a7-c441c8953b30', '4dae611f-fbe8-57e8-ae96-dcd4fcbfc023');
delete from public.question_competences where question_id = '3ac87465-419b-50ce-a8a7-c441c8953b30';
insert into public.question_competences (question_id, competence_id) values ('3ac87465-419b-50ce-a8a7-c441c8953b30', '22ccf1ae-d20c-5540-84d9-7af8f655864b');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('5fcc01d2-872e-54fe-8a5f-542db38e5183', 'ex-061', 'Ville et stationnement', 'Sur une route à double sens, je stationne :', 'Sur une route à double sens, on stationne du côté droit ; sur une route à sens unique, à droite ou à gauche.', '[{"title":"Arrêt et stationnement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/arret-et-stationnement","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '5fcc01d2-872e-54fe-8a5f-542db38e5183';
delete from public.question_choices where question_id = '5fcc01d2-872e-54fe-8a5f-542db38e5183' and id not in ('c7a62845-3ede-580a-bad8-02aecfa4284c', '5d40b2e7-003e-529e-be10-eb3898bb6829');
insert into public.question_choices (id, question_id, position, label) values ('c7a62845-3ede-580a-bad8-02aecfa4284c', '5fcc01d2-872e-54fe-8a5f-542db38e5183', 0, 'Sur le côté droit')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('5d40b2e7-003e-529e-be10-eb3898bb6829', '5fcc01d2-872e-54fe-8a5f-542db38e5183', 1, 'Du côté de mon choix')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('5fcc01d2-872e-54fe-8a5f-542db38e5183', 'c7a62845-3ede-580a-bad8-02aecfa4284c');
delete from public.question_competences where question_id = '5fcc01d2-872e-54fe-8a5f-542db38e5183';
insert into public.question_competences (question_id, competence_id) values ('5fcc01d2-872e-54fe-8a5f-542db38e5183', '9633e039-8208-5c8f-b4e6-22f0326ab7f3');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('541344ff-ea50-547e-8097-a76788c95382', 'ex-062', 'Ville et stationnement', 'Je suis garé le long du trottoir et un cycliste arrive derrière moi. J’ouvre ma portière :', 'Il est interdit d’ouvrir une portière lorsque cela peut être dangereux pour soi ou pour les autres usagers.', '[{"title":"Arrêt et stationnement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/arret-et-stationnement","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '541344ff-ea50-547e-8097-a76788c95382';
delete from public.question_choices where question_id = '541344ff-ea50-547e-8097-a76788c95382' and id not in ('012b60ab-479e-5048-b8b3-c915424b86c6', '86e91e13-93d5-5364-899c-a90efe7ebba8');
insert into public.question_choices (id, question_id, position, label) values ('012b60ab-479e-5048-b8b3-c915424b86c6', '541344ff-ea50-547e-8097-a76788c95382', 0, 'Après son passage')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('86e91e13-93d5-5364-899c-a90efe7ebba8', '541344ff-ea50-547e-8097-a76788c95382', 1, 'Tout de suite : c’est à lui de m’éviter')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('541344ff-ea50-547e-8097-a76788c95382', '012b60ab-479e-5048-b8b3-c915424b86c6');
delete from public.question_competences where question_id = '541344ff-ea50-547e-8097-a76788c95382';
insert into public.question_competences (question_id, competence_id) values ('541344ff-ea50-547e-8097-a76788c95382', '9633e039-8208-5c8f-b4e6-22f0326ab7f3');
insert into public.question_competences (question_id, competence_id) values ('541344ff-ea50-547e-8097-a76788c95382', '4d2a0934-e1b1-5172-9c6f-eacb55406515');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('0af20abb-f499-5c66-b56c-451d23e1154d', 'ex-063', 'Ceinture et équipements', 'Ma voiture est immobilisée sur la chaussée et constitue un danger pour la circulation. Je place le triangle de présignalisation :', 'Le triangle se place à 30 mètres ou plus de la voiture pour la signaler aux autres conducteurs.', '[{"title":"Équipements obligatoires en voiture : gilet de sécurité, triangle…","publisher":"Service-Public.gouv.fr (DILA)","url":"https://www.service-public.gouv.fr/particuliers/vosdroits/F19459","consulted_at":"2026-10-22","cited_articles":["R416-17 à R416-20","Arrêté du 30 septembre 2008 relatif à la présignalisation des véhicules"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '0af20abb-f499-5c66-b56c-451d23e1154d';
delete from public.question_choices where question_id = '0af20abb-f499-5c66-b56c-451d23e1154d' and id not in ('447fca21-b26c-5aec-a67a-ee50eafd5294', 'b6f9ba08-baa0-55cd-93db-93c9ab8b3af0', '67a3bca3-1e3e-545c-90d9-ef98ae8d2859');
insert into public.question_choices (id, question_id, position, label) values ('447fca21-b26c-5aec-a67a-ee50eafd5294', '0af20abb-f499-5c66-b56c-451d23e1154d', 0, 'À 5 mètres de ma voiture')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('b6f9ba08-baa0-55cd-93db-93c9ab8b3af0', '0af20abb-f499-5c66-b56c-451d23e1154d', 1, 'À 30 mètres ou plus de ma voiture')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('67a3bca3-1e3e-545c-90d9-ef98ae8d2859', '0af20abb-f499-5c66-b56c-451d23e1154d', 2, 'Juste derrière mon pare-chocs')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('0af20abb-f499-5c66-b56c-451d23e1154d', 'b6f9ba08-baa0-55cd-93db-93c9ab8b3af0');
delete from public.question_competences where question_id = '0af20abb-f499-5c66-b56c-451d23e1154d';
insert into public.question_competences (question_id, competence_id) values ('0af20abb-f499-5c66-b56c-451d23e1154d', '94064f20-6a59-54df-ab7d-ca1026477fd3');
insert into public.question_competences (question_id, competence_id) values ('0af20abb-f499-5c66-b56c-451d23e1154d', 'ad7e4ff8-02e2-51f2-955e-6689b0731b71');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('34e423eb-10f6-574c-906f-36fcaa2c5ba5', 'ex-064', 'Ceinture et équipements', 'Dans quelles situations dois-je utiliser mon triangle de présignalisation ?', 'Le triangle s’utilise quand l’immobilisation de la voiture est un danger pour la circulation : près d’une intersection, d’un virage, d’un sommet de côte, d’un passage à niveau ou par visibilité insuffisante.', '[{"title":"Équipements obligatoires en voiture : gilet de sécurité, triangle…","publisher":"Service-Public.gouv.fr (DILA)","url":"https://www.service-public.gouv.fr/particuliers/vosdroits/F19459","consulted_at":"2026-10-22","cited_articles":["R416-17 à R416-20","Arrêté du 30 septembre 2008 relatif à la présignalisation des véhicules"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '34e423eb-10f6-574c-906f-36fcaa2c5ba5';
delete from public.question_choices where question_id = '34e423eb-10f6-574c-906f-36fcaa2c5ba5' and id not in ('b2ab399f-6ed4-5bc3-90f0-de425483e614', 'ca6e96b1-ecc0-5fc1-83d3-b8f4a5970ebc', 'dde1065d-6792-5b88-afb1-98f150769277');
insert into public.question_choices (id, question_id, position, label) values ('b2ab399f-6ed4-5bc3-90f0-de425483e614', '34e423eb-10f6-574c-906f-36fcaa2c5ba5', 0, 'Ma voiture en panne est immobilisée juste après un virage')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('ca6e96b1-ecc0-5fc1-83d3-b8f4a5970ebc', '34e423eb-10f6-574c-906f-36fcaa2c5ba5', 1, 'Ma voiture est garée sur une place de stationnement')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('dde1065d-6792-5b88-afb1-98f150769277', '34e423eb-10f6-574c-906f-36fcaa2c5ba5', 2, 'Ma voiture est immobilisée près du sommet d’une côte')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('34e423eb-10f6-574c-906f-36fcaa2c5ba5', 'b2ab399f-6ed4-5bc3-90f0-de425483e614');
insert into public.question_answers (question_id, choice_id) values ('34e423eb-10f6-574c-906f-36fcaa2c5ba5', 'dde1065d-6792-5b88-afb1-98f150769277');
delete from public.question_competences where question_id = '34e423eb-10f6-574c-906f-36fcaa2c5ba5';
insert into public.question_competences (question_id, competence_id) values ('34e423eb-10f6-574c-906f-36fcaa2c5ba5', '94064f20-6a59-54df-ab7d-ca1026477fd3');
insert into public.question_competences (question_id, competence_id) values ('34e423eb-10f6-574c-906f-36fcaa2c5ba5', 'ad7e4ff8-02e2-51f2-955e-6689b0731b71');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('99ff4a50-189f-5dc6-bd82-e4730e8b5ad3', 'ex-065', 'Ceinture et équipements', 'Je signale ma voiture immobilisée avec le triangle. Je dois aussi :', 'Avec le triangle placé à 30 mètres ou plus, il faut allumer ses feux de détresse.', '[{"title":"Équipements obligatoires en voiture : gilet de sécurité, triangle…","publisher":"Service-Public.gouv.fr (DILA)","url":"https://www.service-public.gouv.fr/particuliers/vosdroits/F19459","consulted_at":"2026-10-22","cited_articles":["R416-17 à R416-20","Arrêté du 30 septembre 2008 relatif à la présignalisation des véhicules"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '99ff4a50-189f-5dc6-bd82-e4730e8b5ad3';
delete from public.question_choices where question_id = '99ff4a50-189f-5dc6-bd82-e4730e8b5ad3' and id not in ('f4e07100-4380-5b11-b16a-3e60f5629409', 'dea06ec1-c048-55a3-bb33-60a7e7dddcac', 'dee09d59-90f2-52df-b632-7a420aecc8b3');
insert into public.question_choices (id, question_id, position, label) values ('f4e07100-4380-5b11-b16a-3e60f5629409', '99ff4a50-189f-5dc6-bd82-e4730e8b5ad3', 0, 'Allumer mes feux de détresse')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('dea06ec1-c048-55a3-bb33-60a7e7dddcac', '99ff4a50-189f-5dc6-bd82-e4730e8b5ad3', 1, 'Allumer mes feux de brouillard arrière')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('dee09d59-90f2-52df-b632-7a420aecc8b3', '99ff4a50-189f-5dc6-bd82-e4730e8b5ad3', 2, 'Éteindre tous mes feux')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('99ff4a50-189f-5dc6-bd82-e4730e8b5ad3', 'f4e07100-4380-5b11-b16a-3e60f5629409');
delete from public.question_competences where question_id = '99ff4a50-189f-5dc6-bd82-e4730e8b5ad3';
insert into public.question_competences (question_id, competence_id) values ('99ff4a50-189f-5dc6-bd82-e4730e8b5ad3', '94064f20-6a59-54df-ab7d-ca1026477fd3');
insert into public.question_competences (question_id, competence_id) values ('99ff4a50-189f-5dc6-bd82-e4730e8b5ad3', 'ad7e4ff8-02e2-51f2-955e-6689b0731b71');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('cf27ce13-c2ea-5ac6-bcfc-473d7c39ba32', 'ex-066', 'Ceinture et équipements', 'Aller poser le triangle mettrait ma vie en danger (circulation dense, aucun espace pour marcher). Suis-je obligé de le placer ?', 'On n’est pas obligé de mettre en place le triangle si l’on estime que cela peut mettre sa vie en danger.', '[{"title":"Équipements obligatoires en voiture : gilet de sécurité, triangle…","publisher":"Service-Public.gouv.fr (DILA)","url":"https://www.service-public.gouv.fr/particuliers/vosdroits/F19459","consulted_at":"2026-10-22","cited_articles":["R416-17 à R416-20","Arrêté du 30 septembre 2008 relatif à la présignalisation des véhicules"]},{"title":"Équipements obligatoires en voiture","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-modes-de-deplacements/en-voiture/equipements-obligatoires-en-voiture","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'cf27ce13-c2ea-5ac6-bcfc-473d7c39ba32';
delete from public.question_choices where question_id = 'cf27ce13-c2ea-5ac6-bcfc-473d7c39ba32' and id not in ('8fcdcfb8-ffbb-52fe-a8e4-0e40e4b70bc4', '9189a902-d472-557d-9158-f4a7e94c9ce6');
insert into public.question_choices (id, question_id, position, label) values ('8fcdcfb8-ffbb-52fe-a8e4-0e40e4b70bc4', 'cf27ce13-c2ea-5ac6-bcfc-473d7c39ba32', 0, 'Oui, dans tous les cas')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('9189a902-d472-557d-9158-f4a7e94c9ce6', 'cf27ce13-c2ea-5ac6-bcfc-473d7c39ba32', 1, 'Non')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('cf27ce13-c2ea-5ac6-bcfc-473d7c39ba32', '9189a902-d472-557d-9158-f4a7e94c9ce6');
delete from public.question_competences where question_id = 'cf27ce13-c2ea-5ac6-bcfc-473d7c39ba32';
insert into public.question_competences (question_id, competence_id) values ('cf27ce13-c2ea-5ac6-bcfc-473d7c39ba32', '94064f20-6a59-54df-ab7d-ca1026477fd3');
insert into public.question_competences (question_id, competence_id) values ('cf27ce13-c2ea-5ac6-bcfc-473d7c39ba32', 'ad7e4ff8-02e2-51f2-955e-6689b0731b71');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('cf6420e8-eafc-530d-bdec-f72a422206fd', 'ex-067', 'Ceinture et équipements', 'Après un arrêt d’urgence, je dois revêtir mon gilet de haute visibilité :', 'Le gilet se porte dès que l’on quitte un véhicule immobilisé sur la chaussée ou ses abords, de nuit comme de jour, quelles que soient les conditions de visibilité.', '[{"title":"Équipements obligatoires en voiture : gilet de sécurité, triangle…","publisher":"Service-Public.gouv.fr (DILA)","url":"https://www.service-public.gouv.fr/particuliers/vosdroits/F19459","consulted_at":"2026-10-22","cited_articles":["R416-17 à R416-20","Arrêté du 30 septembre 2008 relatif à la présignalisation des véhicules"]},{"title":"Équipements obligatoires en voiture","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-aux-modes-de-deplacements/en-voiture/equipements-obligatoires-en-voiture","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'cf6420e8-eafc-530d-bdec-f72a422206fd';
delete from public.question_choices where question_id = 'cf6420e8-eafc-530d-bdec-f72a422206fd' and id not in ('0d4c2552-e858-5e43-bbf6-3d01e9e806a7', 'ee2c580a-fda5-5962-a2e1-de53c3038f66', 'daea44c7-825b-55f7-97d2-b39fc5cdd295');
insert into public.question_choices (id, question_id, position, label) values ('0d4c2552-e858-5e43-bbf6-3d01e9e806a7', 'cf6420e8-eafc-530d-bdec-f72a422206fd', 0, 'Seulement la nuit')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('ee2c580a-fda5-5962-a2e1-de53c3038f66', 'cf6420e8-eafc-530d-bdec-f72a422206fd', 1, 'Avant de quitter mon véhicule immobilisé sur la chaussée ou ses abords, de jour comme de nuit')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('daea44c7-825b-55f7-97d2-b39fc5cdd295', 'cf6420e8-eafc-530d-bdec-f72a422206fd', 2, 'Seulement sur autoroute')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('cf6420e8-eafc-530d-bdec-f72a422206fd', 'ee2c580a-fda5-5962-a2e1-de53c3038f66');
delete from public.question_competences where question_id = 'cf6420e8-eafc-530d-bdec-f72a422206fd';
insert into public.question_competences (question_id, competence_id) values ('cf6420e8-eafc-530d-bdec-f72a422206fd', '94064f20-6a59-54df-ab7d-ca1026477fd3');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('c383224d-2774-5c44-b364-db47bd49d1d4', 'ex-068', 'Ceinture et équipements', 'Mon gilet de haute visibilité doit être rangé :', 'Le gilet doit être rangé à portée de main, pour pouvoir l’enfiler avant de sortir du véhicule.', '[{"title":"Équipements obligatoires en voiture : gilet de sécurité, triangle…","publisher":"Service-Public.gouv.fr (DILA)","url":"https://www.service-public.gouv.fr/particuliers/vosdroits/F19459","consulted_at":"2026-10-22","cited_articles":["R416-17 à R416-20","Arrêté du 30 septembre 2008 relatif à la présignalisation des véhicules"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'c383224d-2774-5c44-b364-db47bd49d1d4';
delete from public.question_choices where question_id = 'c383224d-2774-5c44-b364-db47bd49d1d4' and id not in ('d64b27f4-462c-57bf-a568-197bfa41db87', 'f9c97ebe-2cfd-549b-b7a8-a806463effb2');
insert into public.question_choices (id, question_id, position, label) values ('d64b27f4-462c-57bf-a568-197bfa41db87', 'c383224d-2774-5c44-b364-db47bd49d1d4', 0, 'À portée de main')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('f9c97ebe-2cfd-549b-b7a8-a806463effb2', 'c383224d-2774-5c44-b364-db47bd49d1d4', 1, 'Dans le coffre, sous les bagages')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('c383224d-2774-5c44-b364-db47bd49d1d4', 'd64b27f4-462c-57bf-a568-197bfa41db87');
delete from public.question_competences where question_id = 'c383224d-2774-5c44-b364-db47bd49d1d4';
insert into public.question_competences (question_id, competence_id) values ('c383224d-2774-5c44-b364-db47bd49d1d4', '94064f20-6a59-54df-ab7d-ca1026477fd3');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('dd4a621f-a2cf-559d-8210-bb7cb1c51d15', 'q-demo-001', 'Priorités', 'J’arrive à une intersection où je suis prioritaire. Avant de la franchir, je dois :', 'Avoir la priorité n’est pas un droit absolu : il faut ralentir, contrôler ses rétroviseurs et vérifier que les autres laissent passer.', '[{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb, 'draft'::public.content_status, null, null, '8e12b044-e311-5cff-9739-7f70d56540de', true, false)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'dd4a621f-a2cf-559d-8210-bb7cb1c51d15';
delete from public.question_choices where question_id = 'dd4a621f-a2cf-559d-8210-bb7cb1c51d15' and id not in ('70498b37-5c39-5f37-ac00-8f16e42efed0', 'bcd4870b-0491-56ab-a994-16f457d5f671', 'cd48b61a-642a-5788-9ad6-92e143ed2743');
insert into public.question_choices (id, question_id, position, label) values ('70498b37-5c39-5f37-ac00-8f16e42efed0', 'dd4a621f-a2cf-559d-8210-bb7cb1c51d15', 0, 'Ralentir en contrôlant mes rétroviseurs')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('bcd4870b-0491-56ab-a994-16f457d5f671', 'dd4a621f-a2cf-559d-8210-bb7cb1c51d15', 1, 'M’assurer que les autres usagers me laissent passer')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('cd48b61a-642a-5788-9ad6-92e143ed2743', 'dd4a621f-a2cf-559d-8210-bb7cb1c51d15', 2, 'Accélérer pour dégager plus vite l’intersection')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('dd4a621f-a2cf-559d-8210-bb7cb1c51d15', '70498b37-5c39-5f37-ac00-8f16e42efed0');
insert into public.question_answers (question_id, choice_id) values ('dd4a621f-a2cf-559d-8210-bb7cb1c51d15', 'bcd4870b-0491-56ab-a994-16f457d5f671');
delete from public.question_competences where question_id = 'dd4a621f-a2cf-559d-8210-bb7cb1c51d15';
insert into public.question_competences (question_id, competence_id) values ('dd4a621f-a2cf-559d-8210-bb7cb1c51d15', '7fe7f3e9-aecc-5413-942d-e5c19bff2e3c');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('97577bef-364c-5b7e-b07b-708bb3967ef1', 'q-demo-002', 'Passages à niveau', 'La distance d’arrêt d’un train peut atteindre environ :', 'Selon la Sécurité routière, la distance d’arrêt d’un train peut atteindre 800 mètres : il ne peut pas s’arrêter à temps.', '[{"title":"Passage à niveau","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/passage-niveau","consulted_at":"2026-10-22","cited_articles":["R422-3","R412-30"]}]'::jsonb, 'draft'::public.content_status, null, null, '9857c203-7a8f-53cf-aceb-c4a06a75962e', true, false)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '97577bef-364c-5b7e-b07b-708bb3967ef1';
delete from public.question_choices where question_id = '97577bef-364c-5b7e-b07b-708bb3967ef1' and id not in ('f112ff8e-afa8-5f77-a84f-42a728a92c39', 'c885233a-9b3c-5773-af19-e96151d8f9cf', '85fe59e7-dae3-52f9-94e2-b992d4b607fc');
insert into public.question_choices (id, question_id, position, label) values ('f112ff8e-afa8-5f77-a84f-42a728a92c39', '97577bef-364c-5b7e-b07b-708bb3967ef1', 0, '80 mètres')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('c885233a-9b3c-5773-af19-e96151d8f9cf', '97577bef-364c-5b7e-b07b-708bb3967ef1', 1, '800 mètres')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('85fe59e7-dae3-52f9-94e2-b992d4b607fc', '97577bef-364c-5b7e-b07b-708bb3967ef1', 2, '8 kilomètres')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('97577bef-364c-5b7e-b07b-708bb3967ef1', 'c885233a-9b3c-5773-af19-e96151d8f9cf');
delete from public.question_competences where question_id = '97577bef-364c-5b7e-b07b-708bb3967ef1';
insert into public.question_competences (question_id, competence_id) values ('97577bef-364c-5b7e-b07b-708bb3967ef1', 'a8754ce0-1402-5b0e-b697-869bd4098e21');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('4016550a-00ce-5ea0-b55c-5a6250e558da', 'q-demo-003', 'Passages à niveau', 'Un train vient de passer, mais les barrières restent baissées. Je :', 'Si les barrières restent fermées, un autre train est probablement à l’approche ; sinon, on contacte la gare SNCF au numéro inscrit sur la pancarte ou avec le téléphone du passage à niveau.', '[{"title":"Passage à niveau","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/passage-niveau","consulted_at":"2026-10-22","cited_articles":["R422-3","R412-30"]}]'::jsonb, 'draft'::public.content_status, null, null, '9857c203-7a8f-53cf-aceb-c4a06a75962e', true, false)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '4016550a-00ce-5ea0-b55c-5a6250e558da';
delete from public.question_choices where question_id = '4016550a-00ce-5ea0-b55c-5a6250e558da' and id not in ('c5fe5a10-e761-5d55-a55a-321fac6fad4f', '984a0007-7c87-5d9d-82fb-1aa32733014c', '6f8c1da7-945a-5017-b67b-a6dded973a23');
insert into public.question_choices (id, question_id, position, label) values ('c5fe5a10-e761-5d55-a55a-321fac6fad4f', '4016550a-00ce-5ea0-b55c-5a6250e558da', 0, 'Attends : un autre train arrive probablement')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('984a0007-7c87-5d9d-82fb-1aa32733014c', '4016550a-00ce-5ea0-b55c-5a6250e558da', 1, 'Contourne les barrières si la voie paraît libre')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('6f8c1da7-945a-5017-b67b-a6dded973a23', '4016550a-00ce-5ea0-b55c-5a6250e558da', 2, 'Contacte la gare au numéro indiqué si l’attente se prolonge')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('4016550a-00ce-5ea0-b55c-5a6250e558da', 'c5fe5a10-e761-5d55-a55a-321fac6fad4f');
insert into public.question_answers (question_id, choice_id) values ('4016550a-00ce-5ea0-b55c-5a6250e558da', '6f8c1da7-945a-5017-b67b-a6dded973a23');
delete from public.question_competences where question_id = '4016550a-00ce-5ea0-b55c-5a6250e558da';
insert into public.question_competences (question_id, competence_id) values ('4016550a-00ce-5ea0-b55c-5a6250e558da', 'a8754ce0-1402-5b0e-b697-869bd4098e21');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('9b868b47-c375-53c4-86aa-46b5e66a0ae1', 'q-sim-001', 'Priorités', 'À une intersection sans panneau, sans feu et sans agent, vous allez tout droit. Une voiture arrive sur votre droite et une autre sur votre gauche. Que devez-vous faire ?', 'Sans panneau, sans feu et sans agent, le conducteur venant par la gauche doit céder le passage à l’autre (article R415-5, cité par la Sécurité routière) : vous cédez le passage à la voiture de droite, et la voiture de gauche doit vous céder le passage. Avoir la priorité n’est pas un droit absolu : ralentissez et vérifiez qu’elle vous laisse bien passer.', '[{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb, 'in_review'::public.content_status, null, null, '8e12b044-e311-5cff-9739-7f70d56540de', false, false)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '9b868b47-c375-53c4-86aa-46b5e66a0ae1';
delete from public.question_choices where question_id = '9b868b47-c375-53c4-86aa-46b5e66a0ae1' and id not in ('c87ed8c9-ac97-59d3-9fa1-02cdfd1267be', '3c575c41-ff75-5674-b297-0852e70bfb6d', 'a2a9118e-f8f6-5d69-a148-0cc427a2afc0', '5a52e0ce-3f95-5822-b73f-b3fb372a9762');
insert into public.question_choices (id, question_id, position, label) values ('c87ed8c9-ac97-59d3-9fa1-02cdfd1267be', '9b868b47-c375-53c4-86aa-46b5e66a0ae1', 0, 'Céder le passage à la voiture qui vient de ma droite')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('3c575c41-ff75-5674-b297-0852e70bfb6d', '9b868b47-c375-53c4-86aa-46b5e66a0ae1', 1, 'Passer avant la voiture qui vient de ma gauche, en restant attentif')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('a2a9118e-f8f6-5d69-a148-0cc427a2afc0', '9b868b47-c375-53c4-86aa-46b5e66a0ae1', 2, 'Passer en premier, car je vais tout droit')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('5a52e0ce-3f95-5822-b73f-b3fb372a9762', '9b868b47-c375-53c4-86aa-46b5e66a0ae1', 3, 'M’arrêter obligatoirement, comme à un stop')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('9b868b47-c375-53c4-86aa-46b5e66a0ae1', 'c87ed8c9-ac97-59d3-9fa1-02cdfd1267be');
insert into public.question_answers (question_id, choice_id) values ('9b868b47-c375-53c4-86aa-46b5e66a0ae1', '3c575c41-ff75-5674-b297-0852e70bfb6d');
delete from public.question_competences where question_id = '9b868b47-c375-53c4-86aa-46b5e66a0ae1';
insert into public.question_competences (question_id, competence_id) values ('9b868b47-c375-53c4-86aa-46b5e66a0ae1', '7fe7f3e9-aecc-5413-942d-e5c19bff2e3c');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('81bf121f-a68f-5b03-b2bb-ef3e182ad106', 'rv-001', 'Signalisation', 'Au milieu de la chaussée, une ligne de dissuasion sépare les deux sens de circulation. Je peux dépasser :', 'La ligne de dissuasion n’autorise que le dépassement des véhicules lents.', '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '81bf121f-a68f-5b03-b2bb-ef3e182ad106';
delete from public.question_choices where question_id = '81bf121f-a68f-5b03-b2bb-ef3e182ad106' and id not in ('be162a9d-ce1f-5085-a582-e1c00396cffc', '36ba7350-922a-552b-a711-21ef3ff1ca2e', 'b101e4b8-5f66-51d2-a22f-b49bcdf1b8d5');
insert into public.question_choices (id, question_id, position, label) values ('be162a9d-ce1f-5085-a582-e1c00396cffc', '81bf121f-a68f-5b03-b2bb-ef3e182ad106', 0, 'Aucun véhicule')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('36ba7350-922a-552b-a711-21ef3ff1ca2e', '81bf121f-a68f-5b03-b2bb-ef3e182ad106', 1, 'Uniquement les véhicules lents')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('b101e4b8-5f66-51d2-a22f-b49bcdf1b8d5', '81bf121f-a68f-5b03-b2bb-ef3e182ad106', 2, 'Tous les véhicules')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('81bf121f-a68f-5b03-b2bb-ef3e182ad106', '36ba7350-922a-552b-a711-21ef3ff1ca2e');
delete from public.question_competences where question_id = '81bf121f-a68f-5b03-b2bb-ef3e182ad106';
insert into public.question_competences (question_id, competence_id) values ('81bf121f-a68f-5b03-b2bb-ef3e182ad106', 'c3bbdb5b-a721-594f-bacd-c67f7cd97d76');
insert into public.question_competences (question_id, competence_id) values ('81bf121f-a68f-5b03-b2bb-ef3e182ad106', '826bd571-a74b-5e7b-ba38-3d612ce34756');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('2c74bf6b-05f9-5702-a638-b31494c47a12', 'rv-002', 'Signalisation', 'La ligne au milieu de la chaussée est discontinue. Si toutes les autres conditions de sécurité sont réunies, le dépassement est :', 'Une ligne discontinue autorise le dépassement, à condition de pouvoir le faire sans danger.', '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '2c74bf6b-05f9-5702-a638-b31494c47a12';
delete from public.question_choices where question_id = '2c74bf6b-05f9-5702-a638-b31494c47a12' and id not in ('3966dcf8-3303-54ae-93d1-eafb79bdaae2', '215a6177-7766-5bcf-85cb-4d4616b347f4');
insert into public.question_choices (id, question_id, position, label) values ('3966dcf8-3303-54ae-93d1-eafb79bdaae2', '2c74bf6b-05f9-5702-a638-b31494c47a12', 0, 'Interdit')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('215a6177-7766-5bcf-85cb-4d4616b347f4', '2c74bf6b-05f9-5702-a638-b31494c47a12', 1, 'Autorisé')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('2c74bf6b-05f9-5702-a638-b31494c47a12', '215a6177-7766-5bcf-85cb-4d4616b347f4');
delete from public.question_competences where question_id = '2c74bf6b-05f9-5702-a638-b31494c47a12';
insert into public.question_competences (question_id, competence_id) values ('2c74bf6b-05f9-5702-a638-b31494c47a12', 'c3bbdb5b-a721-594f-bacd-c67f7cd97d76');
insert into public.question_competences (question_id, competence_id) values ('2c74bf6b-05f9-5702-a638-b31494c47a12', '826bd571-a74b-5e7b-ba38-3d612ce34756');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('ae1baef3-17ce-54b5-9612-4e2418b14756', 'rv-003', 'Signalisation', 'Des flèches de rabattement sont peintes au sol. Elles annoncent (2 réponses) :', 'Les flèches de rabattement annoncent une ligne continue ou la fin d’un créneau de dépassement : il faut renoncer à dépasser dès la première flèche.', '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'ae1baef3-17ce-54b5-9612-4e2418b14756';
delete from public.question_choices where question_id = 'ae1baef3-17ce-54b5-9612-4e2418b14756' and id not in ('7ad11f9e-e195-5b4e-ac09-84f758e59685', 'abc726b8-8baa-5d1b-a3f6-37ce4542ee2c', '1e289059-29c3-5a86-be50-7baa6083a3ca');
insert into public.question_choices (id, question_id, position, label) values ('7ad11f9e-e195-5b4e-ac09-84f758e59685', 'ae1baef3-17ce-54b5-9612-4e2418b14756', 0, 'Une place de stationnement')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('abc726b8-8baa-5d1b-a3f6-37ce4542ee2c', 'ae1baef3-17ce-54b5-9612-4e2418b14756', 1, 'Une ligne continue')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('1e289059-29c3-5a86-be50-7baa6083a3ca', 'ae1baef3-17ce-54b5-9612-4e2418b14756', 2, 'La fin d’un créneau de dépassement')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('ae1baef3-17ce-54b5-9612-4e2418b14756', 'abc726b8-8baa-5d1b-a3f6-37ce4542ee2c');
insert into public.question_answers (question_id, choice_id) values ('ae1baef3-17ce-54b5-9612-4e2418b14756', '1e289059-29c3-5a86-be50-7baa6083a3ca');
delete from public.question_competences where question_id = 'ae1baef3-17ce-54b5-9612-4e2418b14756';
insert into public.question_competences (question_id, competence_id) values ('ae1baef3-17ce-54b5-9612-4e2418b14756', 'c3bbdb5b-a721-594f-bacd-c67f7cd97d76');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('12653e08-290d-596e-909c-92e8f9cd4520', 'rv-004', 'Signalisation', 'Avant un passage étroit, un panneau m’oblige à céder le passage aux véhicules venant en sens inverse. Personne n’arrive en face. Je :', 'Céder le passage n’oblige pas à s’arrêter : si personne n’arrive en face, on peut s’engager.', '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '12653e08-290d-596e-909c-92e8f9cd4520';
delete from public.question_choices where question_id = '12653e08-290d-596e-909c-92e8f9cd4520' and id not in ('7d47c138-990b-5ae4-8f2b-27f7b36ef504', 'a55886b0-777c-52d9-b493-5e741231902e');
insert into public.question_choices (id, question_id, position, label) values ('7d47c138-990b-5ae4-8f2b-27f7b36ef504', '12653e08-290d-596e-909c-92e8f9cd4520', 0, 'Dois m’arrêter quand même')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('a55886b0-777c-52d9-b493-5e741231902e', '12653e08-290d-596e-909c-92e8f9cd4520', 1, 'Peux m’engager sans m’arrêter')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('12653e08-290d-596e-909c-92e8f9cd4520', 'a55886b0-777c-52d9-b493-5e741231902e');
delete from public.question_competences where question_id = '12653e08-290d-596e-909c-92e8f9cd4520';
insert into public.question_competences (question_id, competence_id) values ('12653e08-290d-596e-909c-92e8f9cd4520', '5b02c6df-9f1f-52ff-93e1-f191b1ff6234');
insert into public.question_competences (question_id, competence_id) values ('12653e08-290d-596e-909c-92e8f9cd4520', '0fb3c8fd-0a66-5281-9a1b-fae51c48915e');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('d9f18ea5-c6d9-5517-9e38-0e9be7eb7425', 'rv-005', 'Signalisation', 'Avant un passage étroit, un panneau me donne la priorité sur les véhicules venant en sens inverse. Une voiture y est déjà engagée en face. Je :', 'Avoir la priorité n’est pas un droit absolu : si un usager est déjà engagé dans le rétrécissement, on le laisse passer.', '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'd9f18ea5-c6d9-5517-9e38-0e9be7eb7425';
delete from public.question_choices where question_id = 'd9f18ea5-c6d9-5517-9e38-0e9be7eb7425' and id not in ('789f8057-ae06-530c-bd97-3ee4761b9bbb', 'c9b96182-230f-5411-8bf5-29eb4898966c');
insert into public.question_choices (id, question_id, position, label) values ('789f8057-ae06-530c-bd97-3ee4761b9bbb', 'd9f18ea5-c6d9-5517-9e38-0e9be7eb7425', 0, 'La laisse passer')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('c9b96182-230f-5411-8bf5-29eb4898966c', 'd9f18ea5-c6d9-5517-9e38-0e9be7eb7425', 1, 'Passe, puisque je suis prioritaire')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('d9f18ea5-c6d9-5517-9e38-0e9be7eb7425', '789f8057-ae06-530c-bd97-3ee4761b9bbb');
delete from public.question_competences where question_id = 'd9f18ea5-c6d9-5517-9e38-0e9be7eb7425';
insert into public.question_competences (question_id, competence_id) values ('d9f18ea5-c6d9-5517-9e38-0e9be7eb7425', '5b02c6df-9f1f-52ff-93e1-f191b1ff6234');
insert into public.question_competences (question_id, competence_id) values ('d9f18ea5-c6d9-5517-9e38-0e9be7eb7425', '0fb3c8fd-0a66-5281-9a1b-fae51c48915e');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('c6ace9b1-ed24-545d-a695-25811ae9db65', 'rv-006', 'Signalisation', 'Un passage à niveau sans barrières est annoncé par :', 'Les passages à niveau sans barrières sont annoncés par une croix de Saint-André. Tout passage à niveau est annoncé par un panneau.', '[{"title":"Passage à niveau","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/passage-niveau","consulted_at":"2026-10-22","cited_articles":["R422-3","R412-30"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'c6ace9b1-ed24-545d-a695-25811ae9db65';
delete from public.question_choices where question_id = 'c6ace9b1-ed24-545d-a695-25811ae9db65' and id not in ('c7c7bd17-62a1-5204-abcf-59d460b00c08', '424d3829-39c0-5362-ae16-aabd704ba237', '7b655a41-3b11-54b4-8cbc-19cbb56d9d09');
insert into public.question_choices (id, question_id, position, label) values ('c7c7bd17-62a1-5204-abcf-59d460b00c08', 'c6ace9b1-ed24-545d-a695-25811ae9db65', 0, 'Un feu vert')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('424d3829-39c0-5362-ae16-aabd704ba237', 'c6ace9b1-ed24-545d-a695-25811ae9db65', 1, 'Aucune signalisation particulière')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('7b655a41-3b11-54b4-8cbc-19cbb56d9d09', 'c6ace9b1-ed24-545d-a695-25811ae9db65', 2, 'Une croix de Saint-André')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('c6ace9b1-ed24-545d-a695-25811ae9db65', '7b655a41-3b11-54b4-8cbc-19cbb56d9d09');
delete from public.question_competences where question_id = 'c6ace9b1-ed24-545d-a695-25811ae9db65';
insert into public.question_competences (question_id, competence_id) values ('c6ace9b1-ed24-545d-a695-25811ae9db65', '5b02c6df-9f1f-52ff-93e1-f191b1ff6234');
insert into public.question_competences (question_id, competence_id) values ('c6ace9b1-ed24-545d-a695-25811ae9db65', 'a8754ce0-1402-5b0e-b697-869bd4098e21');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('60502be6-0834-5f4d-97b4-57a8a6d35698', 'rv-007', 'Signalisation', 'Dans un tunnel, les issues de secours sont indiquées par des panneaux :', 'Les issues de secours, tous les 200 à 300 mètres, sont indiquées par des panneaux rectangulaires munis de néon vert.', '[{"title":"Conduire dans un tunnel","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/conduire-dans-un-tunnel","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '60502be6-0834-5f4d-97b4-57a8a6d35698';
delete from public.question_choices where question_id = '60502be6-0834-5f4d-97b4-57a8a6d35698' and id not in ('5aa3fd9d-2795-529d-bd7a-76c0c439a065', 'd99f7c67-6915-530d-ab75-15c9a89033fc', '37937cd3-9dce-546d-b0cc-7d541f502adf');
insert into public.question_choices (id, question_id, position, label) values ('5aa3fd9d-2795-529d-bd7a-76c0c439a065', '60502be6-0834-5f4d-97b4-57a8a6d35698', 0, 'Rectangulaires, munis de néon vert')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('d99f7c67-6915-530d-ab75-15c9a89033fc', '60502be6-0834-5f4d-97b4-57a8a6d35698', 1, 'Ronds, à bord rouge')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('37937cd3-9dce-546d-b0cc-7d541f502adf', '60502be6-0834-5f4d-97b4-57a8a6d35698', 2, 'Triangulaires, sur fond jaune')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('60502be6-0834-5f4d-97b4-57a8a6d35698', '5aa3fd9d-2795-529d-bd7a-76c0c439a065');
delete from public.question_competences where question_id = '60502be6-0834-5f4d-97b4-57a8a6d35698';
insert into public.question_competences (question_id, competence_id) values ('60502be6-0834-5f4d-97b4-57a8a6d35698', '5b02c6df-9f1f-52ff-93e1-f191b1ff6234');
insert into public.question_competences (question_id, competence_id) values ('60502be6-0834-5f4d-97b4-57a8a6d35698', '8d9197d8-6c24-50f3-b193-ada8b816fe81');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('99fc959d-ba94-5318-ba1d-20d8c5863e9b', 'rv-008', 'Signalisation', 'Dans un tunnel, un feu rouge clignote devant moi. Je :', 'Dans un tunnel, l’arrêt au feu rouge est absolu, qu’il soit fixe ou clignotant.', '[{"title":"Conduire dans un tunnel","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/conduire-dans-un-tunnel","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '99fc959d-ba94-5318-ba1d-20d8c5863e9b';
delete from public.question_choices where question_id = '99fc959d-ba94-5318-ba1d-20d8c5863e9b' and id not in ('68fec8b3-483d-5a43-a024-35c9831a1f5e', 'd690d4b9-4fc1-5ac0-9f42-6cdc9188f216');
insert into public.question_choices (id, question_id, position, label) values ('68fec8b3-483d-5a43-a024-35c9831a1f5e', '99fc959d-ba94-5318-ba1d-20d8c5863e9b', 0, 'Continue prudemment : seul le feu rouge fixe impose l’arrêt')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('d690d4b9-4fc1-5ac0-9f42-6cdc9188f216', '99fc959d-ba94-5318-ba1d-20d8c5863e9b', 1, 'M’arrête : l’arrêt est absolu au feu rouge, fixe ou clignotant')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('99fc959d-ba94-5318-ba1d-20d8c5863e9b', 'd690d4b9-4fc1-5ac0-9f42-6cdc9188f216');
delete from public.question_competences where question_id = '99fc959d-ba94-5318-ba1d-20d8c5863e9b';
insert into public.question_competences (question_id, competence_id) values ('99fc959d-ba94-5318-ba1d-20d8c5863e9b', '5b02c6df-9f1f-52ff-93e1-f191b1ff6234');
insert into public.question_competences (question_id, competence_id) values ('99fc959d-ba94-5318-ba1d-20d8c5863e9b', '8d9197d8-6c24-50f3-b193-ada8b816fe81');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('f197979b-fb16-5202-970b-a3c49a2bb57e', 'rv-009', 'Signalisation', 'Sur autoroute, une sortie que je veux prendre est annoncée. J’ai rejoint la bonne voie au plus tard :', 'Le changement de voie doit être achevé au plus tard au moment où l’on atteint les signaux placés au début de la bretelle ou de la bifurcation.', '[{"title":"Autoroute","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/autoroute","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'f197979b-fb16-5202-970b-a3c49a2bb57e';
delete from public.question_choices where question_id = 'f197979b-fb16-5202-970b-a3c49a2bb57e' and id not in ('3988f196-f542-5464-a825-07af6474b803', '6a9c514c-e32f-5d13-a8a8-5ebb9e5a63cc');
insert into public.question_choices (id, question_id, position, label) values ('3988f196-f542-5464-a825-07af6474b803', 'f197979b-fb16-5202-970b-a3c49a2bb57e', 0, 'Après le début de la bretelle')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('6a9c514c-e32f-5d13-a8a8-5ebb9e5a63cc', 'f197979b-fb16-5202-970b-a3c49a2bb57e', 1, 'Quand j’atteins les signaux placés au début de la bretelle')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('f197979b-fb16-5202-970b-a3c49a2bb57e', '6a9c514c-e32f-5d13-a8a8-5ebb9e5a63cc');
delete from public.question_competences where question_id = 'f197979b-fb16-5202-970b-a3c49a2bb57e';
insert into public.question_competences (question_id, competence_id) values ('f197979b-fb16-5202-970b-a3c49a2bb57e', '5b02c6df-9f1f-52ff-93e1-f191b1ff6234');
insert into public.question_competences (question_id, competence_id) values ('f197979b-fb16-5202-970b-a3c49a2bb57e', '4a75d17c-eda5-5f78-8dfd-d1fca5ba8560');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('51ac6dca-6b9a-566e-9c81-b02df07a3b1b', 'rv-010', 'Signalisation', 'Je stationne près d’un feu de circulation et mon véhicule, assez haut, le cache à la vue des autres usagers. Ce stationnement est :', 'Masquer un feu ou un panneau à la vue des usagers rend le stationnement très gênant (amende de 4e classe).', '[{"title":"Arrêt et stationnement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/arret-et-stationnement","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '51ac6dca-6b9a-566e-9c81-b02df07a3b1b';
delete from public.question_choices where question_id = '51ac6dca-6b9a-566e-9c81-b02df07a3b1b' and id not in ('ffbd750a-9601-5b69-b33c-ff28190398df', 'cd81a820-731d-546f-9d16-d02acc372eea');
insert into public.question_choices (id, question_id, position, label) values ('ffbd750a-9601-5b69-b33c-ff28190398df', '51ac6dca-6b9a-566e-9c81-b02df07a3b1b', 0, 'Autorisé')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('cd81a820-731d-546f-9d16-d02acc372eea', '51ac6dca-6b9a-566e-9c81-b02df07a3b1b', 1, 'Très gênant')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('51ac6dca-6b9a-566e-9c81-b02df07a3b1b', 'cd81a820-731d-546f-9d16-d02acc372eea');
delete from public.question_competences where question_id = '51ac6dca-6b9a-566e-9c81-b02df07a3b1b';
insert into public.question_competences (question_id, competence_id) values ('51ac6dca-6b9a-566e-9c81-b02df07a3b1b', '5b02c6df-9f1f-52ff-93e1-f191b1ff6234');
insert into public.question_competences (question_id, competence_id) values ('51ac6dca-6b9a-566e-9c81-b02df07a3b1b', '9633e039-8208-5c8f-b4e6-22f0326ab7f3');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('9b9a1477-9365-5a27-9a21-fddf26414f38', 'rv-011', 'Signalisation', 'À une intersection, le feu fonctionne et il est vert pour moi. Un panneau donne une autre règle. Je respecte :', 'Les feux priment sur les panneaux. Si le feu ne fonctionne pas, on applique la règle indiquée par le panneau. Un agent prime sur les deux.', '[{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '9b9a1477-9365-5a27-9a21-fddf26414f38';
delete from public.question_choices where question_id = '9b9a1477-9365-5a27-9a21-fddf26414f38' and id not in ('8bf04297-6256-514e-8e03-3957bb4e0ab5', '91febbc5-d787-513e-a1a3-dff887ceb0ec');
insert into public.question_choices (id, question_id, position, label) values ('8bf04297-6256-514e-8e03-3957bb4e0ab5', '9b9a1477-9365-5a27-9a21-fddf26414f38', 0, 'Le feu')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('91febbc5-d787-513e-a1a3-dff887ceb0ec', '9b9a1477-9365-5a27-9a21-fddf26414f38', 1, 'Le panneau')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('9b9a1477-9365-5a27-9a21-fddf26414f38', '8bf04297-6256-514e-8e03-3957bb4e0ab5');
delete from public.question_competences where question_id = '9b9a1477-9365-5a27-9a21-fddf26414f38';
insert into public.question_competences (question_id, competence_id) values ('9b9a1477-9365-5a27-9a21-fddf26414f38', '5b02c6df-9f1f-52ff-93e1-f191b1ff6234');
insert into public.question_competences (question_id, competence_id) values ('9b9a1477-9365-5a27-9a21-fddf26414f38', '7fe7f3e9-aecc-5413-942d-e5c19bff2e3c');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('947f29df-0231-5730-a9ae-dded83260262', 'rv-012', 'Signalisation', 'Une ligne continue longe le bord droit de la route. Je m’arrête entre le bord et cette ligne, et les autres ne peuvent plus passer sans la chevaucher. Cet arrêt est :', 'L’arrêt entre le bord de la route et une ligne continue est gênant quand la place restante oblige les autres à franchir ou chevaucher la ligne.', '[{"title":"Arrêt et stationnement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/arret-et-stationnement","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '947f29df-0231-5730-a9ae-dded83260262';
delete from public.question_choices where question_id = '947f29df-0231-5730-a9ae-dded83260262' and id not in ('b67fecbb-890a-5622-9c94-1b8b4654d9d4', '08609406-dd3f-5171-9d85-3f2a49f3f05b');
insert into public.question_choices (id, question_id, position, label) values ('b67fecbb-890a-5622-9c94-1b8b4654d9d4', '947f29df-0231-5730-a9ae-dded83260262', 0, 'Gênant')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('08609406-dd3f-5171-9d85-3f2a49f3f05b', '947f29df-0231-5730-a9ae-dded83260262', 1, 'Autorisé')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('947f29df-0231-5730-a9ae-dded83260262', 'b67fecbb-890a-5622-9c94-1b8b4654d9d4');
delete from public.question_competences where question_id = '947f29df-0231-5730-a9ae-dded83260262';
insert into public.question_competences (question_id, competence_id) values ('947f29df-0231-5730-a9ae-dded83260262', 'c3bbdb5b-a721-594f-bacd-c67f7cd97d76');
insert into public.question_competences (question_id, competence_id) values ('947f29df-0231-5730-a9ae-dded83260262', '9633e039-8208-5c8f-b4e6-22f0326ab7f3');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('225471fc-b0cc-5e67-a917-4ef7b6e0352f', 'rv-013', 'Signalisation', 'Dans un tunnel, des signaux indiquent quelles voies sont ouvertes. Je dois :', 'En entrant dans un tunnel, il faut respecter les signaux d’affectation des voies.', '[{"title":"Conduire dans un tunnel","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/conduire-dans-un-tunnel","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '225471fc-b0cc-5e67-a917-4ef7b6e0352f';
delete from public.question_choices where question_id = '225471fc-b0cc-5e67-a917-4ef7b6e0352f' and id not in ('41de5c85-05b3-51ef-a738-b8a040417587', '1043ca34-7602-5467-b3d8-296b4d9cd9ef');
insert into public.question_choices (id, question_id, position, label) values ('41de5c85-05b3-51ef-a738-b8a040417587', '225471fc-b0cc-5e67-a917-4ef7b6e0352f', 0, 'Les respecter')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('1043ca34-7602-5467-b3d8-296b4d9cd9ef', '225471fc-b0cc-5e67-a917-4ef7b6e0352f', 1, 'Les ignorer si le tunnel est vide')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('225471fc-b0cc-5e67-a917-4ef7b6e0352f', '41de5c85-05b3-51ef-a738-b8a040417587');
delete from public.question_competences where question_id = '225471fc-b0cc-5e67-a917-4ef7b6e0352f';
insert into public.question_competences (question_id, competence_id) values ('225471fc-b0cc-5e67-a917-4ef7b6e0352f', '5b02c6df-9f1f-52ff-93e1-f191b1ff6234');
insert into public.question_competences (question_id, competence_id) values ('225471fc-b0cc-5e67-a917-4ef7b6e0352f', '8d9197d8-6c24-50f3-b193-ada8b816fe81');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('f56404fc-9266-52c9-b383-34f4baed03f2', 'rv-014', 'Arrêt et stationnement', 'Sur une route à sens unique, je peux stationner :', 'Sur une route à double sens, on stationne à droite ; sur une route à sens unique, à droite ou à gauche.', '[{"title":"Arrêt et stationnement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/arret-et-stationnement","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'f56404fc-9266-52c9-b383-34f4baed03f2';
delete from public.question_choices where question_id = 'f56404fc-9266-52c9-b383-34f4baed03f2' and id not in ('32c2d5f6-a325-5342-aee0-bece9a3d4834', '74c32f60-1f88-562d-b48a-6b6bffd72f65');
insert into public.question_choices (id, question_id, position, label) values ('32c2d5f6-a325-5342-aee0-bece9a3d4834', 'f56404fc-9266-52c9-b383-34f4baed03f2', 0, 'Uniquement à droite')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('74c32f60-1f88-562d-b48a-6b6bffd72f65', 'f56404fc-9266-52c9-b383-34f4baed03f2', 1, 'À droite ou à gauche')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('f56404fc-9266-52c9-b383-34f4baed03f2', '74c32f60-1f88-562d-b48a-6b6bffd72f65');
delete from public.question_competences where question_id = 'f56404fc-9266-52c9-b383-34f4baed03f2';
insert into public.question_competences (question_id, competence_id) values ('f56404fc-9266-52c9-b383-34f4baed03f2', '9633e039-8208-5c8f-b4e6-22f0326ab7f3');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('8dcbbc7d-fb36-58a1-8222-fb181fb5d89d', 'rv-015', 'Arrêt et stationnement', 'Hors agglomération, je m’arrête :', 'Hors agglomération, l’arrêt et le stationnement se font autant que possible sur le bord de la route (ou l’accotement si le sol s’y prête), pour ne pas gêner.', '[{"title":"Arrêt et stationnement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/arret-et-stationnement","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '8dcbbc7d-fb36-58a1-8222-fb181fb5d89d';
delete from public.question_choices where question_id = '8dcbbc7d-fb36-58a1-8222-fb181fb5d89d' and id not in ('8b25db75-75b7-599f-ab12-0a6bb52814fc', '0ec4c875-ccd0-57ec-90de-b5ed7ba5e697');
insert into public.question_choices (id, question_id, position, label) values ('8b25db75-75b7-599f-ab12-0a6bb52814fc', '8dcbbc7d-fb36-58a1-8222-fb181fb5d89d', 0, 'Au milieu de ma voie, avec les feux de détresse')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('0ec4c875-ccd0-57ec-90de-b5ed7ba5e697', '8dcbbc7d-fb36-58a1-8222-fb181fb5d89d', 1, 'Autant que possible hors de la chaussée, sur le bord de la route')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('8dcbbc7d-fb36-58a1-8222-fb181fb5d89d', '0ec4c875-ccd0-57ec-90de-b5ed7ba5e697');
delete from public.question_competences where question_id = '8dcbbc7d-fb36-58a1-8222-fb181fb5d89d';
insert into public.question_competences (question_id, competence_id) values ('8dcbbc7d-fb36-58a1-8222-fb181fb5d89d', '9633e039-8208-5c8f-b4e6-22f0326ab7f3');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('4268ce84-24fd-5a55-9735-a7c6508c7f36', 'rv-016', 'Arrêt et stationnement', 'Je m’arrête juste après un virage, là où la visibilité est insuffisante. Cet arrêt est :', 'L’arrêt près d’un virage, d’une intersection, d’un sommet de côte ou d’un passage à niveau, quand la visibilité est insuffisante, est dangereux.', '[{"title":"Arrêt et stationnement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/arret-et-stationnement","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '4268ce84-24fd-5a55-9735-a7c6508c7f36';
delete from public.question_choices where question_id = '4268ce84-24fd-5a55-9735-a7c6508c7f36' and id not in ('a761ec16-4077-5b0d-aa4d-4e7107c9cc82', '647d2c36-aabd-57ec-8571-ea95f9854101', '16c13699-a7ed-530b-be21-1d67772b63bb');
insert into public.question_choices (id, question_id, position, label) values ('a761ec16-4077-5b0d-aa4d-4e7107c9cc82', '4268ce84-24fd-5a55-9735-a7c6508c7f36', 0, 'Simplement gênant')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('647d2c36-aabd-57ec-8571-ea95f9854101', '4268ce84-24fd-5a55-9735-a7c6508c7f36', 1, 'Autorisé s’il est bref')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('16c13699-a7ed-530b-be21-1d67772b63bb', '4268ce84-24fd-5a55-9735-a7c6508c7f36', 2, 'Dangereux')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('4268ce84-24fd-5a55-9735-a7c6508c7f36', '16c13699-a7ed-530b-be21-1d67772b63bb');
delete from public.question_competences where question_id = '4268ce84-24fd-5a55-9735-a7c6508c7f36';
insert into public.question_competences (question_id, competence_id) values ('4268ce84-24fd-5a55-9735-a7c6508c7f36', '9633e039-8208-5c8f-b4e6-22f0326ab7f3');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('24b64069-c420-5e82-9041-255881a91116', 'rv-017', 'Arrêt et stationnement', 'Un arrêt ou un stationnement dangereux entraîne de plein droit un retrait de :', 'Le stationnement dangereux est puni d’une amende de 4e classe et entraîne de plein droit le retrait de 3 points.', '[{"title":"Arrêt et stationnement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/arret-et-stationnement","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '24b64069-c420-5e82-9041-255881a91116';
delete from public.question_choices where question_id = '24b64069-c420-5e82-9041-255881a91116' and id not in ('ae2b5464-f4b6-5851-919a-8a34d648f6c7', 'f32ae96b-e869-5775-bfc1-a699b6151602', '1bcc6ed3-51fd-59e8-9f44-d8cf579376b3');
insert into public.question_choices (id, question_id, position, label) values ('ae2b5464-f4b6-5851-919a-8a34d648f6c7', '24b64069-c420-5e82-9041-255881a91116', 0, '1 point')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('f32ae96b-e869-5775-bfc1-a699b6151602', '24b64069-c420-5e82-9041-255881a91116', 1, '3 points')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('1bcc6ed3-51fd-59e8-9f44-d8cf579376b3', '24b64069-c420-5e82-9041-255881a91116', 2, '6 points')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('24b64069-c420-5e82-9041-255881a91116', 'f32ae96b-e869-5775-bfc1-a699b6151602');
delete from public.question_competences where question_id = '24b64069-c420-5e82-9041-255881a91116';
insert into public.question_competences (question_id, competence_id) values ('24b64069-c420-5e82-9041-255881a91116', '9633e039-8208-5c8f-b4e6-22f0326ab7f3');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('c039e5e6-fd24-54e0-b789-e6cd2881af50', 'rv-018', 'Arrêt et stationnement', 'Sans carte mobilité inclusion, je me gare sur une place réservée aux personnes handicapées. Ce stationnement est :', 'Occuper un emplacement réservé aux véhicules portant la carte mobilité inclusion « stationnement pour personnes handicapées » est très gênant.', '[{"title":"Arrêt et stationnement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/arret-et-stationnement","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'c039e5e6-fd24-54e0-b789-e6cd2881af50';
delete from public.question_choices where question_id = 'c039e5e6-fd24-54e0-b789-e6cd2881af50' and id not in ('37124a04-81e0-56ea-ad38-27db0756f2d4', '287792e7-e322-5138-918e-fab53321edfe');
insert into public.question_choices (id, question_id, position, label) values ('37124a04-81e0-56ea-ad38-27db0756f2d4', 'c039e5e6-fd24-54e0-b789-e6cd2881af50', 0, 'Très gênant')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('287792e7-e322-5138-918e-fab53321edfe', 'c039e5e6-fd24-54e0-b789-e6cd2881af50', 1, 'Autorisé pour quelques minutes')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('c039e5e6-fd24-54e0-b789-e6cd2881af50', '37124a04-81e0-56ea-ad38-27db0756f2d4');
delete from public.question_competences where question_id = 'c039e5e6-fd24-54e0-b789-e6cd2881af50';
insert into public.question_competences (question_id, competence_id) values ('c039e5e6-fd24-54e0-b789-e6cd2881af50', '9633e039-8208-5c8f-b4e6-22f0326ab7f3');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('fb90945f-c18f-5ee2-895f-157c61d34d4f', 'rv-019', 'Arrêt et stationnement', 'Je m’arrête sur un passage piéton le temps de déposer un passager. C’est :', 'Un véhicule à l’arrêt ou en stationnement sur un passage piéton est en situation très gênante.', '[{"title":"Arrêt et stationnement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/arret-et-stationnement","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'fb90945f-c18f-5ee2-895f-157c61d34d4f';
delete from public.question_choices where question_id = 'fb90945f-c18f-5ee2-895f-157c61d34d4f' and id not in ('0dfffda9-49ff-55ae-9935-dfe3071c187f', '0f688b97-2afb-5c16-bb1e-6a72f2bc9786');
insert into public.question_choices (id, question_id, position, label) values ('0dfffda9-49ff-55ae-9935-dfe3071c187f', 'fb90945f-c18f-5ee2-895f-157c61d34d4f', 0, 'Autorisé si je reste au volant')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('0f688b97-2afb-5c16-bb1e-6a72f2bc9786', 'fb90945f-c18f-5ee2-895f-157c61d34d4f', 1, 'Très gênant')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('fb90945f-c18f-5ee2-895f-157c61d34d4f', '0f688b97-2afb-5c16-bb1e-6a72f2bc9786');
delete from public.question_competences where question_id = 'fb90945f-c18f-5ee2-895f-157c61d34d4f';
insert into public.question_competences (question_id, competence_id) values ('fb90945f-c18f-5ee2-895f-157c61d34d4f', '9633e039-8208-5c8f-b4e6-22f0326ab7f3');
insert into public.question_competences (question_id, competence_id) values ('fb90945f-c18f-5ee2-895f-157c61d34d4f', '4d2a0934-e1b1-5172-9c6f-eacb55406515');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('d4ed3a78-6a0d-54a7-b87d-a19873a30e15', 'rv-020', 'Arrêt et stationnement', 'En voiture, je stationne 3 mètres avant un passage piéton, dans le sens de la circulation, hors emplacement matérialisé. C’est :', 'Pour un véhicule motorisé (sauf motos, tricycles et cyclomoteurs), stationner dans les 5 mètres en amont d’un passage piéton, hors emplacement matérialisé, est très gênant.', '[{"title":"Arrêt et stationnement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/arret-et-stationnement","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'd4ed3a78-6a0d-54a7-b87d-a19873a30e15';
delete from public.question_choices where question_id = 'd4ed3a78-6a0d-54a7-b87d-a19873a30e15' and id not in ('7367bf00-d6bd-5aeb-abdc-32a79c140625', 'e3e63013-4442-5183-b66b-587aff82daad');
insert into public.question_choices (id, question_id, position, label) values ('7367bf00-d6bd-5aeb-abdc-32a79c140625', 'd4ed3a78-6a0d-54a7-b87d-a19873a30e15', 0, 'Très gênant')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('e3e63013-4442-5183-b66b-587aff82daad', 'd4ed3a78-6a0d-54a7-b87d-a19873a30e15', 1, 'Autorisé')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('d4ed3a78-6a0d-54a7-b87d-a19873a30e15', '7367bf00-d6bd-5aeb-abdc-32a79c140625');
delete from public.question_competences where question_id = 'd4ed3a78-6a0d-54a7-b87d-a19873a30e15';
insert into public.question_competences (question_id, competence_id) values ('d4ed3a78-6a0d-54a7-b87d-a19873a30e15', '9633e039-8208-5c8f-b4e6-22f0326ab7f3');
insert into public.question_competences (question_id, competence_id) values ('d4ed3a78-6a0d-54a7-b87d-a19873a30e15', '4d2a0934-e1b1-5172-9c6f-eacb55406515');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('1f26fe25-2182-5441-9f19-a3765a68a9e1', 'rv-021', 'Arrêt et stationnement', 'Je m’arrête en double file avec ma voiture, feux de détresse allumés. Cet arrêt est :', 'L’arrêt ou le stationnement en double file est gênant, sauf pour les vélos, cyclomoteurs à deux roues et motos. Les feux de détresse n’y changent rien.', '[{"title":"Arrêt et stationnement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/arret-et-stationnement","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '1f26fe25-2182-5441-9f19-a3765a68a9e1';
delete from public.question_choices where question_id = '1f26fe25-2182-5441-9f19-a3765a68a9e1' and id not in ('97bf66d7-0818-51d8-8a38-48f40df6a8c9', 'ff656473-b32a-5360-b58b-4a70285440fd');
insert into public.question_choices (id, question_id, position, label) values ('97bf66d7-0818-51d8-8a38-48f40df6a8c9', '1f26fe25-2182-5441-9f19-a3765a68a9e1', 0, 'Autorisé grâce aux feux de détresse')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('ff656473-b32a-5360-b58b-4a70285440fd', '1f26fe25-2182-5441-9f19-a3765a68a9e1', 1, 'Gênant')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('1f26fe25-2182-5441-9f19-a3765a68a9e1', 'ff656473-b32a-5360-b58b-4a70285440fd');
delete from public.question_competences where question_id = '1f26fe25-2182-5441-9f19-a3765a68a9e1';
insert into public.question_competences (question_id, competence_id) values ('1f26fe25-2182-5441-9f19-a3765a68a9e1', '9633e039-8208-5c8f-b4e6-22f0326ab7f3');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('8f720736-5dd6-5259-9e8e-2ec82573ae77', 'rv-022', 'Arrêt et stationnement', 'Sauf arrêté fixant une durée plus courte, un stationnement ininterrompu au même endroit de la voie publique devient abusif au-delà de :', 'Le stationnement est abusif au-delà de sept jours sans interruption au même point, ou d’une durée plus courte fixée par arrêté.', '[{"title":"Arrêt et stationnement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/arret-et-stationnement","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '8f720736-5dd6-5259-9e8e-2ec82573ae77';
delete from public.question_choices where question_id = '8f720736-5dd6-5259-9e8e-2ec82573ae77' and id not in ('9a4dc5c5-af22-52d9-b3f4-a7c246731511', 'a486fa2d-1010-5269-828c-f811dae44a70', '801e4488-563b-5c5d-be2e-eef8cc3a1e8a');
insert into public.question_choices (id, question_id, position, label) values ('9a4dc5c5-af22-52d9-b3f4-a7c246731511', '8f720736-5dd6-5259-9e8e-2ec82573ae77', 0, '24 heures')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('a486fa2d-1010-5269-828c-f811dae44a70', '8f720736-5dd6-5259-9e8e-2ec82573ae77', 1, '7 jours')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('801e4488-563b-5c5d-be2e-eef8cc3a1e8a', '8f720736-5dd6-5259-9e8e-2ec82573ae77', 2, '30 jours')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('8f720736-5dd6-5259-9e8e-2ec82573ae77', 'a486fa2d-1010-5269-828c-f811dae44a70');
delete from public.question_competences where question_id = '8f720736-5dd6-5259-9e8e-2ec82573ae77';
insert into public.question_competences (question_id, competence_id) values ('8f720736-5dd6-5259-9e8e-2ec82573ae77', '9633e039-8208-5c8f-b4e6-22f0326ab7f3');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('9eb34ba9-c616-59c8-9289-37fa023d0fd2', 'rv-023', 'Arrêt et stationnement', 'Avant de m’éloigner de ma voiture stationnée, je dois :', 'Le conducteur ne peut s’éloigner qu’après avoir pris toutes les précautions nécessaires pour prévenir un accident du fait de son absence.', '[{"title":"Arrêt et stationnement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/arret-et-stationnement","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '9eb34ba9-c616-59c8-9289-37fa023d0fd2';
delete from public.question_choices where question_id = '9eb34ba9-c616-59c8-9289-37fa023d0fd2' and id not in ('e48e0f97-9ee4-5861-8e53-138f4665b8e9', 'f7e12851-16c4-5a54-845e-9743b9aada1c');
insert into public.question_choices (id, question_id, position, label) values ('e48e0f97-9ee4-5861-8e53-138f4665b8e9', '9eb34ba9-c616-59c8-9289-37fa023d0fd2', 0, 'Prendre les précautions nécessaires pour éviter tout risque d’accident dû à mon absence')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('f7e12851-16c4-5a54-845e-9743b9aada1c', '9eb34ba9-c616-59c8-9289-37fa023d0fd2', 1, 'Seulement verrouiller les portières')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('9eb34ba9-c616-59c8-9289-37fa023d0fd2', 'e48e0f97-9ee4-5861-8e53-138f4665b8e9');
delete from public.question_competences where question_id = '9eb34ba9-c616-59c8-9289-37fa023d0fd2';
insert into public.question_competences (question_id, competence_id) values ('9eb34ba9-c616-59c8-9289-37fa023d0fd2', '9633e039-8208-5c8f-b4e6-22f0326ab7f3');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('8def8779-0827-5e0a-b246-6ad836f99ac4', 'rv-024', 'Arrêt et stationnement', 'Ma voiture est garée de façon gênante et je suis absent. Elle peut être (2 réponses) :', 'Si le conducteur est absent ou refuse de déplacer son véhicule, l’immobilisation et la mise en fourrière peuvent être prescrites.', '[{"title":"Arrêt et stationnement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/arret-et-stationnement","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '8def8779-0827-5e0a-b246-6ad836f99ac4';
delete from public.question_choices where question_id = '8def8779-0827-5e0a-b246-6ad836f99ac4' and id not in ('f8202379-d95c-5a25-8463-eb8cf03c8954', '9a8d3657-59bb-5857-b542-166ac0b6a427', '38f09610-039f-52ed-948b-241a2c16f36d');
insert into public.question_choices (id, question_id, position, label) values ('f8202379-d95c-5a25-8463-eb8cf03c8954', '8def8779-0827-5e0a-b246-6ad836f99ac4', 0, 'Immobilisée')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('9a8d3657-59bb-5857-b542-166ac0b6a427', '8def8779-0827-5e0a-b246-6ad836f99ac4', 1, 'Mise en fourrière')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('38f09610-039f-52ed-948b-241a2c16f36d', '8def8779-0827-5e0a-b246-6ad836f99ac4', 2, 'Laissée sur place : rien n’est possible sans moi')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('8def8779-0827-5e0a-b246-6ad836f99ac4', 'f8202379-d95c-5a25-8463-eb8cf03c8954');
insert into public.question_answers (question_id, choice_id) values ('8def8779-0827-5e0a-b246-6ad836f99ac4', '9a8d3657-59bb-5857-b542-166ac0b6a427');
delete from public.question_competences where question_id = '8def8779-0827-5e0a-b246-6ad836f99ac4';
insert into public.question_competences (question_id, competence_id) values ('8def8779-0827-5e0a-b246-6ad836f99ac4', '9633e039-8208-5c8f-b4e6-22f0326ab7f3');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('970739f3-1ddf-5586-ac31-e1bcad368154', 'rv-025', 'Arrêt et stationnement', 'Dans une zone de rencontre, je peux stationner :', 'En zone de rencontre, l’arrêt ou le stationnement en dehors des emplacements aménagés est gênant.', '[{"title":"Arrêt et stationnement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/arret-et-stationnement","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '970739f3-1ddf-5586-ac31-e1bcad368154';
delete from public.question_choices where question_id = '970739f3-1ddf-5586-ac31-e1bcad368154' and id not in ('2bce2730-79fb-579e-ab8f-84c591b96a56', '20797e95-3d26-5eba-a197-42816d9bfa67');
insert into public.question_choices (id, question_id, position, label) values ('2bce2730-79fb-579e-ab8f-84c591b96a56', '970739f3-1ddf-5586-ac31-e1bcad368154', 0, 'Partout, puisque la vitesse y est faible')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('20797e95-3d26-5eba-a197-42816d9bfa67', '970739f3-1ddf-5586-ac31-e1bcad368154', 1, 'Seulement sur les emplacements aménagés')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('970739f3-1ddf-5586-ac31-e1bcad368154', '20797e95-3d26-5eba-a197-42816d9bfa67');
delete from public.question_competences where question_id = '970739f3-1ddf-5586-ac31-e1bcad368154';
insert into public.question_competences (question_id, competence_id) values ('970739f3-1ddf-5586-ac31-e1bcad368154', '9633e039-8208-5c8f-b4e6-22f0326ab7f3');
insert into public.question_competences (question_id, competence_id) values ('970739f3-1ddf-5586-ac31-e1bcad368154', '22ccf1ae-d20c-5540-84d9-7af8f655864b');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('80325a13-aef7-5a31-8fd7-9f15b46eb51f', 'rv-026', 'Arrêt et stationnement', 'Sauf disposition contraire de l’autorité, s’arrêter sur un pont ou dans un tunnel est :', 'L’arrêt ou le stationnement sur les ponts, dans les passages souterrains, les tunnels et sous les passages supérieurs est gênant, sauf dispositions différentes.', '[{"title":"Arrêt et stationnement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/arret-et-stationnement","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '80325a13-aef7-5a31-8fd7-9f15b46eb51f';
delete from public.question_choices where question_id = '80325a13-aef7-5a31-8fd7-9f15b46eb51f' and id not in ('078f10eb-ad00-57af-a4cf-26dd4acf47d4', '524109f9-4e01-5f60-a8ed-10f486f741ef');
insert into public.question_choices (id, question_id, position, label) values ('078f10eb-ad00-57af-a4cf-26dd4acf47d4', '80325a13-aef7-5a31-8fd7-9f15b46eb51f', 0, 'Gênant')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('524109f9-4e01-5f60-a8ed-10f486f741ef', '80325a13-aef7-5a31-8fd7-9f15b46eb51f', 1, 'Autorisé')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('80325a13-aef7-5a31-8fd7-9f15b46eb51f', '078f10eb-ad00-57af-a4cf-26dd4acf47d4');
delete from public.question_competences where question_id = '80325a13-aef7-5a31-8fd7-9f15b46eb51f';
insert into public.question_competences (question_id, competence_id) values ('80325a13-aef7-5a31-8fd7-9f15b46eb51f', '9633e039-8208-5c8f-b4e6-22f0326ab7f3');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('19db6efd-b27d-564e-be0e-21c121ae359d', 'rv-027', 'Arrêt et stationnement', 'Je me gare devant l’entrée d’un immeuble riverain. Ce stationnement est :', 'Le stationnement devant les entrées des immeubles riverains est considéré comme gênant.', '[{"title":"Arrêt et stationnement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/arret-et-stationnement","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '19db6efd-b27d-564e-be0e-21c121ae359d';
delete from public.question_choices where question_id = '19db6efd-b27d-564e-be0e-21c121ae359d' and id not in ('ec24de50-33f7-5479-bfff-41280d64a986', '6a57ce74-9e51-5798-980b-9639f19daa4b');
insert into public.question_choices (id, question_id, position, label) values ('ec24de50-33f7-5479-bfff-41280d64a986', '19db6efd-b27d-564e-be0e-21c121ae359d', 0, 'Autorisé la nuit')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('6a57ce74-9e51-5798-980b-9639f19daa4b', '19db6efd-b27d-564e-be0e-21c121ae359d', 1, 'Gênant')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('19db6efd-b27d-564e-be0e-21c121ae359d', '6a57ce74-9e51-5798-980b-9639f19daa4b');
delete from public.question_competences where question_id = '19db6efd-b27d-564e-be0e-21c121ae359d';
insert into public.question_competences (question_id, competence_id) values ('19db6efd-b27d-564e-be0e-21c121ae359d', '9633e039-8208-5c8f-b4e6-22f0326ab7f3');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('f790cca6-76b2-5224-bc19-935153225010', 'rv-028', 'Écoconduite', 'Des pneus sous-gonflés entraînent (2 réponses) :', 'Des pneus sous-gonflés, c’est du carburant en plus et une moins bonne tenue de route : on vérifie leur pression avant de partir.', '[{"title":"Éco-conduite en voiture","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chacun-son-mode-de-deplacement/dangers-de-la-route-en-voiture/mieux-conduire-en-voiture/eco","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'f790cca6-76b2-5224-bc19-935153225010';
delete from public.question_choices where question_id = 'f790cca6-76b2-5224-bc19-935153225010' and id not in ('017fe696-c397-5ac5-a6cb-c2fce339c239', 'b0e23f54-c01b-595b-9d05-c8df8a155b9c', 'c775d24e-cc6d-5bc5-a264-0ce117e269f1');
insert into public.question_choices (id, question_id, position, label) values ('017fe696-c397-5ac5-a6cb-c2fce339c239', 'f790cca6-76b2-5224-bc19-935153225010', 0, 'Une surconsommation de carburant')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('b0e23f54-c01b-595b-9d05-c8df8a155b9c', 'f790cca6-76b2-5224-bc19-935153225010', 1, 'Une meilleure adhérence')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('c775d24e-cc6d-5bc5-a264-0ce117e269f1', 'f790cca6-76b2-5224-bc19-935153225010', 2, 'Une moins bonne tenue de route')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('f790cca6-76b2-5224-bc19-935153225010', '017fe696-c397-5ac5-a6cb-c2fce339c239');
insert into public.question_answers (question_id, choice_id) values ('f790cca6-76b2-5224-bc19-935153225010', 'c775d24e-cc6d-5bc5-a264-0ce117e269f1');
delete from public.question_competences where question_id = 'f790cca6-76b2-5224-bc19-935153225010';
insert into public.question_competences (question_id, competence_id) values ('f790cca6-76b2-5224-bc19-935153225010', '41854bad-69c9-5799-91e7-71d22ffef121');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('d049467f-c5e0-571e-a3a5-3dc3c45f873f', 'rv-029', 'Écoconduite', 'Un véhicule mal entretenu peut consommer davantage de carburant, jusqu’à :', 'Un véhicule mal entretenu peut entraîner une surconsommation allant jusqu’à 25 %.', '[{"title":"Éco-conduite en voiture","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chacun-son-mode-de-deplacement/dangers-de-la-route-en-voiture/mieux-conduire-en-voiture/eco","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'd049467f-c5e0-571e-a3a5-3dc3c45f873f';
delete from public.question_choices where question_id = 'd049467f-c5e0-571e-a3a5-3dc3c45f873f' and id not in ('efb3cb81-6b1d-5a09-913f-eb6be48d232e', '1dba1801-7b97-50f9-9330-4fe9402c6bd7');
insert into public.question_choices (id, question_id, position, label) values ('efb3cb81-6b1d-5a09-913f-eb6be48d232e', 'd049467f-c5e0-571e-a3a5-3dc3c45f873f', 0, '2 %')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('1dba1801-7b97-50f9-9330-4fe9402c6bd7', 'd049467f-c5e0-571e-a3a5-3dc3c45f873f', 1, '25 %')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('d049467f-c5e0-571e-a3a5-3dc3c45f873f', '1dba1801-7b97-50f9-9330-4fe9402c6bd7');
delete from public.question_competences where question_id = 'd049467f-c5e0-571e-a3a5-3dc3c45f873f';
insert into public.question_competences (question_id, competence_id) values ('d049467f-c5e0-571e-a3a5-3dc3c45f873f', '41854bad-69c9-5799-91e7-71d22ffef121');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('4557c8ee-8d99-52f6-8d2b-0714268e0b66', 'rv-030', 'Écoconduite', 'Je laisse mon coffre de toit en place alors qu’il est vide. Cela peut augmenter ma consommation de :', 'Un coffre de toit laissé en place après usage entraîne une surconsommation de 10 à 15 % : on le démonte.', '[{"title":"Éco-conduite en voiture","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chacun-son-mode-de-deplacement/dangers-de-la-route-en-voiture/mieux-conduire-en-voiture/eco","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '4557c8ee-8d99-52f6-8d2b-0714268e0b66';
delete from public.question_choices where question_id = '4557c8ee-8d99-52f6-8d2b-0714268e0b66' and id not in ('953131e9-b536-559e-8233-4734ffd9185a', 'db9af992-4cc7-5c3a-968d-b821cbe44f09');
insert into public.question_choices (id, question_id, position, label) values ('953131e9-b536-559e-8233-4734ffd9185a', '4557c8ee-8d99-52f6-8d2b-0714268e0b66', 0, '10 à 15 %')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('db9af992-4cc7-5c3a-968d-b821cbe44f09', '4557c8ee-8d99-52f6-8d2b-0714268e0b66', 1, 'Moins de 1 %')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('4557c8ee-8d99-52f6-8d2b-0714268e0b66', '953131e9-b536-559e-8233-4734ffd9185a');
delete from public.question_competences where question_id = '4557c8ee-8d99-52f6-8d2b-0714268e0b66';
insert into public.question_competences (question_id, competence_id) values ('4557c8ee-8d99-52f6-8d2b-0714268e0b66', '41854bad-69c9-5799-91e7-71d22ffef121');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('e356cdc8-e70d-506d-8a04-2ccde398860c', 'rv-031', 'Écoconduite', 'Je dois rester à l’arrêt plus de 20 secondes. Pour consommer moins :', 'Arrêter puis redémarrer consomme moins que laisser tourner le moteur au ralenti plus de 20 secondes.', '[{"title":"Éco-conduite en voiture","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chacun-son-mode-de-deplacement/dangers-de-la-route-en-voiture/mieux-conduire-en-voiture/eco","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'e356cdc8-e70d-506d-8a04-2ccde398860c';
delete from public.question_choices where question_id = 'e356cdc8-e70d-506d-8a04-2ccde398860c' and id not in ('b4d03b9a-ed5e-5fc3-a7dc-264faf2d0a33', '3444a0da-3aa9-5ed2-9ae4-ad1b6efb66c5');
insert into public.question_choices (id, question_id, position, label) values ('b4d03b9a-ed5e-5fc3-a7dc-264faf2d0a33', 'e356cdc8-e70d-506d-8a04-2ccde398860c', 0, 'Je laisse tourner le moteur au ralenti')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('3444a0da-3aa9-5ed2-9ae4-ad1b6efb66c5', 'e356cdc8-e70d-506d-8a04-2ccde398860c', 1, 'Je coupe le moteur')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('e356cdc8-e70d-506d-8a04-2ccde398860c', '3444a0da-3aa9-5ed2-9ae4-ad1b6efb66c5');
delete from public.question_competences where question_id = 'e356cdc8-e70d-506d-8a04-2ccde398860c';
insert into public.question_competences (question_id, competence_id) values ('e356cdc8-e70d-506d-8a04-2ccde398860c', '41854bad-69c9-5799-91e7-71d22ffef121');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('0527504c-8ac1-5557-ba59-510bff6eaac1', 'rv-032', 'Écoconduite', 'En ville, la climatisation peut augmenter la consommation de carburant jusqu’à :', 'La surconsommation due à la climatisation peut atteindre 10 % sur route et 25 % en ville.', '[{"title":"Éco-conduite en voiture","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chacun-son-mode-de-deplacement/dangers-de-la-route-en-voiture/mieux-conduire-en-voiture/eco","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '0527504c-8ac1-5557-ba59-510bff6eaac1';
delete from public.question_choices where question_id = '0527504c-8ac1-5557-ba59-510bff6eaac1' and id not in ('5379d7f9-e4d0-5d35-98fd-11af38b97fe4', '58329232-339f-557e-818d-335dd0bea388');
insert into public.question_choices (id, question_id, position, label) values ('5379d7f9-e4d0-5d35-98fd-11af38b97fe4', '0527504c-8ac1-5557-ba59-510bff6eaac1', 0, '25 %')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('58329232-339f-557e-818d-335dd0bea388', '0527504c-8ac1-5557-ba59-510bff6eaac1', 1, '3 %')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('0527504c-8ac1-5557-ba59-510bff6eaac1', '5379d7f9-e4d0-5d35-98fd-11af38b97fe4');
delete from public.question_competences where question_id = '0527504c-8ac1-5557-ba59-510bff6eaac1';
insert into public.question_competences (question_id, competence_id) values ('0527504c-8ac1-5557-ba59-510bff6eaac1', '41854bad-69c9-5799-91e7-71d22ffef121');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('37228c74-8242-537e-b236-1bf5694d764d', 'rv-033', 'Écoconduite', 'Rouler 10 km/h moins vite sur un trajet de 500 km permet d’économiser jusqu’à :', '10 km/h en moins permettent d’économiser jusqu’à 5 litres et de réduire de 12,5 % les émissions de CO2 sur 500 km.', '[{"title":"Éco-conduite en voiture","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chacun-son-mode-de-deplacement/dangers-de-la-route-en-voiture/mieux-conduire-en-voiture/eco","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '37228c74-8242-537e-b236-1bf5694d764d';
delete from public.question_choices where question_id = '37228c74-8242-537e-b236-1bf5694d764d' and id not in ('a39df304-47ed-512a-a821-e6eaeb102af6', '2222e916-56b3-5b66-a999-b25745da25a6');
insert into public.question_choices (id, question_id, position, label) values ('a39df304-47ed-512a-a821-e6eaeb102af6', '37228c74-8242-537e-b236-1bf5694d764d', 0, '50 litres de carburant')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('2222e916-56b3-5b66-a999-b25745da25a6', '37228c74-8242-537e-b236-1bf5694d764d', 1, '5 litres de carburant')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('37228c74-8242-537e-b236-1bf5694d764d', '2222e916-56b3-5b66-a999-b25745da25a6');
delete from public.question_competences where question_id = '37228c74-8242-537e-b236-1bf5694d764d';
insert into public.question_competences (question_id, competence_id) values ('37228c74-8242-537e-b236-1bf5694d764d', '41854bad-69c9-5799-91e7-71d22ffef121');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('915a31e5-4c1b-56be-a429-167dabfecc55', 'rv-034', 'Écoconduite', 'Je laisse le moteur monter haut dans les tours avant de changer de rapport. Ces sur-régimes peuvent entraîner une surconsommation de :', 'Démarrer en douceur et passer sans attendre le rapport supérieur évite les sur-régimes, qui occasionnent environ 20 % de surconsommation.', '[{"title":"Éco-conduite en voiture","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chacun-son-mode-de-deplacement/dangers-de-la-route-en-voiture/mieux-conduire-en-voiture/eco","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '915a31e5-4c1b-56be-a429-167dabfecc55';
delete from public.question_choices where question_id = '915a31e5-4c1b-56be-a429-167dabfecc55' and id not in ('2da7b147-01c3-5473-9d8b-9ad5d8752a47', '5c4b1883-bb4c-5a5d-b508-45f105bd3f47');
insert into public.question_choices (id, question_id, position, label) values ('2da7b147-01c3-5473-9d8b-9ad5d8752a47', '915a31e5-4c1b-56be-a429-167dabfecc55', 0, '1 %')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('5c4b1883-bb4c-5a5d-b508-45f105bd3f47', '915a31e5-4c1b-56be-a429-167dabfecc55', 1, '20 %')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('915a31e5-4c1b-56be-a429-167dabfecc55', '5c4b1883-bb4c-5a5d-b508-45f105bd3f47');
delete from public.question_competences where question_id = '915a31e5-4c1b-56be-a429-167dabfecc55';
insert into public.question_competences (question_id, competence_id) values ('915a31e5-4c1b-56be-a429-167dabfecc55', '41854bad-69c9-5799-91e7-71d22ffef121');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('2582b0cf-24d5-5a80-a01e-2117e1e987af', 'rv-035', 'Tunnels et passages à niveau', 'Dans un tunnel, la distance à garder avec le véhicule devant moi, même à l’arrêt, est de :', 'Dans un tunnel, on respecte les distances de sécurité même à l’arrêt (70 à 150 mètres) : elles sont nécessaires à l’intervention des secours.', '[{"title":"Conduire dans un tunnel","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/conduire-dans-un-tunnel","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '2582b0cf-24d5-5a80-a01e-2117e1e987af';
delete from public.question_choices where question_id = '2582b0cf-24d5-5a80-a01e-2117e1e987af' and id not in ('2493f563-6584-5a48-aaa0-b9c698a31ab3', '3d18e9cb-70f5-5694-bd59-bd7c59dbdee1');
insert into public.question_choices (id, question_id, position, label) values ('2493f563-6584-5a48-aaa0-b9c698a31ab3', '2582b0cf-24d5-5a80-a01e-2117e1e987af', 0, '2 à 5 mètres')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('3d18e9cb-70f5-5694-bd59-bd7c59dbdee1', '2582b0cf-24d5-5a80-a01e-2117e1e987af', 1, '70 à 150 mètres')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('2582b0cf-24d5-5a80-a01e-2117e1e987af', '3d18e9cb-70f5-5694-bd59-bd7c59dbdee1');
delete from public.question_competences where question_id = '2582b0cf-24d5-5a80-a01e-2117e1e987af';
insert into public.question_competences (question_id, competence_id) values ('2582b0cf-24d5-5a80-a01e-2117e1e987af', '8d9197d8-6c24-50f3-b193-ada8b816fe81');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('6b30687a-01cb-513f-b07d-341b9019e155', 'rv-036', 'Tunnels et passages à niveau', 'Dans un tunnel, ma voiture prend feu et la sortie est proche. Je :', 'Si le véhicule prend feu et que la sortie est proche, on essaie de quitter le tunnel avec le véhicule.', '[{"title":"Conduire dans un tunnel","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/conduire-dans-un-tunnel","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '6b30687a-01cb-513f-b07d-341b9019e155';
delete from public.question_choices where question_id = '6b30687a-01cb-513f-b07d-341b9019e155' and id not in ('79645980-a59a-529e-bf05-e89c3f239c71', '6361d7a7-5fba-5b1b-882d-32baffecec90');
insert into public.question_choices (id, question_id, position, label) values ('79645980-a59a-529e-bf05-e89c3f239c71', '6b30687a-01cb-513f-b07d-341b9019e155', 0, 'Essaie de sortir du tunnel avec ma voiture')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('6361d7a7-5fba-5b1b-882d-32baffecec90', '6b30687a-01cb-513f-b07d-341b9019e155', 1, 'M’arrête aussitôt au milieu de la voie')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('6b30687a-01cb-513f-b07d-341b9019e155', '79645980-a59a-529e-bf05-e89c3f239c71');
delete from public.question_competences where question_id = '6b30687a-01cb-513f-b07d-341b9019e155';
insert into public.question_competences (question_id, competence_id) values ('6b30687a-01cb-513f-b07d-341b9019e155', '8d9197d8-6c24-50f3-b193-ada8b816fe81');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('cfe32834-1dd2-5540-88f2-330e62513c77', 'rv-037', 'Tunnels et passages à niveau', 'Dans un tunnel, pour donner l’alerte, j’utilise :', 'Les téléphones de secours du tunnel permettent de vous localiser, contrairement au téléphone portable.', '[{"title":"Conduire dans un tunnel","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/conduire-dans-un-tunnel","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'cfe32834-1dd2-5540-88f2-330e62513c77';
delete from public.question_choices where question_id = 'cfe32834-1dd2-5540-88f2-330e62513c77' and id not in ('dd512b35-a645-5549-b708-1667c5519bdf', 'd5cf8b42-18e9-5e1a-82ad-9e8df0b34eeb');
insert into public.question_choices (id, question_id, position, label) values ('dd512b35-a645-5549-b708-1667c5519bdf', 'cfe32834-1dd2-5540-88f2-330e62513c77', 0, 'Mon téléphone portable')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('d5cf8b42-18e9-5e1a-82ad-9e8df0b34eeb', 'cfe32834-1dd2-5540-88f2-330e62513c77', 1, 'Un téléphone de secours du tunnel')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('cfe32834-1dd2-5540-88f2-330e62513c77', 'd5cf8b42-18e9-5e1a-82ad-9e8df0b34eeb');
delete from public.question_competences where question_id = 'cfe32834-1dd2-5540-88f2-330e62513c77';
insert into public.question_competences (question_id, competence_id) values ('cfe32834-1dd2-5540-88f2-330e62513c77', '8d9197d8-6c24-50f3-b193-ada8b816fe81');
insert into public.question_competences (question_id, competence_id) values ('cfe32834-1dd2-5540-88f2-330e62513c77', '24f9e463-bc22-5e54-98a3-661f9dcceb33');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('e7bfe05c-5e0e-5ff0-9d5b-11ec500e9266', 'rv-038', 'Tunnels et passages à niveau', 'Dans un tunnel, de la fumée apparaît. Avant de quitter ma voiture, je coupe le moteur et :', 'En cas de fumée : couper le moteur en laissant la clé sur le contact, puis quitter le véhicule avec tous les passagers par une issue de secours.', '[{"title":"Conduire dans un tunnel","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/conduire-dans-un-tunnel","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'e7bfe05c-5e0e-5ff0-9d5b-11ec500e9266';
delete from public.question_choices where question_id = 'e7bfe05c-5e0e-5ff0-9d5b-11ec500e9266' and id not in ('3eb2f2a0-4c00-5f66-af80-8fcd4a533e6a', 'd020b423-6c39-51e2-ae89-bc77638767d9');
insert into public.question_choices (id, question_id, position, label) values ('3eb2f2a0-4c00-5f66-af80-8fcd4a533e6a', 'e7bfe05c-5e0e-5ff0-9d5b-11ec500e9266', 0, 'Je laisse la clé sur le contact')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('d020b423-6c39-51e2-ae89-bc77638767d9', 'e7bfe05c-5e0e-5ff0-9d5b-11ec500e9266', 1, 'J’emporte la clé')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('e7bfe05c-5e0e-5ff0-9d5b-11ec500e9266', '3eb2f2a0-4c00-5f66-af80-8fcd4a533e6a');
delete from public.question_competences where question_id = 'e7bfe05c-5e0e-5ff0-9d5b-11ec500e9266';
insert into public.question_competences (question_id, competence_id) values ('e7bfe05c-5e0e-5ff0-9d5b-11ec500e9266', '8d9197d8-6c24-50f3-b193-ada8b816fe81');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('0dace697-4b46-5c9e-b416-db1e3e8a69d3', 'rv-039', 'Tunnels et passages à niveau', 'Dans un tunnel, je me rends compte que je me suis trompé de direction. Je peux faire demi-tour :', 'Dans un tunnel, il est interdit de faire demi-tour et de s’arrêter, hormis en cas d’urgence sur les emplacements prévus.', '[{"title":"Conduire dans un tunnel","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/conduire-dans-un-tunnel","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '0dace697-4b46-5c9e-b416-db1e3e8a69d3';
delete from public.question_choices where question_id = '0dace697-4b46-5c9e-b416-db1e3e8a69d3' and id not in ('1e57e95f-1e17-56d8-be81-49073de9009b', '7431e50b-afd0-5d4a-a582-568934e6c882');
insert into public.question_choices (id, question_id, position, label) values ('1e57e95f-1e17-56d8-be81-49073de9009b', '0dace697-4b46-5c9e-b416-db1e3e8a69d3', 0, 'Jamais : c’est interdit')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('7431e50b-afd0-5d4a-a582-568934e6c882', '0dace697-4b46-5c9e-b416-db1e3e8a69d3', 1, 'Oui, si la voie est libre')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('0dace697-4b46-5c9e-b416-db1e3e8a69d3', '1e57e95f-1e17-56d8-be81-49073de9009b');
delete from public.question_competences where question_id = '0dace697-4b46-5c9e-b416-db1e3e8a69d3';
insert into public.question_competences (question_id, competence_id) values ('0dace697-4b46-5c9e-b416-db1e3e8a69d3', '8d9197d8-6c24-50f3-b193-ada8b816fe81');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('cd3bee86-f2a7-51c1-9047-4846ee1fbced', 'rv-040', 'Tunnels et passages à niveau', 'Ma voiture tombe en panne dans un tunnel et je ne peux pas en sortir. Je :', 'En cas de panne : feux de détresse, puis sortir du tunnel si possible ; sinon rejoindre l’emplacement d’arrêt d’urgence le plus proche et donner l’alerte.', '[{"title":"Conduire dans un tunnel","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/conduire-dans-un-tunnel","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'cd3bee86-f2a7-51c1-9047-4846ee1fbced';
delete from public.question_choices where question_id = 'cd3bee86-f2a7-51c1-9047-4846ee1fbced' and id not in ('8625622c-a56d-5ead-b1dd-a01151ff940b', 'fdf4816c-ff0f-5e0e-a256-6da69909fda6');
insert into public.question_choices (id, question_id, position, label) values ('8625622c-a56d-5ead-b1dd-a01151ff940b', 'cd3bee86-f2a7-51c1-9047-4846ee1fbced', 0, 'Rejoins l’emplacement d’arrêt d’urgence le plus proche, au plus près du bord droit')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('fdf4816c-ff0f-5e0e-a256-6da69909fda6', 'cd3bee86-f2a7-51c1-9047-4846ee1fbced', 1, 'M’arrête sur place sans signaler ma présence')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('cd3bee86-f2a7-51c1-9047-4846ee1fbced', '8625622c-a56d-5ead-b1dd-a01151ff940b');
delete from public.question_competences where question_id = 'cd3bee86-f2a7-51c1-9047-4846ee1fbced';
insert into public.question_competences (question_id, competence_id) values ('cd3bee86-f2a7-51c1-9047-4846ee1fbced', '8d9197d8-6c24-50f3-b193-ada8b816fe81');
insert into public.question_competences (question_id, competence_id) values ('cd3bee86-f2a7-51c1-9047-4846ee1fbced', 'ad7e4ff8-02e2-51f2-955e-6689b0731b71');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('916a0c65-6224-5237-8186-97ed91ff08df', 'rv-041', 'Tunnels et passages à niveau', 'Dans un tunnel, la circulation ralentit fortement. J’allume :', 'En cas de ralentissement dans un tunnel, on allume ses feux de détresse et on garde ses distances.', '[{"title":"Conduire dans un tunnel","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/conduire-dans-un-tunnel","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '916a0c65-6224-5237-8186-97ed91ff08df';
delete from public.question_choices where question_id = '916a0c65-6224-5237-8186-97ed91ff08df' and id not in ('2c4938f5-e76f-5360-9783-ed91881b1d8d', '4706a497-a14b-55fc-8cb5-b37abef74315');
insert into public.question_choices (id, question_id, position, label) values ('2c4938f5-e76f-5360-9783-ed91881b1d8d', '916a0c65-6224-5237-8186-97ed91ff08df', 0, 'Mes feux de route')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('4706a497-a14b-55fc-8cb5-b37abef74315', '916a0c65-6224-5237-8186-97ed91ff08df', 1, 'Mes feux de détresse')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('916a0c65-6224-5237-8186-97ed91ff08df', '4706a497-a14b-55fc-8cb5-b37abef74315');
delete from public.question_competences where question_id = '916a0c65-6224-5237-8186-97ed91ff08df';
insert into public.question_competences (question_id, competence_id) values ('916a0c65-6224-5237-8186-97ed91ff08df', '8d9197d8-6c24-50f3-b193-ada8b816fe81');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('0b09d546-a8a6-554e-9707-d32ce622d8bc', 'rv-042', 'Tunnels et passages à niveau', 'La distance d’arrêt d’un train peut atteindre :', 'Un train peut avoir besoin de 800 mètres pour s’arrêter : le code de la route lui accorde la priorité absolue.', '[{"title":"Passage à niveau","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/passage-niveau","consulted_at":"2026-10-22","cited_articles":["R422-3","R412-30"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '0b09d546-a8a6-554e-9707-d32ce622d8bc';
delete from public.question_choices where question_id = '0b09d546-a8a6-554e-9707-d32ce622d8bc' and id not in ('ce3a245f-f2fc-5eae-9e8d-46ba27413ab4', '159adeb8-90f3-5d1f-a9f5-cffbfc994a2d');
insert into public.question_choices (id, question_id, position, label) values ('ce3a245f-f2fc-5eae-9e8d-46ba27413ab4', '0b09d546-a8a6-554e-9707-d32ce622d8bc', 0, '800 mètres')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('159adeb8-90f3-5d1f-a9f5-cffbfc994a2d', '0b09d546-a8a6-554e-9707-d32ce622d8bc', 1, '80 mètres')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('0b09d546-a8a6-554e-9707-d32ce622d8bc', 'ce3a245f-f2fc-5eae-9e8d-46ba27413ab4');
delete from public.question_competences where question_id = '0b09d546-a8a6-554e-9707-d32ce622d8bc';
insert into public.question_competences (question_id, competence_id) values ('0b09d546-a8a6-554e-9707-d32ce622d8bc', 'a8754ce0-1402-5b0e-b697-869bd4098e21');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('cca9c4d4-03ff-5110-b484-db023aec6f88', 'rv-043', 'Tunnels et passages à niveau', 'Après le passage d’un train, les barrières du passage à niveau restent baissées. C’est probablement :', 'Si les barrières restent fermées après un train, un autre arrive probablement ; sinon, on contacte la gare avec le numéro ou le téléphone du passage à niveau.', '[{"title":"Passage à niveau","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/passage-niveau","consulted_at":"2026-10-22","cited_articles":["R422-3","R412-30"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'cca9c4d4-03ff-5110-b484-db023aec6f88';
delete from public.question_choices where question_id = 'cca9c4d4-03ff-5110-b484-db023aec6f88' and id not in ('31bfb28f-ba73-59f4-b6ee-da881b7eff3c', '61f85674-913d-51ae-9ce6-c09c8cc2d392');
insert into public.question_choices (id, question_id, position, label) values ('31bfb28f-ba73-59f4-b6ee-da881b7eff3c', 'cca9c4d4-03ff-5110-b484-db023aec6f88', 0, 'Une panne : je contourne les barrières')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('61f85674-913d-51ae-9ce6-c09c8cc2d392', 'cca9c4d4-03ff-5110-b484-db023aec6f88', 1, 'Qu’un autre train arrive')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('cca9c4d4-03ff-5110-b484-db023aec6f88', '61f85674-913d-51ae-9ce6-c09c8cc2d392');
delete from public.question_competences where question_id = 'cca9c4d4-03ff-5110-b484-db023aec6f88';
insert into public.question_competences (question_id, competence_id) values ('cca9c4d4-03ff-5110-b484-db023aec6f88', 'a8754ce0-1402-5b0e-b697-869bd4098e21');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('f04dbc67-670e-5ce1-867a-db6ad00bba23', 'rv-044', 'Tunnels et passages à niveau', 'À un passage à niveau sans barrières, je :', 'Sans barrières, on s’arrête avant le passage à niveau et on vérifie qu’aucun train n’arrive avant de franchir la voie ferrée.', '[{"title":"Passage à niveau","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/passage-niveau","consulted_at":"2026-10-22","cited_articles":["R422-3","R412-30"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'f04dbc67-670e-5ce1-867a-db6ad00bba23';
delete from public.question_choices where question_id = 'f04dbc67-670e-5ce1-867a-db6ad00bba23' and id not in ('a5e173af-828e-55e5-98ac-675eb0ec7166', 'f0d75f7f-c7f4-5efc-8cf1-0d7866d45a29');
insert into public.question_choices (id, question_id, position, label) values ('a5e173af-828e-55e5-98ac-675eb0ec7166', 'f04dbc67-670e-5ce1-867a-db6ad00bba23', 0, 'M’arrête et vérifie qu’aucun train n’arrive avant de traverser')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('f0d75f7f-c7f4-5efc-8cf1-0d7866d45a29', 'f04dbc67-670e-5ce1-867a-db6ad00bba23', 1, 'Passe sans ralentir s’il n’y a pas de feu')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('f04dbc67-670e-5ce1-867a-db6ad00bba23', 'a5e173af-828e-55e5-98ac-675eb0ec7166');
delete from public.question_competences where question_id = 'f04dbc67-670e-5ce1-867a-db6ad00bba23';
insert into public.question_competences (question_id, competence_id) values ('f04dbc67-670e-5ce1-867a-db6ad00bba23', 'a8754ce0-1402-5b0e-b697-869bd4098e21');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('ff6d3582-2ebb-5fa0-848d-26d3613dbf05', 'rv-045', 'Tunnels et passages à niveau', 'La route est encombrée après un passage à niveau. Je m’engage sur la voie ferrée :', 'On ne traverse que si l’on est absolument certain de pouvoir se dégager rapidement, et on ne s’arrête jamais sur la voie ferrée.', '[{"title":"Passage à niveau","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/passage-niveau","consulted_at":"2026-10-22","cited_articles":["R422-3","R412-30"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'ff6d3582-2ebb-5fa0-848d-26d3613dbf05';
delete from public.question_choices where question_id = 'ff6d3582-2ebb-5fa0-848d-26d3613dbf05' and id not in ('58daf378-125f-5325-ae00-ce29bf3a1540', 'e9498078-9007-57ec-9052-4835d2ce5d00');
insert into public.question_choices (id, question_id, position, label) values ('58daf378-125f-5325-ae00-ce29bf3a1540', 'ff6d3582-2ebb-5fa0-848d-26d3613dbf05', 0, 'Seulement si je suis certain de pouvoir me dégager rapidement')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('e9498078-9007-57ec-9052-4835d2ce5d00', 'ff6d3582-2ebb-5fa0-848d-26d3613dbf05', 1, 'Dès que la voiture devant moi s’engage')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('ff6d3582-2ebb-5fa0-848d-26d3613dbf05', '58daf378-125f-5325-ae00-ce29bf3a1540');
delete from public.question_competences where question_id = 'ff6d3582-2ebb-5fa0-848d-26d3613dbf05';
insert into public.question_competences (question_id, competence_id) values ('ff6d3582-2ebb-5fa0-848d-26d3613dbf05', 'a8754ce0-1402-5b0e-b697-869bd4098e21');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('7b6c1a98-972f-5b6c-8271-55960ba56bf4', 'rv-046', 'Tunnels et passages à niveau', 'À vélo, je traverse les rails d’un passage à niveau :', 'La roue d’un vélo peut se coincer dans l’ornière des rails : on traverse aussi perpendiculairement que possible.', '[{"title":"Passage à niveau","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-sur-routes-specifiques/passage-niveau","consulted_at":"2026-10-22","cited_articles":["R422-3","R412-30"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '7b6c1a98-972f-5b6c-8271-55960ba56bf4';
delete from public.question_choices where question_id = '7b6c1a98-972f-5b6c-8271-55960ba56bf4' and id not in ('2c495af1-bec6-506b-a99f-bf59de5c89e1', 'd8550d2f-54ca-59ea-b62d-8737a09a709e');
insert into public.question_choices (id, question_id, position, label) values ('2c495af1-bec6-506b-a99f-bf59de5c89e1', '7b6c1a98-972f-5b6c-8271-55960ba56bf4', 0, 'En biais, pour gagner du temps')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('d8550d2f-54ca-59ea-b62d-8737a09a709e', '7b6c1a98-972f-5b6c-8271-55960ba56bf4', 1, 'Aussi perpendiculairement que possible')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('7b6c1a98-972f-5b6c-8271-55960ba56bf4', 'd8550d2f-54ca-59ea-b62d-8737a09a709e');
delete from public.question_competences where question_id = '7b6c1a98-972f-5b6c-8271-55960ba56bf4';
insert into public.question_competences (question_id, competence_id) values ('7b6c1a98-972f-5b6c-8271-55960ba56bf4', 'a8754ce0-1402-5b0e-b697-869bd4098e21');
insert into public.question_competences (question_id, competence_id) values ('7b6c1a98-972f-5b6c-8271-55960ba56bf4', '4d2a0934-e1b1-5172-9c6f-eacb55406515');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('9abd896f-b677-5116-9d31-3f8c8ee63359', 'rv-047', 'Visibilité et éclairage', 'Par temps de brouillard, en plus de mes feux de croisement, j’utilise :', 'Par brouillard, on réduit sa vitesse et on utilise les feux de brouillard avant en complément des feux de croisement.', '[{"title":"Conduire par temps de brouillard","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-selon-la-meteo/conduire-par-temps-de-brouillard","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '9abd896f-b677-5116-9d31-3f8c8ee63359';
delete from public.question_choices where question_id = '9abd896f-b677-5116-9d31-3f8c8ee63359' and id not in ('41eacd07-69fa-5ff8-8a4c-9f0a16429564', '15f85386-8811-5541-83bc-811c942a5cec');
insert into public.question_choices (id, question_id, position, label) values ('41eacd07-69fa-5ff8-8a4c-9f0a16429564', '9abd896f-b677-5116-9d31-3f8c8ee63359', 0, 'Mes feux de brouillard avant')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('15f85386-8811-5541-83bc-811c942a5cec', '9abd896f-b677-5116-9d31-3f8c8ee63359', 1, 'Mes feux de route')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('9abd896f-b677-5116-9d31-3f8c8ee63359', '41eacd07-69fa-5ff8-8a4c-9f0a16429564');
delete from public.question_competences where question_id = '9abd896f-b677-5116-9d31-3f8c8ee63359';
insert into public.question_competences (question_id, competence_id) values ('9abd896f-b677-5116-9d31-3f8c8ee63359', '3647f5af-2b62-567f-a0e2-281cc052752d');
insert into public.question_competences (question_id, competence_id) values ('9abd896f-b677-5116-9d31-3f8c8ee63359', '6dbd753d-1595-5e3e-817c-9cdb33b47aec');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('6634105e-6286-5196-862e-bb931da31e59', 'rv-048', 'Visibilité et éclairage', 'Du brouillard est annoncé et je dois faire un trajet en rase campagne. Le conseil de la Sécurité routière :', 'Si du brouillard est annoncé, différez votre départ, surtout pour un trajet en rase campagne.', '[{"title":"Conduire par temps de brouillard","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/conduire-selon-la-meteo/conduire-par-temps-de-brouillard","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '6634105e-6286-5196-862e-bb931da31e59';
delete from public.question_choices where question_id = '6634105e-6286-5196-862e-bb931da31e59' and id not in ('050de178-dfe8-51c9-9693-e211b88b9d1e', '18e21b1c-3082-56cf-b16c-bc4b30125356');
insert into public.question_choices (id, question_id, position, label) values ('050de178-dfe8-51c9-9693-e211b88b9d1e', '6634105e-6286-5196-862e-bb931da31e59', 0, 'Partir plus vite pour arriver avant')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('18e21b1c-3082-56cf-b16c-bc4b30125356', '6634105e-6286-5196-862e-bb931da31e59', 1, 'Différer mon départ si possible')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('6634105e-6286-5196-862e-bb931da31e59', '18e21b1c-3082-56cf-b16c-bc4b30125356');
delete from public.question_competences where question_id = '6634105e-6286-5196-862e-bb931da31e59';
insert into public.question_competences (question_id, competence_id) values ('6634105e-6286-5196-862e-bb931da31e59', '3647f5af-2b62-567f-a0e2-281cc052752d');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('24b9c9bd-290b-5a48-a2a1-346d7115a63c', 'rv-049', 'Visibilité et éclairage', 'Quand j’utilise mes feux de route, je peux allumer en même temps mes feux de croisement :', 'Lorsqu’il est fait usage des feux de route, les feux de croisement peuvent être utilisés simultanément.', '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '24b9c9bd-290b-5a48-a2a1-346d7115a63c';
delete from public.question_choices where question_id = '24b9c9bd-290b-5a48-a2a1-346d7115a63c' and id not in ('ef9caaf1-8767-5886-ad68-224f0c76c61d', '8b3d6a6d-d73e-5452-8150-50044e89ca7d');
insert into public.question_choices (id, question_id, position, label) values ('ef9caaf1-8767-5886-ad68-224f0c76c61d', '24b9c9bd-290b-5a48-a2a1-346d7115a63c', 0, 'Oui')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('8b3d6a6d-d73e-5452-8150-50044e89ca7d', '24b9c9bd-290b-5a48-a2a1-346d7115a63c', 1, 'Non')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('24b9c9bd-290b-5a48-a2a1-346d7115a63c', 'ef9caaf1-8767-5886-ad68-224f0c76c61d');
delete from public.question_competences where question_id = '24b9c9bd-290b-5a48-a2a1-346d7115a63c';
insert into public.question_competences (question_id, competence_id) values ('24b9c9bd-290b-5a48-a2a1-346d7115a63c', '6dbd753d-1595-5e3e-817c-9cdb33b47aec');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('07c41bd6-d531-5969-b5d4-9ed3f4a2d127', 'rv-050', 'Visibilité et éclairage', 'En agglomération, sur une route suffisamment éclairée, puis-je rouler en feux de route ?', 'En agglomération sur une route suffisamment éclairée, les feux de route sont exclus.', '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '07c41bd6-d531-5969-b5d4-9ed3f4a2d127';
delete from public.question_choices where question_id = '07c41bd6-d531-5969-b5d4-9ed3f4a2d127' and id not in ('dea5bcb1-6f2f-5b7a-ad52-701f25329b52', 'bdd3b569-085c-5145-b692-034ae514adc4');
insert into public.question_choices (id, question_id, position, label) values ('dea5bcb1-6f2f-5b7a-ad52-701f25329b52', '07c41bd6-d531-5969-b5d4-9ed3f4a2d127', 0, 'Oui, si personne n’arrive en face')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('bdd3b569-085c-5145-b692-034ae514adc4', '07c41bd6-d531-5969-b5d4-9ed3f4a2d127', 1, 'Non')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('07c41bd6-d531-5969-b5d4-9ed3f4a2d127', 'bdd3b569-085c-5145-b692-034ae514adc4');
delete from public.question_competences where question_id = '07c41bd6-d531-5969-b5d4-9ed3f4a2d127';
insert into public.question_competences (question_id, competence_id) values ('07c41bd6-d531-5969-b5d4-9ed3f4a2d127', '6dbd753d-1595-5e3e-817c-9cdb33b47aec');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('6ad4c25a-8bd9-50b2-ac5d-602687026ac8', 'rv-051', 'Visibilité et éclairage', 'La nuit, une voiture arrive en face. Je passe des feux de route aux feux de croisement :', 'Le passage des feux de route aux feux de croisement doit se faire suffisamment à l’avance pour ne pas gêner les autres usagers.', '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '6ad4c25a-8bd9-50b2-ac5d-602687026ac8';
delete from public.question_choices where question_id = '6ad4c25a-8bd9-50b2-ac5d-602687026ac8' and id not in ('d21b7faa-9502-5995-8bf5-036774670fcd', '8197893e-217a-526c-9982-58f2b3d7b0ea');
insert into public.question_choices (id, question_id, position, label) values ('d21b7faa-9502-5995-8bf5-036774670fcd', '6ad4c25a-8bd9-50b2-ac5d-602687026ac8', 0, 'Suffisamment à l’avance pour ne pas la gêner')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('8197893e-217a-526c-9982-58f2b3d7b0ea', '6ad4c25a-8bd9-50b2-ac5d-602687026ac8', 1, 'Au dernier moment, à sa hauteur')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('6ad4c25a-8bd9-50b2-ac5d-602687026ac8', 'd21b7faa-9502-5995-8bf5-036774670fcd');
delete from public.question_competences where question_id = '6ad4c25a-8bd9-50b2-ac5d-602687026ac8';
insert into public.question_competences (question_id, competence_id) values ('6ad4c25a-8bd9-50b2-ac5d-602687026ac8', '6dbd753d-1595-5e3e-817c-9cdb33b47aec');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('4fd7a69f-4a0e-5aa3-99bd-cc1891391ea0', 'rv-052', 'Usagers et partage de la rue', 'Dans une aire piétonne, les piétons sont prioritaires sur tous les véhicules, sauf :', 'Dans une aire piétonne, les piétons sont prioritaires sur tous les véhicules, sauf les tramways.', '[{"title":"Le code de la rue","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/le-code-de-la-rue","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '4fd7a69f-4a0e-5aa3-99bd-cc1891391ea0';
delete from public.question_choices where question_id = '4fd7a69f-4a0e-5aa3-99bd-cc1891391ea0' and id not in ('9d4cd740-6c4b-57ad-89e6-30ad96575ecf', '6b8be2aa-57eb-5376-8393-ee373897b62f', '526710d5-d7ac-5f15-b436-4e2ed225052d');
insert into public.question_choices (id, question_id, position, label) values ('9d4cd740-6c4b-57ad-89e6-30ad96575ecf', '4fd7a69f-4a0e-5aa3-99bd-cc1891391ea0', 0, 'Les vélos')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('6b8be2aa-57eb-5376-8393-ee373897b62f', '4fd7a69f-4a0e-5aa3-99bd-cc1891391ea0', 1, 'Les tramways')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('526710d5-d7ac-5f15-b436-4e2ed225052d', '4fd7a69f-4a0e-5aa3-99bd-cc1891391ea0', 2, 'Les taxis')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('4fd7a69f-4a0e-5aa3-99bd-cc1891391ea0', '6b8be2aa-57eb-5376-8393-ee373897b62f');
delete from public.question_competences where question_id = '4fd7a69f-4a0e-5aa3-99bd-cc1891391ea0';
insert into public.question_competences (question_id, competence_id) values ('4fd7a69f-4a0e-5aa3-99bd-cc1891391ea0', '22ccf1ae-d20c-5540-84d9-7af8f655864b');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('1fb6c484-70a8-572d-8daa-72020b6d23ec', 'rv-053', 'Usagers et partage de la rue', 'Dans une zone 30, la vitesse des véhicules motorisés est limitée à :', 'En zone 30, la vitesse des véhicules motorisés est limitée à 30 km/h.', '[{"title":"Le code de la rue","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/le-code-de-la-rue","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '1fb6c484-70a8-572d-8daa-72020b6d23ec';
delete from public.question_choices where question_id = '1fb6c484-70a8-572d-8daa-72020b6d23ec' and id not in ('a6cd76f1-9513-514d-8987-f04c601e1afc', '0bf000d8-a2b0-5bc0-9758-dbbf2ee1f692');
insert into public.question_choices (id, question_id, position, label) values ('a6cd76f1-9513-514d-8987-f04c601e1afc', '1fb6c484-70a8-572d-8daa-72020b6d23ec', 0, '50 km/h')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('0bf000d8-a2b0-5bc0-9758-dbbf2ee1f692', '1fb6c484-70a8-572d-8daa-72020b6d23ec', 1, '30 km/h')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('1fb6c484-70a8-572d-8daa-72020b6d23ec', '0bf000d8-a2b0-5bc0-9758-dbbf2ee1f692');
delete from public.question_competences where question_id = '1fb6c484-70a8-572d-8daa-72020b6d23ec';
insert into public.question_competences (question_id, competence_id) values ('1fb6c484-70a8-572d-8daa-72020b6d23ec', '22ccf1ae-d20c-5540-84d9-7af8f655864b');
insert into public.question_competences (question_id, competence_id) values ('1fb6c484-70a8-572d-8daa-72020b6d23ec', 'a338089b-b643-5a4b-aa5f-17931e569ec7');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('462f53f6-9c55-55d2-9c88-74fd68fca184', 'rv-054', 'Usagers et partage de la rue', 'Dans une zone de rencontre, les piétons peuvent se déplacer :', 'En zone de rencontre, les piétons sont prioritaires (sauf sur les tramways) et peuvent se déplacer sur toute la largeur de la voirie.', '[{"title":"Le code de la rue","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/le-code-de-la-rue","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '462f53f6-9c55-55d2-9c88-74fd68fca184';
delete from public.question_choices where question_id = '462f53f6-9c55-55d2-9c88-74fd68fca184' and id not in ('0b85d044-f731-59c4-9ddd-1d3fae20848d', '18d342bf-8302-5fa0-98e7-a83e033c367c');
insert into public.question_choices (id, question_id, position, label) values ('0b85d044-f731-59c4-9ddd-1d3fae20848d', '462f53f6-9c55-55d2-9c88-74fd68fca184', 0, 'Sur toute la largeur de la voirie')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('18d342bf-8302-5fa0-98e7-a83e033c367c', '462f53f6-9c55-55d2-9c88-74fd68fca184', 1, 'Seulement sur les trottoirs')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('462f53f6-9c55-55d2-9c88-74fd68fca184', '0b85d044-f731-59c4-9ddd-1d3fae20848d');
delete from public.question_competences where question_id = '462f53f6-9c55-55d2-9c88-74fd68fca184';
insert into public.question_competences (question_id, competence_id) values ('462f53f6-9c55-55d2-9c88-74fd68fca184', '22ccf1ae-d20c-5540-84d9-7af8f655864b');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('0b3801bf-8e7b-55f5-b361-4cbdffb4e449', 'rv-055', 'Usagers et partage de la rue', 'Dans une zone 30 ou une zone de rencontre, je peux croiser des cyclistes qui roulent en sens inverse dans une rue à sens unique. C’est :', 'En zone 30 et en zone de rencontre, le double sens de circulation est quasi généralisé pour les cyclistes.', '[{"title":"Le code de la rue","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/le-code-de-la-rue","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '0b3801bf-8e7b-55f5-b361-4cbdffb4e449';
delete from public.question_choices where question_id = '0b3801bf-8e7b-55f5-b361-4cbdffb4e449' and id not in ('e4af8b9d-3b84-53ce-8e38-767252bd711c', 'abccd2e3-9fe6-5d56-8e12-1b667eb30472');
insert into public.question_choices (id, question_id, position, label) values ('e4af8b9d-3b84-53ce-8e38-767252bd711c', '0b3801bf-8e7b-55f5-b361-4cbdffb4e449', 0, 'Toujours interdit')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('abccd2e3-9fe6-5d56-8e12-1b667eb30472', '0b3801bf-8e7b-55f5-b361-4cbdffb4e449', 1, 'Fréquent : le double sens cyclable y est quasi généralisé')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('0b3801bf-8e7b-55f5-b361-4cbdffb4e449', 'abccd2e3-9fe6-5d56-8e12-1b667eb30472');
delete from public.question_competences where question_id = '0b3801bf-8e7b-55f5-b361-4cbdffb4e449';
insert into public.question_competences (question_id, competence_id) values ('0b3801bf-8e7b-55f5-b361-4cbdffb4e449', '22ccf1ae-d20c-5540-84d9-7af8f655864b');
insert into public.question_competences (question_id, competence_id) values ('0b3801bf-8e7b-55f5-b361-4cbdffb4e449', '4d2a0934-e1b1-5172-9c6f-eacb55406515');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('95ada26f-a616-5e8a-b589-a708c03343a9', 'rv-056', 'Usagers et partage de la rue', 'Dans une zone de rencontre, un piéton traverse la chaussée hors passage piéton, devant moi. Il est prioritaire :', 'En zone de rencontre, les piétons ont la priorité sur tous les véhicules, sauf les tramways, sur toute la largeur de la voirie.', '[{"title":"Le code de la rue","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/le-code-de-la-rue","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '95ada26f-a616-5e8a-b589-a708c03343a9';
delete from public.question_choices where question_id = '95ada26f-a616-5e8a-b589-a708c03343a9' and id not in ('7804e254-6552-55c8-82da-bce1fe5701bb', 'b3a46711-1870-50dc-8607-41cdcd037867');
insert into public.question_choices (id, question_id, position, label) values ('7804e254-6552-55c8-82da-bce1fe5701bb', '95ada26f-a616-5e8a-b589-a708c03343a9', 0, 'Non, seulement sur un passage piéton')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('b3a46711-1870-50dc-8607-41cdcd037867', '95ada26f-a616-5e8a-b589-a708c03343a9', 1, 'Oui')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('95ada26f-a616-5e8a-b589-a708c03343a9', 'b3a46711-1870-50dc-8607-41cdcd037867');
delete from public.question_competences where question_id = '95ada26f-a616-5e8a-b589-a708c03343a9';
insert into public.question_competences (question_id, competence_id) values ('95ada26f-a616-5e8a-b589-a708c03343a9', '22ccf1ae-d20c-5540-84d9-7af8f655864b');
insert into public.question_competences (question_id, competence_id) values ('95ada26f-a616-5e8a-b589-a708c03343a9', '4d2a0934-e1b1-5172-9c6f-eacb55406515');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('d5879ea6-6617-5e18-b0dc-d18582effd3c', 'rv-057', 'Croisement et dépassement', 'Sur une route de montagne, deux véhicules ne peuvent pas se croiser. Celui qui doit s’arrêter le premier est :', 'Sur les routes de montagne et à forte pente, le véhicule descendant doit s’arrêter à temps le premier.', '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'd5879ea6-6617-5e18-b0dc-d18582effd3c';
delete from public.question_choices where question_id = 'd5879ea6-6617-5e18-b0dc-d18582effd3c' and id not in ('7e9a0781-b39a-56db-84c3-2aae115d6a8e', '67ef1e06-7926-56cd-8c3b-49b3cda7f770');
insert into public.question_choices (id, question_id, position, label) values ('7e9a0781-b39a-56db-84c3-2aae115d6a8e', 'd5879ea6-6617-5e18-b0dc-d18582effd3c', 0, 'Le véhicule qui monte')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('67ef1e06-7926-56cd-8c3b-49b3cda7f770', 'd5879ea6-6617-5e18-b0dc-d18582effd3c', 1, 'Le véhicule qui descend')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('d5879ea6-6617-5e18-b0dc-d18582effd3c', '67ef1e06-7926-56cd-8c3b-49b3cda7f770');
delete from public.question_competences where question_id = 'd5879ea6-6617-5e18-b0dc-d18582effd3c';
insert into public.question_competences (question_id, competence_id) values ('d5879ea6-6617-5e18-b0dc-d18582effd3c', '0fb3c8fd-0a66-5281-9a1b-fae51c48915e');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('20c7ea02-920b-561a-8391-7128d6e19841', 'rv-058', 'Croisement et dépassement', 'Un obstacle se trouve sur ma voie et une voiture arrive en face. Je :', 'Le véhicule qui a l’obstacle sur sa voie doit ralentir ou s’arrêter pour laisser passer ceux qui viennent en sens inverse.', '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '20c7ea02-920b-561a-8391-7128d6e19841';
delete from public.question_choices where question_id = '20c7ea02-920b-561a-8391-7128d6e19841' and id not in ('b6ee19d8-d2a7-5412-bf29-c8ef8c7f2484', 'b3b082f1-0602-528d-a890-068a0d08dd89');
insert into public.question_choices (id, question_id, position, label) values ('b6ee19d8-d2a7-5412-bf29-c8ef8c7f2484', '20c7ea02-920b-561a-8391-7128d6e19841', 0, 'Ralentis ou m’arrête pour la laisser passer')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('b3b082f1-0602-528d-a890-068a0d08dd89', '20c7ea02-920b-561a-8391-7128d6e19841', 1, 'Passe : c’est à elle de s’écarter')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('20c7ea02-920b-561a-8391-7128d6e19841', 'b6ee19d8-d2a7-5412-bf29-c8ef8c7f2484');
delete from public.question_competences where question_id = '20c7ea02-920b-561a-8391-7128d6e19841';
insert into public.question_competences (question_id, competence_id) values ('20c7ea02-920b-561a-8391-7128d6e19841', '0fb3c8fd-0a66-5281-9a1b-fae51c48915e');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('f0cff911-9e41-5519-ac59-d3a818dfc2bc', 'rv-059', 'Croisement et dépassement', 'Sur une route étroite, le croisement est impossible et l’un des deux doit reculer : ma voiture ou un poids lourd. Recule :', 'Quand il faut reculer, un véhicule léger recule devant un véhicule lourd.', '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'f0cff911-9e41-5519-ac59-d3a818dfc2bc';
delete from public.question_choices where question_id = 'f0cff911-9e41-5519-ac59-d3a818dfc2bc' and id not in ('51bf9956-3708-5673-954d-5f5c5bca55e8', '1a077fd3-6cb9-53cd-9029-e00b8174c4aa');
insert into public.question_choices (id, question_id, position, label) values ('51bf9956-3708-5673-954d-5f5c5bca55e8', 'f0cff911-9e41-5519-ac59-d3a818dfc2bc', 0, 'Ma voiture')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('1a077fd3-6cb9-53cd-9029-e00b8174c4aa', 'f0cff911-9e41-5519-ac59-d3a818dfc2bc', 1, 'Le poids lourd')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('f0cff911-9e41-5519-ac59-d3a818dfc2bc', '51bf9956-3708-5673-954d-5f5c5bca55e8');
delete from public.question_competences where question_id = 'f0cff911-9e41-5519-ac59-d3a818dfc2bc';
insert into public.question_competences (question_id, competence_id) values ('f0cff911-9e41-5519-ac59-d3a818dfc2bc', '0fb3c8fd-0a66-5281-9a1b-fae51c48915e');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('7d607d6f-8707-535a-9b49-ac83295b542a', 'rv-060', 'Croisement et dépassement', 'Je viens de dépasser une voiture. Je me rabats :', 'Après un dépassement par la gauche, on revient sur sa droite sans provoquer le ralentissement du véhicule dépassé.', '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '7d607d6f-8707-535a-9b49-ac83295b542a';
delete from public.question_choices where question_id = '7d607d6f-8707-535a-9b49-ac83295b542a' and id not in ('c28cfdcd-c634-5297-a6f9-7aa7cf0a66a9', '266e59f2-b3ec-5b2e-ab8b-e9fe4a7dcb1e');
insert into public.question_choices (id, question_id, position, label) values ('c28cfdcd-c634-5297-a6f9-7aa7cf0a66a9', '7d607d6f-8707-535a-9b49-ac83295b542a', 0, 'Sans l’obliger à ralentir')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('266e59f2-b3ec-5b2e-ab8b-e9fe4a7dcb1e', '7d607d6f-8707-535a-9b49-ac83295b542a', 1, 'Juste devant elle, même si elle doit freiner')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('7d607d6f-8707-535a-9b49-ac83295b542a', 'c28cfdcd-c634-5297-a6f9-7aa7cf0a66a9');
delete from public.question_competences where question_id = '7d607d6f-8707-535a-9b49-ac83295b542a';
insert into public.question_competences (question_id, competence_id) values ('7d607d6f-8707-535a-9b49-ac83295b542a', '826bd571-a74b-5e7b-ba38-3d612ce34756');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('30cb633d-b44c-5bf1-9321-6ea7fddf4305', 'rv-061', 'Croisement et dépassement', 'J’arrive à une traversée de voie ferrée sans barrières ni demi-barrières. Je peux y dépasser :', 'Tout dépassement est interdit aux traversées de voies ferrées qui ne sont pas munies de barrières ou de demi-barrières.', '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '30cb633d-b44c-5bf1-9321-6ea7fddf4305';
delete from public.question_choices where question_id = '30cb633d-b44c-5bf1-9321-6ea7fddf4305' and id not in ('a60b183c-98ea-59c2-be3f-3b29829eec08', '4c793c82-f2ff-5f1e-ab43-f05fe2d91e9a');
insert into public.question_choices (id, question_id, position, label) values ('a60b183c-98ea-59c2-be3f-3b29829eec08', '30cb633d-b44c-5bf1-9321-6ea7fddf4305', 0, 'Non, c’est interdit')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('4c793c82-f2ff-5f1e-ab43-f05fe2d91e9a', '30cb633d-b44c-5bf1-9321-6ea7fddf4305', 1, 'Oui, si aucun train n’est visible')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('30cb633d-b44c-5bf1-9321-6ea7fddf4305', 'a60b183c-98ea-59c2-be3f-3b29829eec08');
delete from public.question_competences where question_id = '30cb633d-b44c-5bf1-9321-6ea7fddf4305';
insert into public.question_competences (question_id, competence_id) values ('30cb633d-b44c-5bf1-9321-6ea7fddf4305', '826bd571-a74b-5e7b-ba38-3d612ce34756');
insert into public.question_competences (question_id, competence_id) values ('30cb633d-b44c-5bf1-9321-6ea7fddf4305', 'a8754ce0-1402-5b0e-b697-869bd4098e21');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('113f67dd-bb00-5969-803f-1dd856e739cb', 'rv-062', 'Croisement et dépassement', 'Sur une route à double sens comportant trois voies, pour dépasser, je peux utiliser la voie la plus à gauche :', 'Si la route comporte plus de deux voies, le conducteur qui dépasse ne doit pas utiliser celle qui est le plus à gauche.', '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '113f67dd-bb00-5969-803f-1dd856e739cb';
delete from public.question_choices where question_id = '113f67dd-bb00-5969-803f-1dd856e739cb' and id not in ('0603b889-013c-5e5c-806a-6f59cd9f887b', 'f6be41a7-261f-526b-87b1-31e365b1a80d');
insert into public.question_choices (id, question_id, position, label) values ('0603b889-013c-5e5c-806a-6f59cd9f887b', '113f67dd-bb00-5969-803f-1dd856e739cb', 0, 'Oui, si elle est libre')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('f6be41a7-261f-526b-87b1-31e365b1a80d', '113f67dd-bb00-5969-803f-1dd856e739cb', 1, 'Non')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('113f67dd-bb00-5969-803f-1dd856e739cb', 'f6be41a7-261f-526b-87b1-31e365b1a80d');
delete from public.question_competences where question_id = '113f67dd-bb00-5969-803f-1dd856e739cb';
insert into public.question_competences (question_id, competence_id) values ('113f67dd-bb00-5969-803f-1dd856e739cb', '826bd571-a74b-5e7b-ba38-3d612ce34756');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('d48177cb-a21e-57e0-b07a-2fc33c50d64f', 'rv-063', 'Croisement et dépassement', 'En agglomération, je croise un autobus et le croisement est difficile. Je :', 'En agglomération, on s’arrête si le croisement est difficile pour laisser passer les véhicules de transport en commun.', '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]},{"title":"Intersections et priorités","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/intersections-et-priorites","consulted_at":"2026-10-22","cited_articles":["R415-1","R415-2","R415-5","R415-12","R311-1","R433-17"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'd48177cb-a21e-57e0-b07a-2fc33c50d64f';
delete from public.question_choices where question_id = 'd48177cb-a21e-57e0-b07a-2fc33c50d64f' and id not in ('a03a3e75-8751-5679-b9c7-c5cead4b52b9', '8f214bcd-5bed-5d44-afb3-4a28d634af30');
insert into public.question_choices (id, question_id, position, label) values ('a03a3e75-8751-5679-b9c7-c5cead4b52b9', 'd48177cb-a21e-57e0-b07a-2fc33c50d64f', 0, 'M’arrête pour le laisser passer')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('8f214bcd-5bed-5d44-afb3-4a28d634af30', 'd48177cb-a21e-57e0-b07a-2fc33c50d64f', 1, 'Force le passage, je suis sur ma voie')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('d48177cb-a21e-57e0-b07a-2fc33c50d64f', 'a03a3e75-8751-5679-b9c7-c5cead4b52b9');
delete from public.question_competences where question_id = 'd48177cb-a21e-57e0-b07a-2fc33c50d64f';
insert into public.question_competences (question_id, competence_id) values ('d48177cb-a21e-57e0-b07a-2fc33c50d64f', '0fb3c8fd-0a66-5281-9a1b-fae51c48915e');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('b005bac4-16e3-519b-b2d1-2c6b99b50b7b', 'rv-064', 'Croisement et dépassement', 'Je croise une voiture qui a un chargement très large et la route est trop étroite pour deux. Les conducteurs :', 'Si la largeur ne permet pas le croisement à cause de la taille ou du chargement de l’un des véhicules, les conducteurs ralentissent et, si besoin, s’arrêtent ou se garent.', '[{"title":"Croisement et dépassement","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/croisement-et-depassement","consulted_at":"2026-10-22","cited_articles":["R414-1 à R414-3","R414-4 à R414-17","R414-6","R414-9","R414-12","R416-6"]}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'b005bac4-16e3-519b-b2d1-2c6b99b50b7b';
delete from public.question_choices where question_id = 'b005bac4-16e3-519b-b2d1-2c6b99b50b7b' and id not in ('cb2627cc-9e3c-519f-9244-ba57ea03bdf5', '6c55aa87-66e8-573e-82e0-35f7ef493b3d');
insert into public.question_choices (id, question_id, position, label) values ('cb2627cc-9e3c-519f-9244-ba57ea03bdf5', 'b005bac4-16e3-519b-b2d1-2c6b99b50b7b', 0, 'Réduisent leur vitesse et, si besoin, s’arrêtent ou se garent')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('6c55aa87-66e8-573e-82e0-35f7ef493b3d', 'b005bac4-16e3-519b-b2d1-2c6b99b50b7b', 1, 'Continuent : le plus large doit reculer')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('b005bac4-16e3-519b-b2d1-2c6b99b50b7b', 'cb2627cc-9e3c-519f-9244-ba57ea03bdf5');
delete from public.question_competences where question_id = 'b005bac4-16e3-519b-b2d1-2c6b99b50b7b';
insert into public.question_competences (question_id, competence_id) values ('b005bac4-16e3-519b-b2d1-2c6b99b50b7b', '0fb3c8fd-0a66-5281-9a1b-fae51c48915e');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('be176f0a-3fd7-58bd-9812-fa2f489637d4', 'rv-065', 'Autoroute', 'Sur autoroute, je peux circuler ou m’arrêter sur la bande centrale qui sépare les chaussées :', 'Il est interdit de circuler, de s’arrêter ou de stationner sur la bande centrale séparative des chaussées (amende de 4e classe).', '[{"title":"Autoroute","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/autoroute","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'be176f0a-3fd7-58bd-9812-fa2f489637d4';
delete from public.question_choices where question_id = 'be176f0a-3fd7-58bd-9812-fa2f489637d4' and id not in ('6cd17fea-cce9-5f5e-9e78-063c35506fc7', 'c237329c-f100-531b-a46a-e8667c2947e1');
insert into public.question_choices (id, question_id, position, label) values ('6cd17fea-cce9-5f5e-9e78-063c35506fc7', 'be176f0a-3fd7-58bd-9812-fa2f489637d4', 0, 'Oui, en cas de bouchon')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('c237329c-f100-531b-a46a-e8667c2947e1', 'be176f0a-3fd7-58bd-9812-fa2f489637d4', 1, 'Non, jamais')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('be176f0a-3fd7-58bd-9812-fa2f489637d4', 'c237329c-f100-531b-a46a-e8667c2947e1');
delete from public.question_competences where question_id = 'be176f0a-3fd7-58bd-9812-fa2f489637d4';
insert into public.question_competences (question_id, competence_id) values ('be176f0a-3fd7-58bd-9812-fa2f489637d4', '4a75d17c-eda5-5f78-8dfd-d1fca5ba8560');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('fb100aa3-5e1b-565a-9635-73c88766dd91', 'rv-066', 'Autoroute', 'Faire demi-tour sur autoroute entraîne de plein droit un retrait de :', 'Le demi-tour et la marche arrière sur autoroute sont punis d’une amende de 4e classe et du retrait de plein droit de 4 points.', '[{"title":"Autoroute","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/autoroute","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = 'fb100aa3-5e1b-565a-9635-73c88766dd91';
delete from public.question_choices where question_id = 'fb100aa3-5e1b-565a-9635-73c88766dd91' and id not in ('32e0a21e-4a91-5378-b2b0-774de0c5978d', '083a2153-a480-5811-a383-40ec31940293', '4cac3613-3c73-5be1-95c0-3d3bdd0cce6a');
insert into public.question_choices (id, question_id, position, label) values ('32e0a21e-4a91-5378-b2b0-774de0c5978d', 'fb100aa3-5e1b-565a-9635-73c88766dd91', 0, '4 points')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('083a2153-a480-5811-a383-40ec31940293', 'fb100aa3-5e1b-565a-9635-73c88766dd91', 1, '1 point')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('4cac3613-3c73-5be1-95c0-3d3bdd0cce6a', 'fb100aa3-5e1b-565a-9635-73c88766dd91', 2, 'Aucun point')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('fb100aa3-5e1b-565a-9635-73c88766dd91', '32e0a21e-4a91-5378-b2b0-774de0c5978d');
delete from public.question_competences where question_id = 'fb100aa3-5e1b-565a-9635-73c88766dd91';
insert into public.question_competences (question_id, competence_id) values ('fb100aa3-5e1b-565a-9635-73c88766dd91', '4a75d17c-eda5-5f78-8dfd-d1fca5ba8560');
insert into public.questions (id, external_ref, topic, prompt, explanation, sources, status, reviewer_name, reviewed_at, lesson_id, is_demo, exam_eligible)
values ('7b5fde16-f019-570f-9a20-c5e9a3877acf', 'rv-067', 'Autoroute', 'Je rejoins l’autoroute par une bretelle de raccordement. Les véhicules qui circulent sur l’autoroute :', 'Le conducteur qui rejoint l’autoroute par une bretelle doit céder le passage aux véhicules qui y circulent.', '[{"title":"Autoroute","publisher":"Sécurité routière (securite-routiere.gouv.fr)","url":"https://www.securite-routiere.gouv.fr/reglementation-liee-la-route/autoroute","consulted_at":"2026-10-22"}]'::jsonb, 'in_review'::public.content_status, null, null, null, false, true)
on conflict (id) do update set external_ref = excluded.external_ref, topic = excluded.topic, prompt = excluded.prompt,
  explanation = excluded.explanation, sources = excluded.sources, status = excluded.status,
  reviewer_name = excluded.reviewer_name, reviewed_at = excluded.reviewed_at, lesson_id = excluded.lesson_id,
  is_demo = excluded.is_demo, exam_eligible = excluded.exam_eligible;
delete from public.question_answers where question_id = '7b5fde16-f019-570f-9a20-c5e9a3877acf';
delete from public.question_choices where question_id = '7b5fde16-f019-570f-9a20-c5e9a3877acf' and id not in ('e6865c25-4bc0-54c7-a722-e66064326f10', '23600cff-53f2-5e5d-99d5-5e3a16dffbdb');
insert into public.question_choices (id, question_id, position, label) values ('e6865c25-4bc0-54c7-a722-e66064326f10', '7b5fde16-f019-570f-9a20-c5e9a3877acf', 0, 'Doivent me laisser la place')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_choices (id, question_id, position, label) values ('23600cff-53f2-5e5d-99d5-5e3a16dffbdb', '7b5fde16-f019-570f-9a20-c5e9a3877acf', 1, 'Sont prioritaires : je leur cède le passage')
on conflict (id) do update set position = excluded.position, label = excluded.label;
insert into public.question_answers (question_id, choice_id) values ('7b5fde16-f019-570f-9a20-c5e9a3877acf', '23600cff-53f2-5e5d-99d5-5e3a16dffbdb');
delete from public.question_competences where question_id = '7b5fde16-f019-570f-9a20-c5e9a3877acf';
insert into public.question_competences (question_id, competence_id) values ('7b5fde16-f019-570f-9a20-c5e9a3877acf', '4a75d17c-eda5-5f78-8dfd-d1fca5ba8560');

commit;
