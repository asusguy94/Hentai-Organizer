# hentai

A semi-automatic web management solution for organizing your video collection

## V2

This is the latest version of the app that is currently working. This version will not get a lot of feature
updates, because I am already working on the next big version...might take a while though.

## Getting started

These instructions will get you a copy of the project up and running on your local machine for development
and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

#### Database

-   Create a database, and remember the name
-   Load [this script](https://raw.githubusercontent.com/asusguy94/Hentai-Organizer/v2/hentai.sql) into database manager of choice

#### \_class.php

Edit the define-data at the top of the **\_class.php** file.

-   define('DB', 'DATABASE_NAME')
-   define('DB_USER', 'DATABASE_USERNAME')

```
Use root if unsure
```

-   define('DB_PASS', 'DATABASE_PASSWORD')

```
Use blank if unsure and you used root as username
```

-   OPTIONAL: define('DB_PORT', SQL_PORT_NUMBER);

```
  mariaDB port: 3307
  mySQL port: 3306
```

That's it, now you're ready, enjoy.

## Known Issues

| Issue                                                                                                     | Fix                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| If no categories exists, you cannot add any category to a video                                           | Add a category manually to the database table. This bug only occurs when the table has 0 rows                                                                        |
| Attribute spelling error, or you accidentally created a new category by writing "softt" instead of "soft" | Currently the way the structure of the database and php-functions work,is that it will create a new row that cannot be deleted through the app.                      |
|                                                                                                           | 1. Remove the incorrect data (usually by right clicking the data, and click remove)                                                                                  |
|                                                                                                           | 2. Go to the database (click on `DB` at the top right to get into the administration) and login with credentials, you can use the `root user` & `root password`      |
|                                                                                                           | 3. Go to the database responsible for your app                                                                                                                       |
|                                                                                                           | 4. Go to the table with the incorrect data, i.e if you want to fix a category go to the categories-table                                                             |
|                                                                                                           | 5. BEFORE DOING ANYTHING: Check that no video or star is using the unwanted data, this can be checked with the app (easy), or with the administration (intermediate) |
|                                                                                                           | 6. Remove the unwanted data from the administration website and go back to the app. it should now be working again                                                   |
