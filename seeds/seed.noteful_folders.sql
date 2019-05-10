-- psql command: psql -U postgres -d noteful -f ./seeds/seed/noteful_folders.sql

INSERT INTO folders (id, name)  
VALUES
  (1, 'Important'),
  (2, 'Super'),
  (3, 'Spangley'); 

  ALTER SEQUENCE folders RESTART WITH 4; 