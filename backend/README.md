# **Weather WebApp API (BACKEND ENVIRONMENT)**

Below are the steps to setup the development evironment for the project.
These steps can only be performed when you have cloned the repo from [here](https://github.com/geekpnx/weather_webapp_api). 

## **STEP 1**

After cloned, you need to go to  **`weather_webapp_api`** folder.

- With the command:

```bash
cd weather_webapp_api
```

## **STEP 2**

Create virtual environment with **`venv`**

- With the command:
```bash
make dev-venv name=wwa
```

you can activate **`venv`** (*although this is not necessary, because all commands will be ran through Makefile*)

- With the command :

```bash
source /backend/.venv/bin/activate
```

## **STEP 3**

Install requirements, all dependencies.

- With the command:

```bash
make dev-install
```


## **STEP 4**

Create **`.env.dev`** file

- With the command

```bash
nano .env.dev
```
Copy and paste all variables below inside the file **`.env.dev`**.
>> **Note:** *Make sure you create this file inside the **backend** folder.*

```bash
# This are the default backend endpoint, also for media and static folders
DOMAIN=127.0.0.1:8000
PROTOCOL=http
BASE_URL=${PROTOCOL}://${DOMAIN}
MEDIA_URL=${BASE_URL}/media/
STATIC_URL=${BASE_URL}/static/
# These are the API keys and database credentials
SECRET_KEY= # add your generated screte key here
WEATHER_API_KEY= # add your Weather API key here
OPENWEATHERMAP_API_KEY= # add your Openweathermap API key here
NEWS_API_KEY= # add your News API key here
DB_NAME= # add your Database name key here
DB_USER= # add your Database username key here
DB_PWD= # add your Database password here
DB_PORT=5432
DB_HOST=localhost
```
Your may  want to generate your own key for the **`SECRET_KEY`** variable.

- With the command 

```bash
make dev-create-secretkey
```

## **STEP 5**

For **`DB_NAME`** variable, if you haven't create database in your PostgreSQL with the name `weather_webapp_db` (or something else you desire )
your can do so,

- With the command

```bash
make dev-createdb-name
```

or by going to PostgreSQL shell directly

- With the command

```bash
psql -U postgres
```

 and enter the below query

```sql
CREATE DATABASE weather_webapp_db;
```

## **STEP 6**

Next, create new username for **`DB_USER`** variable (*username e.g: 'weather_webapp_user'* ) as super user with password for **`DB_PWD`** variable (*password e.g: 'password123'*)

- With the command

```bash
make dev-createdb-un-pw
```

or by type in the below query in PostgreSQL

```sql
CREATE ROLE weather_webapp_user WITH LOGIN SUPERUSER 'password123';
```


And add these informations into the **`.env.dev`** file.

## **STEP 7**

One it's done, and **`.env.dev`** file been setup with the required data, you can migrate the django  project `weather_webapp_api`.

- With the command

```bash
make dev-m
```

## **STEP 8**

Create superuser with the name **`admin`** (or as you wish) and password **`admin`** (or as you wish), to have access to the administrator Django page

- With the command

```bash
make dev-super
```


## **STEP 9**

Before you be able to run fully the project (Weather WebApp), you need to complete the frontend (React + Vite) setup.
Please click on this >> [Frontend Setup](https://github.com/geekpnx/weather_webapp_api/tree/prod-trnc5/frontend)



