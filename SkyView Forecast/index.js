const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchweather]");
const userContainer = document.querySelector(".weather-container");

const grantLocationContainer = document.querySelector(
  ".grant-location-container"
);
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

const notFound = document.querySelector(".errorContainer");
const errorBtn = document.querySelector("[data-errorButton]");
const errorText = document.querySelector("[data-errorText]");
const errorImage = document.querySelector("[data-errorImg]");

// Initially Variable needs.
let currentTab = userTab;
const API_KEY = "a099ef8670c52f0082ca04be9f62cade";
currentTab.classList.add("current-tab");

// Calling getFrormsessionStorage
getFromSessionStorage();

function switchTab(clickedTab) {
  if (clickedTab != currentTab) {
    currentTab.classList.remove("current-tab");
    currentTab = clickedTab;
    currentTab.classList.add("current-tab");

    // In Search tab container is invisible then its make visible
    if (!searchForm.classList.contains("active")) {
      userInfoContainer.classList.remove("active");
      grantLocationContainer.classList.remove("active");
      errorImage.classList.remove("active");
      searchForm.classList.add("active");
    } else {
      // In Your-weather tab
      searchForm.classList.remove("active");
      userInfoContainer.classList.remove("active");
      notFound.classList.remove("active");


      //   function call in which we make  your weather display is Visible,So Lets Check Local storage first.
      // For Coordinate, if we Haved saved them there
      getFromSessionStorage();
    }
  }
}

userTab.addEventListener("click", () => {
  switchTab(userTab);
});

searchTab.addEventListener("click", () => {
  switchTab(searchTab);
});

// Check if Coordinate are already present in the session
function getFromSessionStorage() {
  const localCoordinate = sessionStorage.getItem("user-coordinates");
  if (!localCoordinate) {
    // if local-cordinates is not present then..
    grantLocationContainer.classList.add("active");
  } else {
    const coordinates = JSON.parse(localCoordinate);
    fetchUserWeatherInfo(coordinates);
  }
}

async function fetchUserWeatherInfo(coordinates) {
  const { lat, lon } = coordinates;
  // Make GrantContainer Invisible
  grantLocationContainer.classList.remove("active");
  // Make Loader visible..
  loadingScreen.classList.add("active");

  // API Call..
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    if (!data.sys) {
      throw data;
  }

    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    renderWeatherInfo(data);
  } catch (err) {
    loadingScreen.classList.remove("active");
    notFound.classList.add("active");
    errorImage.style.display = "none";
    errorText.innerText = `Error: ${err?.message}`;
    errorBtn.style.display = "block";
    errorBtn.addEventListener("click", fetchUserWeatherInfo);
  }
}

function renderWeatherInfo(weatherInfo) {
  // First we have have to fetch the value.
  const cityName = document.querySelector("[data-cityName]");
  const countryIcon = document.querySelector("[data-countryIcon]");
  const desc = document.querySelector("[data-weatherDesc]");
  const weatherIcon = document.querySelector("[data-weathericon]");
  const temp = document.querySelector("[data-temp]");
  const windspeed = document.querySelector("[data-windspeed]");
  const humidity = document.querySelector("[data-humidity]");
  const cloudiness = document.querySelector("[data-cloadiness]");

  // Fetch the value from weatherInfo object and put it UI element
  cityName.innerText = weatherInfo?.name;
  countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
  desc.innerText = weatherInfo?.weather?.[0]?.description;
  weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
  temp.innerText = `${weatherInfo?.main?.temp} °C`;
  windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
  humidity.innerText = `${weatherInfo?.main?.humidity} %`;
  cloudiness.innerText = `${weatherInfo?.clouds?.all} %`;
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    grantLocationButton.style.display = "none";
  }
}

function showPosition(position) {
  const userCoordinates = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  };

  sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
  fetchUserWeatherInfo(userCoordinates);
}

const grantLocationButton = document.querySelector("[data-grantAccess]");
grantLocationButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let cityName = searchInput.value;

  if (cityName === "") return;
  else fetchSearchWeatherInfo(cityName);
});

async function fetchSearchWeatherInfo(city) {
  loadingScreen.classList.add("active");
  userInfoContainer.classList.remove("active");
  grantLocationContainer.classList.remove("active");
  notFound.classList.remove("active");

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );

    const data = await response.json();
    if (!data.sys) {
      throw data;
    }
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    renderWeatherInfo(data);
  } catch (err) {
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.remove("active");
    notFound.classList.add("active");
    errorText.innerText = `${err?.message}`;
    errorBtn.style.display = "none";
  }
}
