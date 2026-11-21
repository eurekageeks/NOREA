-- =====================================================================
--  NŌRÉA – LEARNING & DEVELOPMENT
--  MySQL 8+ schema  ·  database: norea_learning
--  Run:  mysql -u root -p < database/schema.sql
-- =====================================================================

CREATE DATABASE IF NOT EXISTS norea_learning
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE norea_learning;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS admin_activity_logs;
DROP TABLE IF EXISTS admissions;
DROP TABLE IF EXISTS student_profiles;
DROP TABLE IF EXISTS enquiries;
DROP TABLE IF EXISTS program_topics;
DROP TABLE IF EXISTS programs;
DROP TABLE IF EXISTS website_settings;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 1. users  (students + admin staff; role-based access)
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name       VARCHAR(120) NOT NULL,
  email           VARCHAR(190) NOT NULL,
  phone           VARCHAR(20)  NULL,
  password_hash   VARCHAR(255) NOT NULL,
  role            ENUM('super_admin','admin','staff','student') NOT NULL DEFAULT 'student',
  status          ENUM('active','inactive') NOT NULL DEFAULT 'active',
  token_version   INT UNSIGNED NOT NULL DEFAULT 0,
  last_login_at   DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role_status (role, status),
  KEY idx_users_created (created_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. programs  (duration / fees / certificate / trainer are admin-configurable)
-- ---------------------------------------------------------------------
CREATE TABLE programs (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title              VARCHAR(160) NOT NULL,
  slug               VARCHAR(180) NOT NULL,
  short_description  VARCHAR(300) NULL,
  description        TEXT NOT NULL,
  image              VARCHAR(255) NULL,
  learning_outcomes  JSON NULL,
  highlights         JSON NULL,
  duration           VARCHAR(100) NULL,
  fees               VARCHAR(100) NULL,
  certification      VARCHAR(255) NULL,
  trainer_info       TEXT NULL,
  learning_modes     VARCHAR(100) NULL,
  display_order      INT NOT NULL DEFAULT 0,
  status             ENUM('active','inactive','draft') NOT NULL DEFAULT 'active',
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_programs_slug (slug),
  KEY idx_programs_status_order (status, display_order)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. program_topics
-- ---------------------------------------------------------------------
CREATE TABLE program_topics (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  program_id     INT UNSIGNED NOT NULL,
  topic_name     VARCHAR(160) NOT NULL,
  display_order  INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_topics_program_order (program_id, display_order),
  CONSTRAINT fk_topics_program FOREIGN KEY (program_id)
    REFERENCES programs (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. enquiries  (admission enquiries + contact messages)
-- ---------------------------------------------------------------------
CREATE TABLE enquiries (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name      VARCHAR(120) NOT NULL,
  email          VARCHAR(190) NOT NULL,
  phone          VARCHAR(20)  NULL,
  program_id     INT UNSIGNED NULL,
  learning_mode  ENUM('online','offline','hybrid') NULL,
  subject        VARCHAR(200) NULL,
  message        TEXT NULL,
  source         ENUM('admission','contact') NOT NULL DEFAULT 'admission',
  status         ENUM('new','contacted','follow_up','converted','closed') NOT NULL DEFAULT 'new',
  admin_notes    TEXT NULL,
  ip_address     VARCHAR(45) NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_enq_status (status),
  KEY idx_enq_program (program_id),
  KEY idx_enq_created (created_at),
  KEY idx_enq_email_program (email, program_id, created_at),
  KEY idx_enq_source (source),
  CONSTRAINT fk_enq_program FOREIGN KEY (program_id)
    REFERENCES programs (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. student_profiles  (1:1 with users)
-- ---------------------------------------------------------------------
CREATE TABLE student_profiles (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id        INT UNSIGNED NOT NULL,
  date_of_birth  DATE NULL,
  address        VARCHAR(500) NULL,
  profile_image  VARCHAR(255) NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_profiles_user (user_id),
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. admissions
-- ---------------------------------------------------------------------
CREATE TABLE admissions (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id         INT UNSIGNED NOT NULL,
  program_id      INT UNSIGNED NOT NULL,
  enquiry_id      INT UNSIGNED NULL,
  admission_date  DATE NULL,
  status          ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  notes           TEXT NULL,
  reviewed_by     INT UNSIGNED NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admission_user_program (user_id, program_id),
  KEY idx_adm_status (status),
  KEY idx_adm_program (program_id),
  KEY idx_adm_created (created_at),
  CONSTRAINT fk_adm_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_adm_program FOREIGN KEY (program_id)
    REFERENCES programs (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_adm_enquiry FOREIGN KEY (enquiry_id)
    REFERENCES enquiries (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_adm_reviewer FOREIGN KEY (reviewed_by)
    REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. admin_activity_logs
-- ---------------------------------------------------------------------
CREATE TABLE admin_activity_logs (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  admin_id     INT UNSIGNED NULL,
  action       VARCHAR(80) NOT NULL,
  description  VARCHAR(500) NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_logs_admin (admin_id),
  KEY idx_logs_created (created_at),
  CONSTRAINT fk_logs_admin FOREIGN KEY (admin_id)
    REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 8. website_settings  (key/value, admin-configurable)
-- ---------------------------------------------------------------------
CREATE TABLE website_settings (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  setting_key    VARCHAR(100) NOT NULL,
  setting_value  TEXT NULL,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_settings_key (setting_key)
) ENGINE=InnoDB;
