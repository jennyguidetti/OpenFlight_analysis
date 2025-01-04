// Define global variables to hold airport and flight data
let airportData = [];
let flightData = [];
let mergedData = [];

// Function to fetch airport data
async function fetchAirportData() {
    try {
        const response = await fetch("A2_Airports.json");
        airportData = await response.json();
        
    } catch (error) {
        console.error(`Error fetching airport data: ${error.message}`);
    }
}

// Function to fetch flight data
async function fetchFlightData() {
    try {
        const response = await fetch("A2_Flights.json");
        flightData = await response.json();

        mergeFlightData(flightData, airportData);

        populateSourceAirportDropdown();
        populateDestinationAirportDropdown();
        populateAirlineDropdown();
        populateAircraftDropdown();
        populateCityDropdown();
        searchBox()

        const filteredAirportPairsData = airportPairs(mergedData, airportData);
        flightStats(filteredAirportPairsData);
        timeStats(filteredAirportPairsData);

    } catch (error) {
        console.error(`Error fetching flight data: ${error.message}`);
    }
}

// function to merge the airport and flight datasets together
function mergeFlightData(flightData, airportData) {
    mergedData = flightData.map(flight => {
        const sourceAirport = airportData.find(airport => airport.id === flight.source_airport_id);
        const designationAirport = airportData.find(airport => airport.id === flight.destination_airport_id);
        const airlineNew = {
            code: flight.airline,
            name: flight.airline_name,
            country: flight.airline_country
        };

        return {
            source_airport: sourceAirport,
            destination_airport: designationAirport,
            airline: airlineNew,
            aircraft: flight.aircraft,
            codeshare: flight.codeshare
        }
    })
}

// Function to populate the source airport dropdown
function populateSourceAirportDropdown() {
    const sourceAirportDropdown = document.getElementById("filterSourceAirportSelect");

    // clear existing options
    sourceAirportDropdown.innerHTML = "";

    // sort the mergedData array alphabetically by airport name
    airportData.sort((a, b) => a.name.localeCompare(b.name));

    // add default option
    const defaultOption = document.createElement("option");
    defaultOption.value = "any";
    defaultOption.textContent = "Any";
    sourceAirportDropdown.appendChild(defaultOption);

    // add options for each airport
    airportData.forEach(airport => {
        const option = document.createElement("option");
        option.value = airport.id;
        option.textContent = `${airport.name}`;
        sourceAirportDropdown.appendChild(option);
    });
}

// Function to populate the destination airport dropdown
function populateDestinationAirportDropdown() {
    const destinationAirportDropdown = document.getElementById("filterDestinationAirportSelect");

    destinationAirportDropdown.innerHTML = "";

    airportData.sort((a, b) => a.name.localeCompare(b.name));

    const defaultOption = document.createElement("option");
    defaultOption.value = "any";
    defaultOption.textContent = "Any";
    destinationAirportDropdown.appendChild(defaultOption);

    airportData.forEach(airport => {
        const option = document.createElement("option");
        option.value = airport.id;
        option.textContent = `${airport.name}`;
        destinationAirportDropdown.appendChild(option);
    });
}

// Function to populate the airline dropdown
function populateAirlineDropdown() {
    const airlineDropdown = document.getElementById("filterAirlineSelect");

    airlineDropdown.innerHTML = "";

    const uniqueAirlineNames = new Set();

    flightData.forEach(flight => {
        uniqueAirlineNames.add(flight.airline_name);
    });

    const sortedUniqueAirlineNames = Array.from(uniqueAirlineNames).sort();

    const defaultOption = document.createElement("option");
    defaultOption.value = "any";
    defaultOption.textContent = "Any";
    airlineDropdown.appendChild(defaultOption);

    sortedUniqueAirlineNames.forEach(airlineName => {
        const option = document.createElement("option");
        option.value = airlineName;
        option.textContent = airlineName;
        airlineDropdown.appendChild(option);
    });
}


// Function to populate the aircraft dropdown
function populateAircraftDropdown() {
    const aircraftDropdown = document.getElementById("filterAircraftSelect");

    aircraftDropdown.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "any";
    defaultOption.textContent = "Any";
    aircraftDropdown.appendChild(defaultOption);

   const uniqueAircraftTypes = new Set();

   flightData.forEach(flight => {
       flight.aircraft.forEach(type => uniqueAircraftTypes.add(type)); // Add all aircraft types to the Set
   });

   const sortedUniqueAircraftTypes = [...uniqueAircraftTypes].sort();

   sortedUniqueAircraftTypes.forEach(type => {
       const option = document.createElement("option");
       option.value = type;
       option.textContent = type;
       aircraftDropdown.appendChild(option);
   });
}

