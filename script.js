const cityInput = document.querySelector(".city-input")
const searchBtn = document.querySelector('.search-btn')
const notFoundSection = document.querySelector('.not-found')
const searchCitySection = document.querySelector('.search-city')
const weatherInfoSection = document.querySelector('.weather-info') 
const countryTxt = document.querySelector('.country-txt')
const tempTxt = document.querySelector('.temp-txt')
const conditionTxt = document.querySelector('.condition-txt')
const humidityValueTxt = document.querySelector('.humidity-value')
const windValueTxt = document.querySelector('.wind-value-txt')
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDateTxt = document.querySelector('.current-date-txt') 
const forecastItemsContainer = document.querySelector('.forecast-item-container') 

const apiKey = 'bfb980c786e1d55978a9eed09d6bdb91' 

searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim() != '') {
        updateWeatherInfo(cityInput.value)
        cityInput.value = ''
        cityInput.blur()
    }
})

cityInput.addEventListener('keydown', (event) => {
    if (event.key == 'Enter' && cityInput.value.trim() != '') {
        updateWeatherInfo(cityInput.value)
        cityInput.value = ''
        cityInput.blur()
    }
})

async function getFetchData(endPoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}`
    try {
        const response = await fetch(apiUrl)
        return await response.json()
    } catch (error) {
        console.error('Fetch Error:', error)
        return null
    }
}

function getWeatherIcon(id) {
    if (id >= 200 && id <= 232) return 'thunderstorm.svg'
    if (id >= 300 && id <= 321) return 'drizzle.svg'
    if (id >= 500 && id <= 531) return 'rain.svg'
    if (id >= 600 && id <= 622) return 'snow.svg'
    if (id >= 701 && id <= 781) return 'atmosphere.svg'
    if (id === 800) return 'clear.svg'
    if (id > 800 && id <= 804) return 'clouds.svg'
    return 'default.svg'
}


function getCurrentDate() {
    const currentDate = new Date()
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
    }
    return currentDate.toLocaleDateString('en-GB', options)
}

async function updateWeatherInfo(city) {
    const weatherData = await getFetchData('weather', city)
    if (weatherData.cod != 200) {
        showDisplaySection(notFoundSection)
        return
    }

    const {
        name: country,
        main: { temp, humidity },
        weather: [{ id, main }],
        wind: { speed }
    } = weatherData

    countryTxt.textContent = country
    tempTxt.textContent = Math.round(temp - 273.15) + '°C'
    conditionTxt.textContent = main
    humidityValueTxt.textContent = humidity + '%'
    windValueTxt.textContent = speed + ' M/s'
    currentDateTxt.textContent = getCurrentDate()
    
    const iconName = getWeatherIcon(id)
    weatherSummaryImg.src = `assets/weather/${iconName}`
    await updateForecastsInfo(city)
    showDisplaySection(weatherInfoSection)
}

async function updateForecastsInfo(city) {
    const forecastsData = await getFetchData('forecast', city)
    const timeTaken = '12:00:00'
    const todayDate = new Date().toISOString().split('T')[0]

    forecastItemsContainer.innerHTML = ''
    forecastsData.list.forEach(forecastWeather => {
        if (forecastWeather.dt_txt.includes(timeTaken) && !forecastWeather.dt_txt.includes(todayDate)) {
            updateForecastItems(forecastWeather)
        }
    })

    function updateForecastItems(weatherData) {
        const {
            dt_txt: date,
            weather: [{ id }],
            main: { temp }
        } = weatherData

        const forecastDate = new Date(date)
        const options = { day: '2-digit', month: 'short' }
        const formattedDate = forecastDate.toLocaleDateString('en-GB', options).toUpperCase()

        const iconName = getWeatherIcon(id)

        const dateTaken = new Date(date)
        const dateOption = {
            day: '2-digit',
            month: 'short'
        }

        const dateResult = dateTaken.toLocaleDateString('en-US', dateOption)

        const forecastItem = `
            <div class="forecast-item">
                <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
                <img src="assets/weather/${iconName}" alt="" class="forecast-item-img">
                <h5 class="forecast-item-temp">${Math.round(temp - 273.15)}°C</h5>
            </div>
        `
        forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem)
    }
}


function showDisplaySection(section) {
    [weatherInfoSection, searchCitySection, notFoundSection]
    .forEach(section => section.style.display = 'none')
    section.style.display = 'flex'
}