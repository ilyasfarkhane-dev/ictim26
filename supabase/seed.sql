-- Run after schema.sql to populate initial ICTIM content.
-- Safe to re-run: clears and re-inserts list tables.

truncate public.speakers, public.topics, public.important_dates,
  public.workshops, public.sponsors, public.quick_links cascade;

insert into public.site_settings (key, value) values
  ('conference', '{"name":"ICTIM''26","fullName":"The 8th International Conference on Information Technology and Modeling","edition":8,"tagline":"Innovation and Trends in Computer Science and Modeling: Bridging Theory, Practice, and the Power of AI","description":"The 8th edition of the International Conference on Information Technology and Modeling (ICTIM''26), organized by the TIM Laboratory at the Faculty of Sciences Ben M''Sik.","location":"Faculty of Sciences Ben M''Sik, Hassan II University","city":"Casablanca, Morocco","venue":"Faculty of Sciences Ben M''Sik | Casablanca - Morocco","dates":"November 26 – 27, 2026","registrationUrl":"https://www.conference-tim.com/","websiteUrl":"https://www.conference-tim.com/","organizer":"TIM Laboratory — LTIM","contact":{"emails":["tim24fsbm@gmail.com","omar.zahour@univh2c.ma"],"phone":"+212 660-082091","address":"Faculty of Sciences Ben M''Sik, University Hassan II, Casablanca, Morocco"}}'::jsonb),
  ('call_for_papers', '{"intro":"ICTIM''26 invites original and unpublished research contributions in Information Technology and Modeling.","publication":["Peer-reviewed proceedings in Springer''s CCIS series","Extended papers submitted to Scopus-indexed journals","Springer LNCS format compliance required"],"requirements":["A4 IEEE template (Word/LaTeX guidelines)","English language for all submissions","Original, unpublished research contributions","Manuscripts must include references"]}'::jsonb),
  ('registration_pricing', '{"plans":[{"id":"in-person","badge":"Best Plan","title":"In-Person","price":600,"currency":"MAD","enabled":true,"features":["Communication Certificate","Certificate of Participation","Conference Materials","Access to Exhibitions","Lunch and Tea/Coffee Breaks","Conference Documents","Briefcase | Proceedings Report","Notebook | Pen","Badge | Brochure | Program"]},{"id":"virtual","badge":"Remote","title":"Virtual","price":350,"currency":"MAD","enabled":true,"features":["Certificate of Participation","Digital Conference Materials","Online session access","Conference documents (PDF)"]}]}'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();

insert into public.speakers (sort_order, name, position, company, bio, image_url) values
  (0, 'Pr. El Habib Benlahmar', 'Professor', 'Faculty of Sciences Ben M''Sik, Hassan II University of Casablanca, Morocco', 'Professor in the Department of Mathematics and Computer Science at the Faculty of Sciences Ben M''Sik, Hassan II University of Casablanca.', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80'),
  (1, 'Pr. Sanaa El Filali', 'Professor', 'Faculty of Sciences Ben M''Sik, Hassan II University of Casablanca, Morocco', 'Professor in the Department of Mathematics and Computer Science at the Faculty of Sciences Ben M''Sik, Hassan II University of Casablanca.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80'),
  (2, 'Pr. Anderson Rocha', 'Full Professor of AI & Digital Forensics', 'Institute of Computing, University of Campinas (Unicamp), Brazil', 'Full Professor of Artificial Intelligence and Digital Forensics at the Institute of Computing, University of Campinas (Unicamp), Brazil.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80'),
  (3, 'Pr. KIKOMBA KAHUNGU Michael', 'Professor', 'ISP-Gombe-Kinshasa, Democratic Republic of the Congo', 'Professor at the Higher Pedagogical Institute of Gombe in the Democratic Republic of Congo.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'),
  (4, 'Pr. Olivier Debauche', 'Researcher', 'University of Liège, Belgium', 'Researcher at the Department of Gembloux Agro-Bio Tech of the University of Liège, Belgium.', 'https://images.unsplash.com/photo-1519081903024-4eacae44bcfe?w=400&q=80'),
  (5, 'Pr. Angel Ruiz Zafra', 'Professor of Computer Engineering', 'University of Granada, Spain', 'Professor of Computer Engineering, Department of Computer Languages and Systems, University of Granada, Spain.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80');

insert into public.topics (sort_order, name) values
  (0, 'Artificial Intelligence'),
  (1, 'Machine Learning & Deep Learning'),
  (2, 'Big Data & Data Mining'),
  (3, 'Intelligent Smart City Systems'),
  (4, 'Ontology & Knowledge Modeling'),
  (5, 'Computer Vision'),
  (6, 'Information System Security'),
  (7, 'Blockchain & Security'),
  (8, 'Cloud Computing'),
  (9, 'Natural Language Processing');

insert into public.quick_links (sort_order, title, description, href, icon) values
  (0, 'Call for Papers', 'Topics, scope, and guidelines for your submission.', '#call-for-papers', 'document'),
  (1, 'Important Dates', 'Paper deadlines, notifications, and conference dates.', '#important-dates', 'calendar'),
  (2, 'Submit Paper', 'Platform, format, and key submission requirements.', '#submission-guidelines', 'submit'),
  (3, 'Committees', 'Organizing, program, and scientific committee members.', '#about', 'users');