// Function to populate the airport city dropdown
function populateCityDropdown() {
    const cityDropdown = document.getElementById("filterCitySelect");

    cityDropdown.innerHTML = "";

    airportData.sort((a, b) => a.name.localeCompare(b.name));

    const defaultOption = document.createElement("option");
    defaultOption.value = "any";
    defaultOption.textContent = "Any";
    cityDropdown.appendChild(defaultOption);

    const uniqueCities = new Set();

    airportData.forEach(airport => {
        if (airport.city.trim() !== "") {
            uniqueCities.add(airport.city);
        }
    });

    uniqueCities.forEach(city => {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        cityDropdown.appendChild(option);
    });
}

// Function for search box functionality
function searchBox() {
    const searchTermInput = document.getElementById("filterSearchTermInput");

    searchTermInput.addEventListener("input", function() {
        const searchTerm = searchTermInput.value.trim().toLowerCase();

        const options = document.querySelectorAll("#filterCitySelect option");

        options.forEach(option => {
            const optionText = option.textContent.trim().toLowerCase();

            if (searchTerm === "" || optionText.includes(searchTerm)) {
                option.style.display = "block";
            } else {
                option.style.display = "none";
            }
        })
    })
} 

// function to limit shown results to 10 flights
function onlyTen(list) {
    const newlist = [];
    for (const item of list) {
      newlist.push(item);
      if (newlist.length >= 10) {
        break;
      }
    }
    return newlist;
}

// Function to log flights that match the selected source airport
function filterFlights(selectedSourceAirportId, selectedDestinationAirportId, selectedAirlineName, selectedAircraftName) {
    // filter flights based on the selected criteria
    let filteredFlights = mergedData;

    if (selectedSourceAirportId !== "any") {
        filteredFlights = filteredFlights.filter(flight => flight.source_airport.id === parseInt(selectedSourceAirportId,10));
    }
    
    if (selectedDestinationAirportId !== "any") {
        filteredFlights = filteredFlights.filter(flight => flight.destination_airport.id === parseInt(selectedDestinationAirportId,10));
    }

    if (selectedAirlineName !== "any") {
        filteredFlights = filteredFlights.filter(flight => flight.airline.name === selectedAirlineName);
    }

    if (selectedAircraftName !== "any") {
        filteredFlights = filteredFlights.filter(flight => flight.aircraft.includes(selectedAircraftName));
    }

    return onlyTen(filteredFlights);
}

// function to log flights that match selected criteria
function displayMatchingFlights() {
    const selectedSourceAirportId = document.getElementById("filterSourceAirportSelect").value;
    const selectedDestinationAirportId = document.getElementById("filterDestinationAirportSelect").value;
    const selectedAirlineName = document.getElementById("filterAirlineSelect").value;
    const selectedAircraftName = document.getElementById("filterAircraftSelect").value;

    const limitedFlights = filterFlights(selectedSourceAirportId, selectedDestinationAirportId, selectedAirlineName, selectedAircraftName);
    
    displayFilteredFlights(limitedFlights);
}

// function to display flights for each dropdown
function displayFilteredFlights(limitedFlights) {

    const flightFilterDisplayDiv = document.getElementById("flightFilterDisplayDiv");

    flightFilterDisplayDiv.innerHTML = "";

    if (limitedFlights.length > 0) {
        // create a table element
        const table = document.createElement("table");
        
        const headerRow = table.insertRow();
        const headers = ["Source Airport", "Destination Airport", "Airline", "Aircraft"];
        headers.forEach(headerText => {
            const header = document.createElement("th");
            header.textContent = headerText;
            headerRow.appendChild(header);
        });
    
        limitedFlights.forEach(flight => {
            const row = table.insertRow();
            row.innerHTML = `
                <td>${flight.source_airport.name}</td>
                <td>${flight.destination_airport.name}</td>
                <td>${flight.airline.name}</td>
                <td>${flight.aircraft}</td>
            `;
        });
    
        // append the table to the flightFilterDisplayDiv
        flightFilterDisplayDiv.appendChild(table);
    } else {
        // display message if no matching flights found
        flightFilterDisplayDiv.textContent = "No flights match the selected options.";
    }
}

