#!/bin/sh
if [ -n "$DATABASE_URL" ]; then
  proto=$(echo "$DATABASE_URL" | cut -d: -f1)
  rest=$(echo "$DATABASE_URL" | sed 's/[^:]*:\/\///')
  userpass=$(echo "$rest" | cut -d@ -f1)
  hostportdb=$(echo "$rest" | cut -d@ -f2)
  export SPRING_DATASOURCE_USERNAME=$(echo "$userpass" | cut -d: -f1)
  export SPRING_DATASOURCE_PASSWORD=$(echo "$userpass" | cut -d: -f2)
  host=$(echo "$hostportdb" | cut -d: -f1)
  portdb=$(echo "$hostportdb" | cut -d: -f2)
  port=$(echo "$portdb" | cut -d/ -f1)
  db=$(echo "$portdb" | cut -d/ -f2 | cut -d? -f1)
  export SPRING_DATASOURCE_URL="jdbc:postgresql://$host:$port/$db"
fi
exec java -jar app.jar
