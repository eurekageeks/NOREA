-- =====================================================================
--  NŌRÉA – seed data (programs, topics, default website settings)
--  Run after schema.sql:  mysql -u root -p norea_learning < database/seed.sql
--  NOTE: The first admin account is created with `npm run db:admin`
--        (never ship hard-coded passwords in SQL).
--  Duration, fees, certification and trainer details are intentionally
--  left NULL — configure them from Admin ▸ Programs.
-- =====================================================================

USE norea_learning;

INSERT INTO programs
  (title, slug, short_description, description, image, learning_outcomes, highlights, learning_modes, display_order, status)
VALUES
(
  'Spoken English & Communication',
  'spoken-english-communication',
  'Develop effective communication skills and speak English with confidence.',
  'Develop effective communication skills and speak English with confidence. This program takes you from foundational English to fluent, natural conversation — building the grammar, vocabulary and presence you need to express yourself clearly in everyday, academic and professional situations.',
  '/images/program-spoken-english.jpg',
  JSON_ARRAY(
    'Speak English fluently and confidently in daily and professional settings',
    'Use correct grammar and a richer vocabulary with ease',
    'Deliver clear, structured presentations and speeches',
    'Approach interviews with poise and well-framed answers'
  ),
  JSON_ARRAY(
    'Practical, conversation-led sessions',
    'Guided public-speaking practice',
    'Personal feedback on pronunciation and fluency',
    'Mock interviews and real-life role plays'
  ),
  'online,offline,hybrid',
  1,
  'active'
),
(
  'Personality Development',
  'personality-development',
  'Build confidence, improve personality, and develop professional and interpersonal skills.',
  'Build confidence, improve personality, and develop professional and interpersonal skills. Through interactive activities and reflective practice, you will discover your strengths, refine how you present yourself and learn to lead, collaborate and communicate with impact.',
  '/images/program-personality-development.jpg',
  JSON_ARRAY(
    'Carry yourself with genuine self-confidence',
    'Understand and use positive body language',
    'Lead discussions and teams with clarity',
    'Present ideas persuasively to any audience'
  ),
  JSON_ARRAY(
    'Confidence-building activities',
    'Interactive group workshops',
    'Individual attention and guidance',
    'Real-world presentation practice'
  ),
  'online,offline,hybrid',
  2,
  'active'
),
(
  'Parenting & Child Development',
  'parenting-child-development',
  'Understand children better and develop positive parenting approaches.',
  'Understand children better and develop positive parenting approaches. This program helps parents build stronger, calmer and more connected relationships with their children — grounded in an understanding of child psychology, emotional intelligence and healthy everyday habits.',
  '/images/program-parenting.jpg',
  JSON_ARRAY(
    'Understand the emotional and developmental needs of children',
    'Communicate with children in a positive, respectful way',
    'Nurture emotional intelligence at home',
    'Build healthy, consistent parenting routines'
  ),
  JSON_ARRAY(
    'Practical, everyday parenting strategies',
    'Supportive, judgement-free discussions',
    'Real-life scenarios and reflections',
    'Personal attention for every parent'
  ),
  'online,offline,hybrid',
  3,
  'active'
);

INSERT INTO program_topics (program_id, topic_name, display_order)
SELECT p.id, t.topic, t.ord FROM programs p
JOIN (
  SELECT 'spoken-english-communication' AS slug, 'Basic to Advanced English' AS topic, 1 AS ord UNION ALL
  SELECT 'spoken-english-communication', 'Fluency & Conversation', 2 UNION ALL
  SELECT 'spoken-english-communication', 'Grammar & Vocabulary', 3 UNION ALL
  SELECT 'spoken-english-communication', 'Public Speaking', 4 UNION ALL
  SELECT 'spoken-english-communication', 'Interview Skills', 5 UNION ALL
  SELECT 'personality-development', 'Confidence Building', 1 UNION ALL
  SELECT 'personality-development', 'Personality Enhancement', 2 UNION ALL
  SELECT 'personality-development', 'Body Language', 3 UNION ALL
  SELECT 'personality-development', 'Leadership Skills', 4 UNION ALL
  SELECT 'personality-development', 'Presentation Skills', 5 UNION ALL
  SELECT 'parenting-child-development', 'Positive Parenting', 1 UNION ALL
  SELECT 'parenting-child-development', 'Understanding Child Psychology', 2 UNION ALL
  SELECT 'parenting-child-development', 'Effective Parent-Child Communication', 3 UNION ALL
  SELECT 'parenting-child-development', 'Emotional Intelligence', 4 UNION ALL
  SELECT 'parenting-child-development', 'Healthy Parenting Habits', 5
) t ON t.slug = p.slug;

-- Default website settings. Contact details are intentionally blank —
-- set the real values from Admin ▸ Settings.
INSERT INTO website_settings (setting_key, setting_value) VALUES
  ('institute_name',      'NŌRÉA'),
  ('institute_category',  'Learning & Development'),
  ('logo',                ''),
  ('tagline',             'Learn • Express • Grow'),
  ('hero_heading',        'Building Confidence. Nurturing Potential.'),
  ('hero_subheading',     'Discover a better version of yourself with NŌRÉA.'),
  ('hero_image',          '/images/hero.jpg'),
  ('about_intro',         'NŌRÉA is dedicated to helping individuals develop communication skills, confidence, personality, and positive relationships.'),
  ('mission',             'To empower every learner with the communication skills, confidence and emotional awareness they need to express themselves fully and build meaningful relationships.'),
  ('vision',              'To be a trusted name in learning and development — where individuals and families discover their potential and grow into their most confident selves.'),
  ('contact_email',       ''),
  ('contact_phone',       ''),
  ('contact_address',     ''),
  ('office_hours',        ''),
  ('map_embed_url',       ''),
  ('social_instagram',    ''),
  ('social_facebook',     ''),
  ('social_linkedin',     ''),
  ('social_youtube',      ''),
  ('social_x',            ''),
  ('whatsapp_number',     ''),
  ('footer_about',        'A learning and development institute focused on communication, personality development, confidence building and parenting education.'),
  ('footer_text',         'All rights reserved.'),
  ('seo_description',     'NŌRÉA – Learning & Development. Spoken English & communication, personality development and parenting programs. Learn • Express • Grow.');
