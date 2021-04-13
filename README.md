# STELLING Server. ( typescript & express )
---
### Process.
```md
1. touch .env swagger.json
2. write .env & swagger.json
3. local mysql database setup.
4. yarn
5. yarn ts-dev
6. (production build) yarn tsc
7. (dummy data create) HTTP POST /dummy/all
8. (production run) yarn pm2-pro or (development run) yarn pm2
```

# Typescript & Express.

### YARN.

```md
-   yarn <- first init.
-   yarn ts-dev <- develop mode.
-   yarn tsc <- build folder craete.
-   yarn pm2 <- production mode & process mng.
```

### ERROR.

```md
Error Handling.

Route APi => throw new Eror: x. => return next({ s: status, m: message });
```

### SEQUELIZE.

```md
.../sequelize/index.ts <- DB setup file.
.../sequelize/models/\*.ts <- TABLE setup files.
```

### STATIC FOLDER.

```md
.../public/\*_/_
```

### SETUP.

```md
-   touch .env
```
