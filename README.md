# 🌤️ Weather Web App – weather.trncthll.com  
[![Build Status](https://github.com/geekpnx/weather_webapp_api/actions/workflows/wwa-oci-build-deploy.yml/badge.svg)](https://github.com/geekpnx/weather_webapp_api/actions/workflows/wwa-oci-build-deploy.yml)

[![GitHub last commit](https://img.shields.io/github/last-commit/geekpnx/weather_webapp_api?logo=github)](https://github.com/geekpnx/weather_webapp_api)

[![Open Issues](https://img.shields.io/github/issues/geekpnx/weather_webapp_api?color=red&logo=github)](https://github.com/geekpnx/weather_webapp_api/issues)  

[![Repo Size](https://img.shields.io/github/repo-size/geekpnx/weather_webapp_api?logo=github)](https://github.com/geekpnx/weather_webapp_api)  

[![License](https://img.shields.io/github/license/geekpnx/weather_webapp_api?color=blue)](https://github.com/geekpnx/weather_webapp_api/blob/main/LICENSE)  

[![Django](https://img.shields.io/badge/Django-4.2+-092E20?logo=django)](https://docs.djangoproject.com/en/4.2/)  

[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://react.dev/)  

[![Vite](https://img.shields.io/badge/Vite-4.0+-646CFF?logo=vite)](https://vitejs.dev/)  

**Visit the link:** [weather.trncthll.com](https://weather.trncthll.com)  

A full-stack weather application with real-time forecasts, built with Django (REST API) and React (Vite), deployed on Oracle Cloud Infrastructure (OCI) with Docker containers.  

---

## ✨ Key Features  
✅ **Real-time weather data** from `WeatherAPI`/`OpenWeatherMap`/`NewsAPI`

✅ **5-day and 3 hour forecast** display in cards

✅ **Location-aware** `Geolocation`, `GPS` or `manual search`

✅ **Responsive UI** `mobile`/`desktop` with animated video backgroud

✅ **Registered Account**  have access to `save favorite locations`, `access to map` *(in diffrent layers: temperature, wind, clouds, and precipitation)*, `weather alert` and `weather news`


---

## 🛠️ Tech Stack  

### **Backend Services**  
| Component       | Technology             |  
|-----------------|------------------------|  
| Framework       | Django 4.2+            |  
| API             | Django REST Framework  |  
| Database        | PostgreSQL 14+         |  
| Auth            | Django Auth|  

### **Frontend**  
| Component       | Technology             |  
|-----------------|------------------------|  
| Framework       | React 18+              |  
| Bundler         | Vite 4+                |  
| State Mgmt      | React Built-in `useState`, `useReducer`, `useContext` |  
| UI    | Vanilla CSS |  
| Maps            | Leaflet |  

### **Infrastructure**  
| Component       | Technology             |  
|-----------------|------------------------|  
| Containerization| Docker + Compose       |  
| Cloud           | Oracle Cloud (OCI)     |  
| CI/CD           | GitHub Actions         |  
 

### **Development Setup**  

If you intrested and want to try or improve the project, you can start by following the process to set it up.

For the Backend go here <a href="https://github.com/geekpnx/weather_webapp_api/tree/main/backend" target="_blank" rel="noopener noreferrer">Backend project setup</a>

For the Frontend go here <a href="https://github.com/geekpnx/weather_webapp_api/tree/main/frontend" target="_blank" rel="noopener noreferrer">Frontend project setup</a>


# **License**

This project is licensed under the [MIT License](./LICENSE).  
&copy; 2025 Terence Tahalele