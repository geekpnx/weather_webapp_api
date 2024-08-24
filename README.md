# WEATHER WEBAPP API

These steps below is only when you have cloned the repo.

## **STEP 1**

After, you need to go to  **weather_webapp** folder.

- With the command:

```bash
cd weather_webapp
```

## **STEP 2**

Create virtual environment with **`venv`**.

- With the command:
```bash
python3 -m venv .venv --prompt your_project_name
```

Activate **`venv`**

- With the command:

```bash
source .venv/bin/activate
```

## **STEP 3**

Install requirements.

- With the command:

```bash
make dev-install
```


## **STEP 4**

Create **`.env`** file

- With the command

```bash
nano .env
```
Copy and paste the information below inside the file **`.env`**.

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

For the `DB_NAME` I will presume you have created one in your PostgreSQL with the name `weather_webapp`.

## **STEP 5**

After **`.env`** file been setup with the required data, you can migrate the django  project `weather_webapp`.

- With the command

```bash
make dev-m
```

## **STEP 6**

Run the django server by running the command below in terminal.

```bash
make
```

## **STEP 6**

Check if all the API endpoints are working correctly, such as **`current`**, **`forecast`** and **`location`**, by going to your browser


- For **`current`** Weather API, type in:
	127.0.0.1:8000/api/v1/weather/current/

<a href="https://ibb.co/Kztshdh"><img src="https://i.ibb.co/dJNpMFM/Smart-Select-20240825-013220-Chrome.jpg" alt="Smart-Select-20240825-013220-Chrome" border="0"></a>

- For **`forecast`** Weather API, type in:
	127.0.0.1:8000/api/v1/weather/forcast/

<a href="https://ibb.co/18XLTHc"><img src="https://i.ibb.co/HnPVqmZ/Smart-Select-20240825-013441-Chrome.jpg" alt="Smart-Select-20240825-013441-Chrome" border="0"></a>

- For **`location`** Weather API, type in:
	127.0.0.1:8000/api/v1/weather/location/ 

<a href="https://ibb.co/vj7N98Q"><img src="https://i.ibb.co/qrtH6wW/Smart-Select-20240825-013518-Chrome.jpg" alt="Smart-Select-20240825-013518-Chrome" border="0"></a>	


You will see that no data on all of them, because we need to add them ourself. For this steps it will come ...
