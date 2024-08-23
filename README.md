# WEATHER WEBAPP API

These steps below is only when you have cloned the repo.

## **STEP 1**

- After, you need to go to  **weather_webapp** folder.

- With the command:

```bash
cd weather_webapp
```

## **STEP 2**

- Create virtual environment with **venv**.

- With the command:
```bash
python3 -m venv .venv --prompt your_project_name
```

Activate **venv**

- With the command:

```bash
source .venv/bin/activate
```

## **STEP 3**

- Install requirements.

- With the command:

```bash
make dev-install
```


## **STEP 4**

Create **.env** file

- With the command

```bash
nano .env
```
Copy and paste the information below inside the file `.env`.

```bash
SECRET_KEY=@jjc%0^2$1n*e@%(mo4$^42@kqvrg9a2^yt@8-fy*(slm*nh0f
DB_NAME=weather_webapp        
DB_USER=postgres
DB_PWD=postgres
DB_PORT=5432
DB_HOST=localhost
```
If you want to generate your own `SECRET_KEY` you can run below command in **`iPython`**

```py
import secrets
secrets.token_urlsafe(50)
```

For the `DB_NAME` I will presume you have created one in your PostgreSQL with the name `weather_webapp`