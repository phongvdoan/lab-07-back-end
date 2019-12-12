DROP TABLE location;
CREATE TABLE IF NOT EXISTS
location(
  id SERIAL PRIMARY KEY NOT NULL,
  searchquery VARCHAR(255) NOT NULL,
  formatted_query VARCHAR(255) NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL
  );