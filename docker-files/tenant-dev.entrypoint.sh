#! /bin/bash

cp -r /cache/node_modules/. /app/node_modules
exec npm run start:dev