// Function to log flights that match the selected source airport city in dropdown
function filterAirports(selectedAirportCity) {
    // filter airports based on the selected criteria
    let filteredAirports = airportData;

    if (selectedAirportCity !== "any") {
        filteredAirports = filteredAirports.filter(airport => airport.city === selectedAirportCity);
    }
    
    // if a search term is provided, filter airports based on the search term
    const searchTerm = document.getElementById("filterSearchTermInput").value.trim().toLowerCase();
    if (searchTerm !== "") {
        filteredAirports = filteredAirports.filter(airport => airport.name.toLowerCase().includes(searchTerm));
    }

    return onlyTen(filteredAirports); 
}

// Function to filter airports based on search term
function filterAirportsSearch(searchTerm) {
    // convert searchTerm to lowercase for case-insensitive searches
    const lowercaseSearchTerm = searchTerm.toLowerCase().trim();

    let filteredAirports = airportData.filter(airport => {
        // Check if airport name contains the search term
        return airport.name.toLowerCase().includes(lowercaseSearchTerm);
    });

    return onlyTen(filteredAirports);
}

// function to log airports that match selected criteria
function displayMatchingAirports() {
    const selectedAirportCity = document.getElementById("filterCitySelect").value;
    const searchTerm = document.getElementById("filterSearchTermInput").value;

    const limitedAirports = filterAirports(selectedAirportCity, searchTerm);
    
    displayFilteredAirports(limitedAirports);
}

// function to display airport for each dropdown
function displayFilteredAirports(limitedAirports) {
    const airportFilterDisplayDiv = document.getElementById("airportFilterDisplayDiv");

    airportFilterDisplayDiv.innerHTML = "";

    if (limitedAirports.length > 0) {
        const table = document.createElement("table");
        
        const headerRow = table.insertRow();
        const headers = ["IATA", "Name", "City", "Latitude", "Longitude", "Altitude", "Timezone"];
        headers.forEach(headerText => {
            const header = document.createElement("th");
            header.textContent = headerText;
            headerRow.appendChild(header);
        });
    
        limitedAirports.forEach(airport => {
            const row = table.insertRow();
            row.innerHTML = `
                <td>${airport.iata ? airport.iata.trim() : "N/A"}</td>
                <td>${airport.name}</td>
                <td>${airport.city.trim() !== "" ? airport.city : "N/A"}</td>
                <td>${airport.latitude.toFixed(2)}</td>
                <td>${airport.longitude.toFixed(2)}</td>
                <td>${airport.altitude}</td>
                <td>${airport.timezone ?? "N/A"}</td>
            `;
        });

        airportFilterDisplayDiv.appendChild(table);
    } else {
        airportFilterDisplayDiv.textContent = "No airports match the selected options.";
    }
}

// Find flights from pairs of airports
function flightsFromAirports(airport1, airport2) {
    return mergedData.filter(flight => {
        return (
            (flight.source_airport.name === airport1 && flight.destination_airport.name === airport2) || 
            (flight.source_airport.name === airport2 && flight.destination_airport.name === airport1)
        );
    })
}

// Calculate new characteristics
function airportPairs(mergedData) {
    const airportPairsData = [];
    const uniquePairs = new Set();

    // calculate time difference between airports
    function calculateTimeDifference(airport1, airport2) {
        const sourceAirport = airport1.timezone;
        const destinationAirport = airport2.timezone;
        return Math.abs(sourceAirport - destinationAirport);
    }

    for (let i = 0; i < mergedData.length; i++) {
        const airport1 = mergedData[i].source_airport;
    
        for (let j = i + 1; j < mergedData.length; j++) {
            const airport2 = mergedData[j].destination_airport;
    
            // ensure airports arent the same for source and destination
            if (airport1.id !== airport2.id) {
                const pair = [airport1.id, airport2.id].sort().join('-');
                
                if (!uniquePairs.has(pair)) {
                    const flights = flightsFromAirports(airport1.name, airport2.name);
                    const numFlights = flights.length;
                    const timeDiff = calculateTimeDifference(airport1, airport2);

                    // create pair object
                    const airport1Data = airportData.find(airport => airport.id === airport1.id);
                    const airport2Data = airportData.find(airport => airport.id === airport2.id);

                    airportPairsData.push({
                        ID: `${airport1.id}-${airport2.id}`,
                        Airport1: {
                            Name: airport1Data.name,
                            IATA: airport1Data.iata,
                            ID: airport1Data.id
                        },
                        Airport2: {
                            Name: airport2Data.name,
                            IATA: airport2Data.iata,
                            ID: airport2Data.id
                        },
                        Number_of_Flights: numFlights,
                        Time_Difference: timeDiff,
                    });
                    uniquePairs.add(pair);
                }
            }
        }
    }

    // filter out pairs with less than 1 flight
    const filteredAirportPairsData = airportPairsData.filter(pair => pair.Number_of_Flights >= 1);

    return filteredAirportPairsData;
}

