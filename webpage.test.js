const {populateSourceAirportDropdown, populateDestinationAirportDropdown, populateAirlineDropdown, populateAircraftDropdown, populateCityDropdown, searchBox, onlyTen, filterFlights, displayMatchingFlights, displayFilteredFlights, filterAirports, filterAirportsSearch, displayMatchingAirports, displayFilteredAirports, busyAirports, farAirports} = require('./webpage.js');

describe("Testing the onlyTen function", () => {
    // Test case 1.1
    test("onlyTen will return the original list if <10 items long", () => {
        const list = [1, 2, 3, 4, 5];
        const results = onlyTen(list);
        expect(results).toEqual(list);
    })

    // Test case 1.2
    test("onlyTen will return the first 10 times if >10 items in list", () => {
        const list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
        const results = onlyTen(list);
        const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        expect(results).toEqual(expected);
    })

    // Test case 1.3
    test("onlyTen will return an empty array if the input list is empty", () => {
        const results = onlyTen([]);
        expect(results).toEqual([]);
    })
})

describe("DOM related tests", () => {
    const { JSDOM } = require("jsdom");
    const { window } = new JSDOM("<!DOCTYPE html><html><body></body></html>");
    global.window = window;
    global.document = window.document;

    // mock airportData
    const airportData = [
        { id: 1, name: 'Airport A' },
        { id: 2, name: 'Airport B' },
        { id: 3, name: 'Airport C' }
    ];

    // mock flightData
    const flightData = [
        { 
            airline: "QF",
            aircraft: ["Boeing 737-800 (winglets)","Boeing 717"]
        },
        {
            airline: "AA",
            aircraft: ["Airbus A320","Boeing 787-9 Dreamliner"]
        },
        {
            airline: "BA",
            aircraft: ["Boeing 747-400","Airbus A321"]
        }
    ];
    
    describe("Testing the populateSourceAirportDropdown function", () => {
        // Test case 2
        test("populateSourceAirportDropdown will display dropdown options in alphabetical order", () => {
            // Mock the DOM elements
            document.body.innerHTML = `
            <select id="filterSourceAirportSelect">
            <option value="previousOption">Previous Option</option>
            </select>`;
            const sourceAirportDropdown = document.getElementById("filterSourceAirportSelect");

            // call the function
            populateSourceAirportDropdown(airportData);

            // check if options are sorted alphabetically
            const options = Array.from(sourceAirportDropdown.options);
            const airportNames = airportData.map(airport => airport.name);
            const sortedAirportNames = airportNames.sort((a, b) => a.localeCompare(b));
            options.forEach((option, index) => {
                if (index > 0) {
                    expect(option.textContent).toBe(sortedAirportNames[index - 1]);
                }
            });
        })
    })

    describe("Testing the populateDestinationAirportDropdown function", () => {
        // Test case 3
        test("populateDestinationAirportDropdown will show 'any' as option for dropdown", () => {
            document.body.innerHTML = `
            <select id="filterDestinationAirportSelect">
            <option value="previousOption">Previous Option</option>
            </select>`;
            const destinationAirportDropdown = document.getElementById("filterDestinationAirportSelect");
    
            populateDestinationAirportDropdown(airportData);

            // check if default "Any" option is added
            expect(destinationAirportDropdown.firstChild.value).toBe("any");
            expect(destinationAirportDropdown.firstChild.textContent).toBe("Any");
        })
    })

    describe("Testing the populateAirlineDropdown function", () => {
        // Test case 4
        test("populateAirlineDropdown will clear previous selected options", () => {
            document.body.innerHTML = `
            <select id="filterAirlineSelect">
            <option value="previousOption">Previous Option</option>
            </select>`;
            const airlineDropdown = document.getElementById("filterAirlineSelect");
            populateAirlineDropdown(flightData);
            expect(airlineDropdown.innerHTML).not.toContain("Previous Option");
        })
    })

    describe("Testing the populateAircraftDropdown function", () => {
        // Test case 5
        test("populateAircraftDropdown will add only the default option if provided empty flight data", () => {
            document.body.innerHTML = `
            <select id="filterAircraftSelect">
            <option value="previousOption">Previous Option</option>
            </select>`;
            const aircraftDropdown = document.getElementById("filterAircraftSelect");
            populateAircraftDropdown([]);
            expect(aircraftDropdown.children.length).toBe(1); 
        })
    })

    describe("Testing the populateCityDropdown function", () => {
        // Test case 6
        test("populateCityDropdown will append new city options without duplicating existing ones on multiple calls", () => {
            document.body.innerHTML = `
            <select id="filterCitySelect">
            <option value="any">Any</option>
            </select>`;
            const cityDropdown = document.getElementById("filterCitySelect");

            // initial function call
            populateCityDropdown();
            const initialOptionCount = cityDropdown.options.length;

            // second function call 
            populateCityDropdown();
            const finalOptionCount = cityDropdown.options.length;

            // ensure that new city options are appended without duplicating existing ones
            expect(finalOptionCount).toBe(initialOptionCount); 
        })
    })

    describe("Testing the searchBox function", () => {
        
        // Test case 7
        test("searchBox filters options to show all cities when input value is empty", () => {
            document.body.innerHTML = `
            <input type="text" id="filterSearchTermInput" />
            <select id="filterCitySelect">
            <option value="sydney">Sydney</option>
            <option value="melbourne">Melbourne</option>
            <option value="brisbane">Brisbane</option>
            </select>`;
            const searchTermInput = document.getElementById("filterSearchTermInput");

            searchBox();

            // Check if options are filtered based on input value
            const sydneyOption = document.querySelector("#filterCitySelect option[value='sydney']");
            const melbourneOption = document.querySelector("#filterCitySelect option[value='melbourne']");
            const brisbaneOption = document.querySelector("#filterCitySelect option[value='brisbane']");

            expect(sydneyOption.style.display).toBe("");
            expect(melbourneOption.style.display).toBe("");
            expect(brisbaneOption.style.display).toBe("");
        })
    })

    describe("Testing the filterFlights function", () => {
        // Test case 8
        test("filterFlights returns an empty array if no criteria selected", () => {
            const filteredFlights = filterFlights("any", "any", "any", "any");
            expect(filteredFlights).toEqual([]);
        })
    })

    describe("Testing the displayMatchingFlights function", () => {
        // Test case 9
        test("displayMatchingFlights displays filtered flights correctly", () => {
            document.body.innerHTML = `
            <select id="filterSourceAirportSelect">
                <option value="SYD">Sydney Airport</option>
            </select>
            <select id="filterDestinationAirportSelect">
                <option value="MEL">Melbourne Airport</option>
            </select>
            <select id="filterAirlineSelect">
                <option value="QF">Qantas Airways</option>
            </select>
            <select id="filterAircraftSelect">
                <option value="B737">Boeing 737</option>
            </select>
            <div id="flightFilterDisplayDiv"></div>`;
        
            displayMatchingFlights();
            const flightFilterDisplayDivContent = document.getElementById("flightFilterDisplayDiv").innerHTML;
            expect(flightFilterDisplayDivContent.trim()).not.toBe("");
        })
    })

    describe("Testing the displayFilteredFlights function", () => {
        const limitedFlights = [
            {
                source_airport: { name: 'Airport A' },
                destination_airport: { name: 'Airport B' },
                airline: { name: 'Airline X' },
                aircraft: 'Aircraft Type'
            }
        ];
       
        // Test case 10
        test("displayFilteredFlights will populate div with flight information", () => {
            // mocking the flightFilterDisplayDiv
            document.body.innerHTML = '<div id="flightFilterDisplayDiv"></div>';
            const flightFilterDisplayDiv = document.getElementById('flightFilterDisplayDiv');
            displayFilteredFlights(limitedFlights);
            // check if flightFilterDisplayDiv contains the expected flight information
            expect(flightFilterDisplayDiv.innerHTML).toContain('Airport A');
            expect(flightFilterDisplayDiv.innerHTML).toContain('Airport B');
            expect(flightFilterDisplayDiv.innerHTML).toContain('Airline X');
            expect(flightFilterDisplayDiv.innerHTML).toContain('Aircraft Type');
        })
    })

    describe("Testing the filterAirports function", () => {
        // Test case 11
        test("filterAirports filters airports based on search term", () => {
            const airportData = [
                { id: 1, name: "Airport 1", city: "City 1" },
                { id: 2, name: "Airport 2", city: "City 2" },
                { id: 3, name: "Airport 3", city: "City 3" }
            ];
    
            // set up the selectedAirportCity
            const selectedAirportCity = "any";
            document.body.innerHTML = `<input type="text" id="filterSearchTermInput" value="Airport 1">`;

            const filteredAirports = filterAirports(selectedAirportCity);
            expect(filteredAirports.every(airport => airport.name.toLowerCase().includes("airport 1"))).toBe(true);
        })
    })

    describe("Testing the filterAirportsSearch function", () => {
        // Test case 12
        test("filterAirportsSearch returns empty array when search term doesn't match", () => {
            const airportData = [
                { id: 1, name: "Airport 1", city: "City 1" },
                { id: 2, name: "Airport 2", city: "City 2" },
                { id: 3, name: "Airport 3", city: "City 1" }
            ];
        
            // set search term that doesn't match any airport name
            const searchTerm = "XYZ";
            const result = filterAirportsSearch(searchTerm);
            expect(result).toEqual([]);
        })
    })

    describe("Testing displayMatchingAirports function", () => {
        // Test case 13
        test("displayMatchingAirports will update the airport filter display with filtered airports", () => {
            document.body.innerHTML = `
            <select id="filterCitySelect">
            <option value="sydney">Sydney</option>
            <option value="melbourne">Melbourne</option>
            <option value="brisbane">Brisbane</option>
            </select>
            <input type="text" id="filterSearchTermInput" value="Airport">
            <div id="airportFilterDisplayDiv"></div>`;

            displayMatchingAirports();
            const airportFilterDisplayDiv = document.getElementById("airportFilterDisplayDiv");
            expect(airportFilterDisplayDiv.innerHTML).not.toBe("");
        })
    })

    describe("Testing the displayFilteredAirports function", () => {
        // Test case 14
        test("displayFilteredAirports will display message that no airports match when theres no matches", () => {
            const limitedAirports = [];
            // mocking the airportFilterDisplayDiv
            document.body.innerHTML = '<div id="airportFilterDisplayDiv"></div>';
            const airportFilterDisplayDiv = document.getElementById("airportFilterDisplayDiv");
            displayFilteredAirports(limitedAirports);
            expect(airportFilterDisplayDiv.textContent).toBe("No airports match the selected options.");
        })
    })

    describe("Testing the busyAirports function", () => {
        // Test case 15
        test("busyAirports displays flight frequency stats and the top 10 busiest routes", () => {
            const flightStatData = {
                minimum: 10,
                maximum: 100,
                average: 55,
                topTen: [
                    { Airport1: { Name: "Airport A" }, Airport2: { Name: "Airport B" }, Number_of_Flights: 75 },
                    { Airport1: { Name: "Airport C" }, Airport2: { Name: "Airport D" }, Number_of_Flights: 60 },
                ]
            };
            document.body.innerHTML = '<div id="flightStatDisplayDiv"></div>';
            busyAirports(flightStatData);
            const flightStatDisplayDiv = document.getElementById("flightStatDisplayDiv");
            expect(flightStatDisplayDiv.innerHTML).toContain("Minimum Number of Flights: 10");
            expect(flightStatDisplayDiv.innerHTML).toContain("Maximum Number of Flights: 100");
            expect(flightStatDisplayDiv.innerHTML).toContain("Average Number of Flights: 55.00");
            expect(flightStatDisplayDiv.innerHTML).toContain("Airport A to Airport B: 75 flights");
            expect(flightStatDisplayDiv.innerHTML).toContain("Airport C to Airport D: 60 flights");
        });
    })

    describe("Testing the farAirports function", () => {
        // Test case 16
        test("farAirports displays time difference stats", () => {
            const timeDiffStats = {
                minimum: 2,
                maximum: 10,
                average: 6.5,
                topTenTime: [
                    { Airport1: { Name: "Airport X" }, Airport2: { Name: "Airport Y" }, Time_Difference: 8 },
                    { Airport1: { Name: "Airport Z" }, Airport2: { Name: "Airport W" }, Time_Difference: 7 },
                ]
            };
            document.body.innerHTML = '<div id="flightStatDisplayDiv"></div>';
            const timeStatDisplayDiv = document.getElementById("flightStatDisplayDiv");
            farAirports(timeDiffStats);
            expect(timeStatDisplayDiv.innerHTML).toContain("Minimum Time Difference: 2 hours");
            expect(timeStatDisplayDiv.innerHTML).toContain("Maximum Time Difference: 10 hours");
            expect(timeStatDisplayDiv.innerHTML).toContain("Average Time Difference: 6.50 hours");
            expect(timeStatDisplayDiv.innerHTML).toContain("Airport X to Airport Y: 8 hours");
            expect(timeStatDisplayDiv.innerHTML).toContain("Airport Z to Airport W: 7 hours");
        })
    })

    afterAll(() => {
        delete global.window;
        delete global.document;
    });
})