// IFQ714 Introduction to JavaScript Programming
// Assignment 2: Programming project

// STEP 1: LOADING JSON DATA
const fs = require('fs');

// Read airport data from JSON file
function readAirportData() {
    try {
        const data = fs.readFileSync("A2_Airports.json", "utf8");
        return JSON.parse(data);
    } catch (error) {
        return "Error processing JSON file: " + error.message;
    }
}
const airportData = readAirportData();

// Read flight data from JSON file
function readFlightData() {
    try {
        const data = fs.readFileSync("A2_Flights.json", "utf8");
        return JSON.parse(data);
    } catch (error) {
        return "Error processing JSON file: " + error.message;
    }
}
const flightData = readFlightData();

// Merge both sets of data and return new array
function mergeFlightData(flightData, airportData) {
    return flightData.map(flight => {
        const sourceAirport = airportData.find(airport => airport.id === flight.source_airport_id);
        const destinationAirport = airportData.find(airport => airport.id === flight.destination_airport_id);
        const airlineNew = {
            code: flight.airline,
            name: flight.airline_name,
            country: flight.airline_country
        };

        return {
            source_airport: sourceAirport,
            destination_airport: destinationAirport,
            airline: airlineNew,
            aircraft: flight.aircraft,
            codeshare: flight.codeshare
        }
    })
}
const mergedData = mergeFlightData(flightData, airportData);
console.log(mergedData);

// STEP 2: MAPPING FUNCTION FOR DATA WITH TIMESTAMP
// This should include a function parameter
function mapData(list, modifier) {
    const copy = [];
    const timestamp = new Date().toISOString();
    for (let item of list) {
        const modified = modifier(item);
        if (modified) {
            modified.last_modified = timestamp;
            copy.push(modified)
        }
    } 
    return copy;
}

// STEP 3: DATA ANALYSIS
// display information on flights in the dataset
function displayFlightInfo(flight) {
    return `Flight Info:
Source Airport: ${flight.source_airport.name}
Destination Airport: ${flight.destination_airport.name}
Airline: ${flight.airline.name}
Aircraft: ${flight.aircraft.join(', ')}
Codeshare: ${flight.codeshare}`;
}
const showFlight = displayFlightInfo(mergedData[0]); // display flight at index 0
console.log(showFlight);

// query source airport 
function airportSource(airportName) {
    return function(flight) {
        if (flight.source_airport.name === airportName) {
            return flight;
        }
        return undefined;
    }
}
const brisbaneFlights = mapData(mergedData, airportSource("Brisbane International Airport")); // flights that originate from Brisbane Int Airport
console.log(brisbaneFlights);

// query destination airport 
function airportDestination(airportName) {
    return function(flight) {
        if (flight.destination_airport.name === airportName) {
            return flight;
        }
        return undefined;
    }
}
const perthFlights = mapData(mergedData, airportDestination("Perth International Airport")); // flights to Perth Int Airport
console.log(perthFlights);

// query airline
function airlineName(airlineName) {
    return function(flight) {
        if (flight.airline.name === airlineName) {
            return flight;
        }
        return undefined;
    }
}
const virginFlight = mapData(mergedData, airlineName("Virgin Australia")); // flights operated by Virgin Australia
console.log(virginFlight);

// query codeshare status
function codeshareStatus(status) {
    return function(flight) {
        if (flight.codeshare === status) {
            return flight;
        }
        return undefined;
    }
}
const trueCodeshare = mapData(mergedData, codeshareStatus(true)); // flights that are true for codeshare status
console.log(trueCodeshare);

// query aircraft type
function aircraftType(type) {
    return function(flight) {
        if (flight.aircraft.includes(type)) {
            return flight;
        }
        return undefined;
    }
}
const boeing717Flights = mapData(mergedData, aircraftType("Boeing 717")); // flights that use Boeing 717 aircrafts
console.log(boeing717Flights);

// Calculate new characteristics
// Find flights from pairs of airports
function flightsFromAirports(airport1, airport2) {
    return mergedData.filter(flight => {
        return (
            (flight.source_airport.name === airport1 && flight.destination_airport.name === airport2) || 
            (flight.source_airport.name === airport2 && flight.destination_airport.name === airport1)
        );
    })
}

// Create an array of JSON objects which contain an ID, the ID and IATA code for two pairs of airports, the number of flights between them and time difference
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
                        Time_Difference: timeDiff
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
const filteredAirportPairsData = airportPairs(mergedData, airportData);
console.log(filteredAirportPairsData);

// Calculate the average, minimum and maximum values based on flights
function flightStats(filteredAirportPairsData) {

    // sort the airport pairs by the number of flights (descending order)
    const sortedAirportPairs = filteredAirportPairsData.sort((a, b) => b.Number_of_Flights - a.Number_of_Flights);

    const topTenPairs = sortedAirportPairs.slice(0, 10);

    // salculate min, max, and average number of flights and top 10
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
const flightStatData = flightStats(filteredAirportPairsData);
console.log(flightStatData);
console.log(flightStatData.topTen);

// Which pairs have the greatest time difference? 
// calculate the top 10, max, min and avg time differences and top 10
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
const timeDiffStats = timeStats(filteredAirportPairsData);
console.log(timeDiffStats);
console.log(timeDiffStats.topTenTime);

// Step 5: Unit tests
module.exports = {readAirportData, readFlightData, mergeFlightData, mapData, displayFlightInfo, airportSource, airportDestination, airlineName, codeshareStatus, aircraftType, flightsFromAirports, airportPairs, flightStats, timeStats};