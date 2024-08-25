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

## **STEP 7**

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

### **Example for Weather `Location` endpoint**
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
### **Example for Weather `Current` endpoint**

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
	
You can check the data by running the Django server again, like in **`STEP 6`**.
