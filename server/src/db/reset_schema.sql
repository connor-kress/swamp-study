-- 1. Drop indexes
DROP INDEX IF EXISTS idx_pending_verifications_expires_at;

-- 2. Drop tables (most dependent first)
DROP TABLE IF EXISTS user_groups CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS user_events CASCADE;
DROP TABLE IF EXISTS group_events CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS pending_verifications CASCADE;

-- 3. Drop types (most dependent first)
DROP TYPE IF EXISTS user_group_role CASCADE;
DROP TYPE IF EXISTS group_notification_scope CASCADE;
DROP TYPE IF EXISTS course_term CASCADE;
DROP TYPE IF EXISTS weekday CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
