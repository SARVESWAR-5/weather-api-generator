const fetchButton = document.getElementById('fetch-button');
const keywordInput = document.getElementById('keyword');
const dataDisplay = document.getElementById('data-display');
const weatherChartCtx = document.getElementById('weatherChart').getContext('2d');

// Initialize the map
const map = L.map('map').setView([20, 0], 2); // Initial view (world map)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Chart.js instance (to be updated dynamically)
let weatherChart;

fetchButton.addEventListener('click', async () => {
  const keywords = keywordInput.value.split(',').map(city => city.trim());

  if (keywords.length === 0 || keywords[0] === "") {
    alert('Please enter at least one city name.');
    return;
  }

  try {
    const weatherDataArray = await Promise.all(
      keywords.map(async city => {
        const apiResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=8868adf62d847a1922ea9ec35e4f529c&units=metric`
        );
        
        const apiData = await apiResponse.json();

        if (apiData.cod !== 200) {
          throw new Error(`Error fetching data for ${city}: ${apiData.message}`);
        }

        // Add marker to map
        L.marker([apiData.coord.lat, apiData.coord.lon])
          .addTo(map)
          .bindPopup(`${apiData.name}: ${apiData.main.temp}°C`);

        return { city: apiData.name, temp: apiData.main.temp, humidity: apiData.main.humidity };
      })
    );

    // Display data
    displayData(weatherDataArray);

    // Update chart
    updateChart(weatherDataArray);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    alert(error.message);
  }
});

function displayData(dataArray) {
  const tableHTML = `
    <table class="table table-bordered">
      <thead class="table-dark">
        <tr>
          <th>City</th>
          <th>Temperature (°C)</th>
          <th>Humidity (%)</th>
        </tr>
      </thead>
      <tbody>
        ${dataArray
          .map(
            data => `
          <tr>
            <td>${data.city}</td>
            <td>${data.temp}</td>
            <td>${data.humidity}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;

  dataDisplay.innerHTML = tableHTML;
}

function updateChart(dataArray) {
  const labels = dataArray.map(data => data.city);
  const tempData = dataArray.map(data => data.temp);
  const humidityData = dataArray.map(data => data.humidity);

  if (weatherChart) {
    weatherChart.destroy();
  }

  weatherChart = new Chart(weatherChartCtx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Temperature (°C)',
          data: tempData,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
        },
        {
          label: 'Humidity (%)',
          data: humidityData,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    },
  });
}


