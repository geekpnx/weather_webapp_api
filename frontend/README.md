# **Weather WebApp API (FRONTEND ENVIRONMENT)**

Below are the steps to setup the frontend evironment for the project.
These steps can only be performed when you have cloned the repo from [here](https://github.com/geekpnx/weather_webapp_api/) and done the backend process from here [here](https://github.com/geekpnx/weather_webapp_api/tree/main/backend).

## **STEP 1**

Setup React VITE note modules and install all dependencies.

- With the command:

```bash
make dev-npm-install
```

## **STEP 2**


Create **`.env.development`** file

- With the command

```bash
nano .env.development
```
Copy and paste all variables below inside the file **`.env.development`**.
>> **Note:** *Make sure you create this file inside the **frontend** folder.*

```bash
# Based domain, protocol and url:
DOMAIN=127.0.0.1:8000
PROTOCOL=http
BASE_URL=${PROTOCOL}://${DOMAIN}

# (internal APIs and access folders):
VITE_STATIC_BASE_URL=${BASE_URL}/static
VITE_MEDIA_BASE_URL=${BASE_URL}/media
VITE_WEATHER_API_BASE_URL=${BASE_URL}/api/v1/weather
VITE_USER_API_BASE_URL=${BASE_URL}/api/v1/user

# (external APIs):
VITE_OPENWEATHERMAP_API_KEY= # add your Openweathermap API key here.
VITE_OPENWEATHERMAP_API_BASE_URL=https://api.openweathermap.org/
VITE_OPENWEATHERMAP_BASE_URL=https://openweathermap.org/
```


## **STEP 3**

To run the application in development mode with the command below, which it will run  django and React Vite server.

```bash
make
```

## **STEP 4**

Go to your prefer browser in your local machine and type or just click >> [**localhost:5173**](http://localhost:5173)

