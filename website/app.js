const radios = document.querySelectorAll("input[name='weather']");
const filter = document.getElementById('filter');
const search = document.getElementById('zip');
const generate = document.getElementById('generate');
const countriesList = document.getElementById('countries');
const citiesList = document.getElementById('cities');
// Personal API Key for OpenWeatherMap API
const apiKey = 'ec18dab59412aefcd75b503d8de905d8';
let zipCode;
let countryCode;
let feelings = '';
let apiLink;

// Get the Current Date
const dateObj = new Date();
const date = `${dateObj.getDate()}/${dateObj.getMonth()}/${dateObj.getFullYear()}`;


// fetch result of 20+ cities from the selected country
const getCitiesList = async (country) => {
    await new Promise(r => setTimeout(r, 1000));

    let option;
    citiesList.innerHTML = '<option value="holder" selected disabled hidden>Choose a city</option>';
    const documentFragment = document.createDocumentFragment();
    
    for(let i=1;i<=10;++i){
        const results = await 
        fetch(`https://countries-cities.p.rapidapi.com/location/country/${country}/city/list?page=${i}&population=15000`, {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "countries-cities.p.rapidapi.com",
                "x-rapidapi-key": "e4ea81158cmshd969e1104e9d301p1346b5jsnb5925ca558dd"
            }
        });

        try{

            const x = await results.json();
            for( const result of await x.cities ){
                option = document.createElement('option');
                option.text = result.name;
                await documentFragment.appendChild(option);
            }

            if(x.cities.length === 0 ){
                break;
            }
            
        }
        catch(error){
            console.log(error);
            break;
        }
    }
    citiesList.appendChild(documentFragment);
}

// Creates select element with all the countries in the world
window.addEventListener('load', async ()=>{

    const results = await fetch('https://restcountries.eu/rest/v2/all');

    try{
        let option;
        const documentFragment = document.createDocumentFragment();
        const x = await results.json();
        for(const result of x){
            option = document.createElement('option');
            option.text = result.name;
            option.value = result.alpha2Code;
            documentFragment.appendChild(option);
        }
        countriesList.appendChild(documentFragment);
    }
    catch(error){
        console.log(error);
    }
})

countriesList.addEventListener('change', e => {

    countryCode = e.target.value;

    if(radios[0].checked){
        getCitiesList(e.target.value);
    }
    
});

// change apiLink value depending on selected city
citiesList.addEventListener('change', e => {
    apiLink = `https://api.openweathermap.org/data/2.5/weather?q=${e.target.value},${countryCode}&appid=${apiKey}`;
});

filter.addEventListener('change', () => {
    radios[0].parentElement.classList.toggle('active');
    radios[1].parentElement.classList.toggle('active');
    search.value = '';
    if(radios[1].checked){
        citiesList.setAttribute('hidden', true);
        search.removeAttribute('hidden');
    }
    else{
        getCitiesList(countryCode);
        citiesList.removeAttribute('hidden');
        search.setAttribute('hidden', true);
    }

});


// Event listener to add function to existing HTML DOM element
generate.addEventListener('click', () => {

    if(radios[1].checked){
        zipCode = search.value;
        apiLink = `http://api.openweathermap.org/data/2.5/weather?zip=${zipCode},${countryCode}&appid=ec18dab59412aefcd75b503d8de905d8`;
    }

    getWeather()
    .then(data => {
        feelings = document.getElementById('feelings').value;

        const sunrise = new Date(data.sys.sunrise * 1000);
        const sunset = new Date(data.sys.sunset * 1000);

        postData('/storeData', {
            city: data.name,
            country: data.sys.country,
            description: data.weather[0].description,
            date: date,
            temp: data.main.temp - 273.15, 
            feelsLike: data.main.feels_like - 273.15, 
            humidity: data.main.humidity,
            windSpeed: data.wind.speed, 
            icon: data.weather[0].icon, 
            weatherId: data.weather[0].id,
            sunrise: sunrise.toLocaleTimeString(),
            sunset: sunset.toLocaleTimeString(),
            feelings: feelings
        });
        
        updateUI();
    });

});


/* Function to GET Web API Data*/
const getWeather = async () => {
    const result = await fetch(apiLink);

    try{
        const data = await result.json();

        if(data.cod === "404"){
            alert("ERROR: City Not Found");
        }
        else{
            console.log(data);
            return data;
        }

    }
    catch(error){
        console.log(error);
    }
}


/* Function to POST data */
const postData = async (url, data) =>{
    const result = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type':'application/json',
        },
        body: JSON.stringify(data),
    });

    try{
        const data = await result.json();
        return data;
    }
    catch(error){
        console.log(error);
    }
}


/* Function to GET Project Data */
const updateUI = async () => {
    const result = await fetch('/sendData');
    
    try{
        const data = await result.json();
        const project = document.getElementById('project');
        const weatherResult = document.querySelector('.output-div');
        const appName = document.querySelector('span');

        appName.innerText = data.city;

        if(weatherResult !== null){
            weatherResult.remove();
        }

        const fragment = document.createDocumentFragment();
        let weatherType;

        if(data.weatherId >= 200 && data.weatherId < 233){
            weatherType = "thunder";
        }
        else if( (data.weatherId >= 300 && data.weatherId < 322) || (data.weatherId >= 500 && data.weatherId < 532) ){
            weatherType = "rain";
        }
        else if(data.weatherId >= 600 && data.weatherId < 623){
            weatherType = "snow";
        }
        else if(data.weatherId >= 800 && data.weatherId < 805){
            weatherType = "clouds";
        }

        console.log(weatherType);

        const weather = `<div class="output-div ${weatherType}-output-div">
                                <div class="output-text ${weatherType}-output-text">
                                    <div>
                                        <div class="${weatherType}-weather-title">
                                            <h1>${data.city}, ${data.country}</h1>
                                            <h3 id="date">${data.date}</h3>
                                            <h3>${data.description}</h3>
                                        </div>

                                        <div class="weather-output ${weatherType}-weather-output">
                                            <div class="weather-label">
                                                <h3 id="feels-like">Feels like</h3>
                                                <h3 id="humidity">Humidity</h3>
                                                <h3 id="wind-speed">Wind Speed</h3>
                                                <h3 id="sunrise">Sunrise</h3>
                                                <h3 id="sunset">Sunset</h3>
                                                <h3 id="content">Feelings</h3>
                                            </div>

                                            <div class="weather-value">
                                                <h3>${data.feelsLike.toFixed(0)}°c</h3>
                                                <h3>${data.humidity}%</h3>
                                                <h3>${data.windSpeed} m/s</h3>
                                                <h3>${data.sunrise}</h3>
                                                <h3>${data.sunset}</h3>
                                                <h3>${data.feelings}<h3>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="temperature ${weatherType}-temperature">
                                        <img src="http://openweathermap.org/img/w/${data.icon}.png" id="icon"></img>
                                        <h3 id="temp">${data.temp.toFixed(0)}<sup>°C</sup></h3>
                                    </div>
                                </div>

                                <div class="output-img ${weatherType}-output-img">
                                    <img class="${weatherType}-img" src="css/images/${weatherType}.png">
                                </div>
                            </div>`;

        project.appendChild(document.createRange().createContextualFragment(weather));
    }
    catch(error){
        console.log('Error: ', error);
    }
    
}
