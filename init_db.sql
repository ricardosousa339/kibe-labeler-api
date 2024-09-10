DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT
      FROM   pg_catalog.pg_database
      WHERE  datname = 'kibe_db') THEN
      PERFORM dblink_exec('dbname=postgres user=' || current_user, 'CREATE DATABASE kibe_db');
   END IF;
END
$do$;

-- Connect to the kibe_db database and create the pg_trgm extension
\c kibe_db
CREATE EXTENSION IF NOT EXISTS pg_trgm;