function flightStats(filteredAirportPairsData) {

    // sort the airport pairs by the number of flights (descending order)
    const sortedAirportPairs = filteredAirportPairsData.sort((a, b) => b.Number_of_Flights - a.Number_of_Flights);

    const topTenPairs = sortedAirportPairs.slice(0, 10);

    // calculate min, max, and average number of flights
    const min = sortedAirportPairs[sortedAirportPairs.length - 1].Number_of_Flights;
    const max = sortedAirportPairs[0].Number_of_Flights;
    const sum = sortedAirportPairs.reduce((acc, pair) => acc + pair.Number_of_Flights, 0);
    const avg = sum / sortedAirportPairs.length;

    return {
        minimum: min,
        maximum: max,
        average: avg,
        topTen: topTenPairs,
    };
}

// function to display flight stats and top 10 busiest routes
function busyAirports(flightStatData) {
    const flightStatDisplayDiv = document.getElementById("flightStatDisplayDiv");

    flightStatDisplayDiv.innerHTML = "";

    // create elements to display flight stats
    const flightStatsElement = document.createElement("div");
    flightStatsElement.innerHTML = `
        <h3>Flight Frequency Information</h3>
        <h4>Flights Between Airports Statistics</h4>
        <p>Minimum Number of Flights: ${flightStatData.minimum}</p>
        <p>Maximum Number of Flights: ${flightStatData.maximum}</p>
        <p>Average Number of Flights: ${flightStatData.average.toFixed(2)}</p>
    `;

    // create elements to display top 10 busiest routes
    const topRoutesElement = document.createElement("div");
    topRoutesElement.innerHTML = `
        <h4>Top 10 Busiest Routes</h4>
        <ol>
            ${flightStatData.topTen.map((route, index) => `<li>${route.Airport1.Name} to ${route.Airport2.Name}: ${route.Number_of_Flights} flights</li>`).join("")}
        </ol>
    `;

    // append elements to the flightStatDisplayDiv
    flightStatDisplayDiv.appendChild(flightStatsElement);
    flightStatDisplayDiv.appendChild(topRoutesElement);
}
// Calculate the top 10, max, min and avg time differences
function timeStats(filteredAirportPairsData) {
    const sortedTime = filteredAirportPairsData.slice().sort((a, b) => b.Time_Difference - a.Time_Difference);

    const topTenTime = sortedTime.slice(0, 10);

    const min = sortedTime[sortedTime.length - 1].Time_Difference;
    const max = sortedTime[0].Time_Difference;
    const sum = sortedTime.reduce((total, pair) => total + pair.Time_Difference, 0)
    const avg = sum / sortedTime.length;

    return {
        minimum: min,
        maximum: max,
        average: avg,
        topTenTime: topTenTime,
    }
}

// function to display time stats and top 10 airports with biggest time difference
function farAirports(timeDiffStats) {
    const timeStatDisplayDiv = document.getElementById("flightStatDisplayDiv");

    timeStatDisplayDiv.innerHTML = "";

    const timeStatsElement = document.createElement("div");
    timeStatsElement.innerHTML = `
        <h3>Timezone Difference Information</h3>
        <h4>Time Differences Between Airports Statistics</h4>
        <p>Minimum Time Difference: ${timeDiffStats.minimum} hours</p>
        <p>Maximum Time Difference: ${timeDiffStats.maximum} hours</p>
        <p>Average Time Difference: ${timeDiffStats.average.toFixed(2)} hours</p>
    `;

    const topTimeElement = document.createElement("div");
    topTimeElement.innerHTML = `
        <h4>Top 10 Greatest Time Differences Between Airports</h4>
        <ol>
            ${timeDiffStats.topTenTime.map((pair, index) => `<li>${pair.Airport1.Name} to ${pair.Airport2.Name}: ${pair.Time_Difference} hours</li>`).join("")}
        </ol>
    `;

    timeStatDisplayDiv.appendChild(timeStatsElement);
    timeStatDisplayDiv.appendChild(topTimeElement);
}

module.exports = {populateSourceAirportDropdown, populateDestinationAirportDropdown, populateAirlineDropdown, populateAircraftDropdown, populateCityDropdown, searchBox, onlyTen, filterFlights, displayMatchingFlights, displayFilteredFlights, filterAirports, filterAirportsSearch, displayMatchingAirports, displayFilteredAirports, busyAirports, farAirports};