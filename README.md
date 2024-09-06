# WEATHER WEBAPP API

These steps below is only when you have cloned the repo.

## **STEP 1**

After, you need to go to  **`weather_webapp_api`** folder.

- With the command:

```bash
cd weather_webapp_api
```

## **STEP 2**

Create virtual environment with **`venv`**.

- With the command:
```bash
python3 -m venv .venv --prompt weather_webapp_api
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
SECRET_KEY=      
DB_NAME=
DB_USER=
DB_PWD=
DB_PORT=5432
DB_HOST=localhost
```
Your may  want to generate your own `SECRET_KEY` you can either run below command in **`iPython`**

```py
import secrets

secrets.token_urlsafe(50)
```

or by running the script in **`generateSKEY.py`** file.

- With the command 

```bash
python3 -m generate_SECRET_KEY
```

## **STEP 5**

For the **`DB_NAME`**, I you haven't create database in your PostgreSQL with the name `weather_webapp_db` (or something else you desire ).
your can do so,

- With the command

```bash
python3 -m create_DB_NAME
```

or by going to PostgreSQL shell directly

- With the command

```bash
psql -U postgres
```

 and enter the query below

```sql
CREATE DATABASE weather_webapp_db;
```

## **STEP 6**

also for new user **`DB_USER`** as super user with password **`DB_PWD`**

- With the command

```bash
python3 -m create_DB_USER_n_DB_PWD
```

or by type in the below query in PostgreSQL

```sql
CREATE ROLE weather_webapp_user WITH LOGIN SUPERUSER 'password';
```


And add this information into the **`.env`** file.

## **STEP 7**

After **`.env`** file been setup with the required data, you can migrate the django  project `weather_webapp_api`.

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

To run the django server by running the command below in terminal.

```bash
make
```

## **STEP 10**

Check if all the API endpoints are working correctly, such as **`current`**, **`forecast`** and **`location`**, by going to your browser


- For **`current`** Weather API, type in:
```
	127.0.0.1:8000/api/v1/weather/current/
```
<a href="https://ibb.co/Kztshdh"><img src="https://i.ibb.co/dJNpMFM/Smart-Select-20240825-013220-Chrome.jpg" alt="Smart-Select-20240825-013220-Chrome" border="0"></a>

- For **`forecast`** Weather API, type in:
```
	127.0.0.1:8000/api/v1/weather/forecast/
```
<a href="https://ibb.co/18XLTHc"><img src="https://i.ibb.co/HnPVqmZ/Smart-Select-20240825-013441-Chrome.jpg" alt="Smart-Select-20240825-013441-Chrome" border="0"></a>

- For **`location`** Weather API, type in:
```
	127.0.0.1:8000/api/v1/weather/location/ 
```
<a href="https://ibb.co/vj7N98Q"><img src="https://i.ibb.co/qrtH6wW/Smart-Select-20240825-013518-Chrome.jpg" alt="Smart-Select-20240825-013518-Chrome" border="0"></a>	


**NOTE**: You will see that no data in all of these APIs, we will  add some samples.

# **Below is how to add data to the `Weather Webapp APIs` endpoint**

These process will be done in **`iPython`**, with DJANGO ORM syntx.

To start the shell,

- With the command

```bash
make dev-shell-plus
```

### **Example for Weather `location` endpoint**
```py
from apps.weather.serializers.location import LocationSerializer

location_data = {"city_name":"Cologne", "country_code":"de", "latitude":50.935173, "longitude":6.953101}

location_data_a = LocationSerializer(data=location_data)

location_data_a.is_valid()

# Output:
	# True

location_data_a.validated_data

# Output:
	
	#{'city_name': 'Cologne',
 	#'country_code': 'de',
 	#'latitude': 50.935173,
 	#'longitude': 6.953101}

location_data_a.save()

# Output:
	
	# <Location: Location object (1)>

```	
### **Example for Weather `current` endpoint**

```py
from apps.weather.serializers.current import CurrentSerializer

current_data = {
    "location": 1,
     "timestamp": "2024-08-21T14:30:00Z",
     "temperature": 25.5,
     "humidity": 60,
     "wind_speed": 15.2
     }
     
current_data_a = CurrentSerializer(data=current_data)

current_data_a.is_valid()

# Output: 
	# True

current_data_a.validated_data

# Output:

	#{'timestamp': datetime.datetime(2024, 8, 25, 14, 30, tzinfo=zoneinfo.ZoneInfo(key='UTC')),
 	#'temperature': 25.5,
 	#'humidity': 60,
 	#'wind_speed': 15.2,
 	#'location': <Location: Location object (1)>}

current_data_a.save()

# Output:
	
	# <Current: Current object (1)>
```

### **Example for Weather `forecast` endpoint**

```py
from apps.weather.serializers.forecast import ForecastSerializer

forecast_data = {
    "location": 1,
    "timestamp": "2024-08-21T14:30:00Z",
    "temperature": 25.5,
    "max_temperature": 28.0,
    "min_temperature": 18.0,
    "humidity": 60,
    "weather_description": "Partly_cloudy" ,
    }
    
forecast_data_a = ForecastSerializer(data=forecast_data)

forecast_data_a.is_valid()

# Output: 
	# True

forecast_data_a.validated_data

# Output:

	#{'timestamp': datetime.datetime(2024, 8, 21, 14, 30, tzinfo=zoneinfo.ZoneInfo(key='UTC')),
 	#'temperature': 25.5,
 	#'max_temperature': 28.0,
 	#'min_temperature': 18.0,
 	#'humidity': 60,
 	#'weather_description': 'Partly_cloudy',
 	#'location': <Location: Location object (1)>}
	
forecast_data_a.save()

# Output: 
	# <Forecast: Forecast object (1)>
```	
	
You can check the data by running the Django server, see  **`STEP 9`**.
