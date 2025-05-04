# 🌤️ Weather Web App ⛈️ 

A full-stack weather application with real-time forecasts, built with Django (REST API) and React (Vite), deployed on Oracle Cloud Infrastructure (OCI) with Docker containers.

**Visit the link:** [weather.trncthll.com](https://weather.trncthll.com)  

[![Build Status](https://github.com/geekpnx/weather_webapp_api/actions/workflows/wwa-oci-build-deploy.yml/badge.svg)](https://github.com/geekpnx/weather_webapp_api/actions/workflows/wwa-oci-build-deploy.yml)
[![GitHub last commit](https://img.shields.io/github/last-commit/geekpnx/weather_webapp_api?logo=github)](https://github.com/geekpnx/weather_webapp_api)

[![Open Issues](https://img.shields.io/github/issues/geekpnx/weather_webapp_api?color=red&logo=github)](https://github.com/geekpnx/weather_webapp_api/issues)  

[![Repo Size](https://img.shields.io/github/repo-size/geekpnx/weather_webapp_api?logo=github)](https://github.com/geekpnx/weather_webapp_api)  
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/geekpnx/weather_webapp_api/blob/main/LICENSE)











---

## ✨ Key Features  
✅ **Real-time weather data** from `WeatherAPI`, `OpenWeatherMap`, `NewsAPI`

✅ **5-day and 3 hour forecast** display in cards

✅ **Location-aware** `Geolocation`, `GPS` or `manual search`

✅ **Responsive UI** `mobile`/`desktop` with animated video backgroud (*gradient color changes based on how the weather feels like*)

✅ **Registered Account**  have access to `save favorite locations`, `access to map` *(in diffrent layers: temperature, wind, clouds, and precipitation)*, `weather alert` and `weather news`


---

## 🛠️ Tech Stack  

### **Backend Services**  
| Component       | Technology             |  
|-----------------|------------------------|  
| Framework       | [![Django](https://img.shields.io/badge/Django-4.2+-092E20?logo=django)](https://docs.djangoproject.com/en/4.2/)           |  
| API             | ![REST API](https://img.shields.io/badge/API-REST-informational?logo=json) |  
| Database        | ![Database PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql)         |  
| Auth            | [![Auth](https://img.shields.io/badge/Auth-Django-092E20?logo=django&logoColor=white)](https://docs.djangoproject.com/en/stable/topics/auth/)|  

### **Frontend**  
| Component       | Technology             |  
|-----------------|------------------------|  
| Framework       | [![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://react.dev/)               |  
| Bundler         | [![Vite](https://img.shields.io/badge/Vite-4.0+-646CFF?logo=vite)](https://vitejs.dev/)                 |  
| State Mgmt      | [![React State](https://img.shields.io/badge/State_Management-React_Hooks-61DAFB?logo=react&logoColor=white)](https://react.dev/learn/state-management)|  
| UI    | [![CSS](https://img.shields.io/badge/CSS-Vanilla-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)|  
| Maps            | [![Maps](https://img.shields.io/badge/Maps-Leaflet-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/) |  

### **Infrastructure**  
| Component       | Technology             |  
|-----------------|------------------------|  
| Containerization| [![Docker Compose](https://img.shields.io/badge/Orchestration-Docker_Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)    |  
| Cloud           | [![Cloud](https://img.shields.io/badge/Cloud-Oracle_OCI-F80000?logo=oracle&logoColor=white)](https://www.oracle.com/cloud/)     |  
| CI/CD           | [![CI/CD](https://img.shields.io/badge/CI/CD-GitHub_Actions-2088FF?logo=github-actions&logoColor=white)](https://github.com/features/actions)       |  
 

### **Development Setup**  

If you intrested and want to try or improve the project, you can start by following the process to set it up.

For the Backend go here <a href="https://github.com/geekpnx/weather_webapp_api/tree/main/backend" target="_blank" rel="noopener noreferrer">Backend project setup</a>

For the Frontend go here <a href="https://github.com/geekpnx/weather_webapp_api/tree/main/frontend" target="_blank" rel="noopener noreferrer">Frontend project setup</a>


# **License**

This project is licensed under the [MIT License](./LICENSE).  
&copy; 2025 Terence Tahalele