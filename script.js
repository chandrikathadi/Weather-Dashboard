    const apiKey = '6e87e9c17bf530c4caeb7941d09703c1'; 
    const searchBtn = document.getElementById('search-btn');
    const locationInput = document.getElementById('location-input');
    const errorMessage = document.getElementById('error-message');
    const currentWeatherDiv = document.getElementById('current-weather');
    const forecastTitle = document.getElementById('forecast-title');
    const forecastDiv = document.getElementById('forecast');

    searchBtn.addEventListener('click', () => {
      const location = locationInput.value.trim();
      if (location === '') {
        showError('Please enter a city name or zip code.');
        return;
      }
      fetchWeather(location);
    });

    async function fetchWeather(location) {
      clearDisplay();
      try {
        
        const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`);
        if (!currentRes.ok) throw new Error('Location not found');
        const currentData = await currentRes.json();
        displayCurrentWeather(currentData);

        
        const { lat, lon } = currentData.coord;
        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        if (!forecastRes.ok) throw new Error('Failed to fetch forecast');
        const forecastData = await forecastRes.json();
        displayForecast(forecastData);
      } catch (error) {
        showError(error.message);
      }
    }

    function displayCurrentWeather(data) {
      errorMessage.textContent = '';
      currentWeatherDiv.style.display = 'block';

      document.getElementById('location-name').textContent = `${data.name}, ${data.sys.country}`;
      document.getElementById('temperature').textContent = Math.round(data.main.temp);
      document.getElementById('humidity').textContent = data.main.humidity;
      document.getElementById('wind-speed').textContent = data.wind.speed;
      document.getElementById('weather-description').textContent = data.weather[0].description;

      const iconCode = data.weather[0].icon;
      document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
      document.getElementById('weather-icon').alt = data.weather[0].description;
    }

    function displayForecast(data) {
      forecastDiv.innerHTML = '';
      forecastTitle.style.display = 'block';

      
      const dailyForecasts = {};

      data.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        const time = item.dt_txt.split(' ')[1];
        if (time === "12:00:00") {
          dailyForecasts[date] = item;
        }
      });

      
      if (Object.keys(dailyForecasts).length < 5) {
        let daysAdded = new Set();
        data.list.forEach(item => {
          const date = item.dt_txt.split(' ')[0];
          if (!daysAdded.has(date)) {
            dailyForecasts[date] = item;
            daysAdded.add(date);
          }
        });
      }

      
      const days = Object.keys(dailyForecasts).slice(0,5);

      days.forEach(date => {
        const forecast = dailyForecasts[date];
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('forecast-day');

        const dayName = new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        const temp = Math.round(forecast.main.temp);
        const icon = forecast.weather[0].icon;
        const description = forecast.weather[0].description;

        dayDiv.innerHTML = `
          <strong>${dayName}</strong>
          <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}" title="${description}" />
          <p>${temp} °C</p>
        `;
        forecastDiv.appendChild(dayDiv);
      });
    }

    function showError(msg) {
      errorMessage.textContent = msg;
      currentWeatherDiv.style.display = 'none';
      forecastTitle.style.display = 'none';
      forecastDiv.innerHTML = '';
    }

    function clearDisplay() {
      errorMessage.textContent = '';
      currentWeatherDiv.style.display = 'none';
      forecastTitle.style.display = 'none';
      forecastDiv.innerHTML = '';
    }
  

