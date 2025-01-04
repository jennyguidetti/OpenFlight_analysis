// Fetch airport and flight data when the page loads
window.onload = async function () {
    await fetchAirportData();
    await fetchFlightData();
    // Event listeners for flights data dropdown boxes when changed
    document.getElementById("filterSourceAirportSelect").addEventListener("change", displayMatchingFlights);
    document.getElementById("filterDestinationAirportSelect").addEventListener("change", displayMatchingFlights);
    document.getElementById("filterAirlineSelect").addEventListener("change", displayMatchingFlights);
    document.getElementById("filterAircraftSelect").addEventListener("change", displayMatchingFlights);

    // Event listeners for airport data dropdown box and search bar
    document.getElementById("filterCitySelect").addEventListener("change", displayMatchingAirports);
    document.getElementById("filterSearchTermInput").addEventListener("input", displayMatchingAirports);

    // Event listener for the button to show busy airports
    document.getElementById("flightButton").addEventListener("click", function() {
        // Get flight statistics and display busy airports
        const filteredAirportPairsData = airportPairs(mergedData, airportData);
        const flightStatData = flightStats(filteredAirportPairsData);
        busyAirports(flightStatData);
    });

    // Event listener for the button to show greatest time difference
    document.getElementById("timeButton").addEventListener("click", function() {
        // Get flight statistics and display time diff
        const filteredAirportPairsData = airportPairs(mergedData, airportData);
        const timeDiffStats = timeStats(filteredAirportPairsData);
        farAirports(timeDiffStats);
    });
};