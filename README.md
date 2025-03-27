# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Before running the app

https://www.postgresql.org/download/

db schema included in /db/schema.sql

generate the db with:

```Bash
psql -U your_user -d your_db -f db/schema.sql
```

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

3. Start the server
   ```bash
   node server.js
   ```

3. Start the app

   ```bash
    npx expo start
   ```