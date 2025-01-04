const fs = require("fs");
const {readAirportData, readFlightData, mergeFlightData, mapData, displayFlightInfo, airportSource, airportDestination, airlineName, codeshareStatus, aircraftType, flightsFromAirports, airportPairs, flightStats, timeStats} = require('./A2.js');

describe("Testing the readAirportData function", () => {
    // Test case 1.1
    test("readAirportData will return lengthy array", () => {
        const airportData = readAirportData();
        expect(Array.isArray(airportData)).toBe(true);
        expect(airportData.length).toBeGreaterThan(0);
    })

    // Test case 1.2
    test("readAirportData will return array of objects", () => {
        const airportData = readAirportData();
        expect(typeof airportData).toBe("object");
    })

    // Test case 1.3
    test("readAirportData returns error message if file does not exist", () => {
        jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
            throw new Error('File not found');
        });
        const result = readAirportData();
        expect(result).toContain("Error processing JSON file") ;
    })
})

describe("Testing the readFlightsData function", () => {
    // Test case 2.1
    test("readFlightData returns empty array if input array is empty", () => {
        const emptyJson = "[]";
        jest.spyOn(fs, "readFileSync").mockReturnValue(emptyJson);
        const result = readFlightData();
        expect(result).toEqual([]); 
    })

    // Test case 2.2
    test("readFlightData returns error message if file cannot be parsed", () => {
        const invalidJson = '[{"airline": "SH", "source_airport": "ADL", "source_airport_id": 3341}{"airline": "SH", "source_airport": "BWT", "source_airport_id": 6338}]';
        jest.spyOn(fs, "readFileSync").mockReturnValue(invalidJson);
        const result = readFlightData();
        expect(result).toContain("Error processing JSON file"); 
    })
})

describe("Testing the mergeflightData function", () => {
    // Test case 3.1
    test("mergeflightData returns a new array of objects", () => {
        const flightData = [{"airline": "SH","source_airport": "BWT","source_airport_id": 6338,"destination_airport": "LST","destination_airport_id": 3337,"codeshare": false,"aircraft": ["Fairchild Swearingen Metroliner"],"airline_name": "Sharp Airlines","airline_country": "Australia"}];
        const airportData = [{"id": 6338,"name": "Wynyard Airport","city": "Burnie","country": "Australia","iata": "BWT","latitude": -40.9989013671875,"longitude": 145.731002807617,"altitude": 62,"timezone": 10},{"id": 3337,"name": "Launceston Airport","city": "Launceston","country": "Australia","iata": "LST","latitude": -41.54529953,"longitude": 147.214004517,"altitude": 562,"timezone": 10}];
        const mergedData = mergeFlightData(flightData, airportData);
        expect (typeof mergedData).toBe("object");
        expect(Array.isArray(mergedData)).toBe(true);
    })

    // Test case 3.2
    test("mergeflightData throws error if parameter is invalid", () => {
        const flightData = [{"airline": "SH","source_airport": "BWT","source_airport_id": 6338,"destination_airport": "LST","destination_airport_id": 3337,"codeshare": false,"aircraft": ["Fairchild Swearingen Metroliner"],"airline_name": "Sharp Airlines","airline_country": "Australia"}];
        const airportData = null;
        expect(() => mergeFlightData(flightData, airportData)).toThrow(TypeError);
    })
})

describe("Testing the mapData function", () => {
    // Test case 4.1
    test("mapData will map the data and return an array of objects", () => {
        const list = [{"airline": "SH","source_airport": "BWT","source_airport_id": 6338,"destination_airport": "LST","destination_airport_id": 3337,}]
        const modifier = data => data*2;
        const result = mapData(list, modifier);
        expect(typeof result).toBe("object");
        expect(Array.isArray(result)).toBe(true);
    })

    // Test case 4.2
    test("mapData will throw error if parameter is invalid", () => {
        const list = null;
        const modifier = "example";
        expect(() => mapData(list, modifier)).toThrow(TypeError);
    })
})

describe("Testing the displayFlightInfo function", () => {
    // Test case 5.1
    test("displayFlightInfo will return reformatted flight information for better display", () => {
        const flight = {
            source_airport: { name: "Adelaide International Airport" },
            destination_airport: { name: "Port Augusta Airport" },
            airline: { name: "Sharp Airlines" },
            aircraft: ["Fairchild Swearingen Metroliner"],
            codeshare: false
        };

        const expectedOutput = `Flight Info:
Source Airport: Adelaide International Airport
Destination Airport: Port Augusta Airport
Airline: Sharp Airlines
Aircraft: Fairchild Swearingen Metroliner
Codeshare: false`;
        
        const result = displayFlightInfo(flight);
        expect(result).toContain(expectedOutput);
    })
})

const sampleData = [{
    source_airport: {id: 3320,name: "Brisbane International Airport",city: "Brisbane",country: "Australia",iata: "BNE",latitude: -27.3841991424561,longitude: 153.117004394531,altitude: 13,timezone: 10},
    destination_airport: {id: 3351,name: "Perth International Airport",city: "Perth",country: "Australia",iata: "PER",latitude: -31.940299987793,longitude: 115.967002868652,altitude: 67,timezone: 8},
    airline: { code: "JQ", name: "Jetstar Airways", country: "Australia" },
    aircraft: [ "Airbus A320-100" ],
    codeshare: false
    },{
    source_airport: {id: 3322,name: "Cairns International Airport",city: "Cairns",country: "Australia",iata: "CNS",latitude: -16.885799408,longitude: 145.755004883,altitude: 10,timezone: 10},
    destination_airport: {id: 3321,name: "Gold Coast Airport",city: "Coolangatta",country: "Australia",iata: "OOL",latitude: -28.1644001007,longitude: 153.505004883,altitude: 21,timezone: 10},
    airline: { code: "JQ", name: "Jetstar Airways", country: "Australia" },
    aircraft: [ "Airbus A320-100" ],
    codeshare: false
    }];

describe("Testing the airportSource function", () => {
    // Test case 6.1
    test("airportSource returns flights from specified airport", () => {
        const brisbaneFlight = mapData(sampleData, airportSource("Brisbane International Airport"));
        const result = [{
            source_airport: {id: 3320,name: "Brisbane International Airport",city: "Brisbane",country: "Australia",iata: "BNE",latitude: -27.3841991424561,longitude: 153.117004394531,altitude: 13,timezone: 10},
            destination_airport: {id: 3351,name: "Perth International Airport",city: "Perth",country: "Australia",iata: "PER",latitude: -31.940299987793,longitude: 115.967002868652,altitude: 67,timezone: 8},
            airline: { code: "JQ", name: "Jetstar Airways", country: "Australia" },
            aircraft: [ "Airbus A320-100" ],
            codeshare: false
            }];
        expect(brisbaneFlight[0]).toEqual(expect.objectContaining(result[0]));
    })

    // Test case 6.2
    test("airportSource returns empty array when no flights match the specified airport", () => {
        const gcFlight = mapData(sampleData, airportSource("Gold Coast Airport"));
        expect(gcFlight).toEqual([]);
    })
})

describe("Testing the airportDestination function", () => {
    // Test case 7.1
    test("airportDestination returns array of objects", () => {
        const perthFlight = mapData(sampleData, airportDestination("Perth International Airport"));
        const result = [{
            source_airport: {id: 3320,name: "Brisbane International Airport",city: "Brisbane",country: "Australia",iata: "BNE",latitude: -27.3841991424561,longitude: 153.117004394531,altitude: 13,timezone: 10},
            destination_airport: {id: 3351,name: "Perth International Airport",city: "Perth",country: "Australia",iata: "PER",latitude: -31.940299987793,longitude: 115.967002868652,altitude: 67,timezone: 8},
            airline: { code: "JQ", name: "Jetstar Airways", country: "Australia" },
            aircraft: [ "Airbus A320-100" ],
            codeshare: false
            }];
        expect (typeof result).toBe("object");
        expect(Array.isArray(result)).toBe(true);
    })
})

describe("Testing the airlineName function", () => {
    // Test case 8.1
    test("airlineName returns flights operated by specified airline", () => {
        const jetstarFlight = mapData(sampleData, airlineName("Jetstar Airways"));
        const result = sampleData;
        expect(jetstarFlight).toEqual(result);
    })

    // Test case 8.2
    test("airlineName returns empty array when no airlines match the specified airline", () => {
        const qantasFlight = mapData(sampleData, airlineName("Qantas"));
        expect(qantasFlight).toEqual([]);
    })

    // Test case 8.3
    test("airlineName returns empty array when an invalid airline is specified", () => {
        const fakeFlight = mapData(sampleData, airlineName("Fake"));
        expect(fakeFlight).toEqual([]);
    })
})

describe("Testing the codeshareStatus function", () => {
    // Test case 9.1
    test("codeshareStatus returns flights that match the codeshare status", () => {
        const falseCodeshare = mapData(sampleData, codeshareStatus(false));
        const result = sampleData;
        expect(falseCodeshare).toEqual(result);
    })

    // Test case 9.2
    test("codeshareStatus returns empty array when no flights have the specified codeshare status", () => {
        const trueCodeshare = mapData(sampleData, codeshareStatus(true));
        expect(trueCodeshare).toEqual([]);
    })
})

describe("Testing the aircraftType function", () => {
    // Test case 10.1
    test("aircraftType returns flights that use the specified aircraft type", () => {
        const airbus320Flights = mapData(sampleData, aircraftType("Airbus A320-100"));
        const result = sampleData;
        expect(airbus320Flights).toEqual(result);
    })

    // Test case 10.2
    test("aircraftType returns empty array when no flights use the specified aircraft type", () => {
        const boeing717Flights = mapData(sampleData, aircraftType("Boeing 717"));
        expect(boeing717Flights).toEqual([]);
    })
})

describe("Testing the flightsFromAirports function", () => {
    // Test case 11.1
    test("flightsFromAirports returns an array of flights between two different airports", () => {
        const airport1 = "Horn Island Airport";
        const airport2 = "Cairns International Airport";
        const result = flightsFromAirports(airport1, airport2);
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
    })

    // Test case 11.2
    test("flightsFromAirports returns empty array when no flights are found between two airports", () => {
        const airport1 = "Brisbane International Airport";
        const airport2 = "Los Angeles Airport";
        const result = flightsFromAirports(airport1, airport2);
        expect(result).toEqual([]);
    })
})

describe("Testing the airportPairs function", () => {
    // Test case 12.1
    test("airportPairs should return data in the correct format", () => {
        const result = airportPairs(sampleData);
        expect(Array.isArray(result)).toBe(true);
        result.forEach(pair => {
            expect(pair).toHaveProperty("ID");
            expect(pair).toHaveProperty("Airport1");
            expect(pair).toHaveProperty("Airport2");
            expect(pair).toHaveProperty("Number_of_Flights");
            expect(pair).toHaveProperty("Time_Difference");
        });
    })

    // Test case 12.2
    test("airportPairs will return an empty array if no airport pairs have flights between them", () => {
        const fakeData = [{
            source_airport: {id: 5000,name: "Hollywood Airport",city: "Los Angeles",country: "America",iata: "LAX",latitude: -27.3841991424561,longitude: 153.117004394531,altitude: 13,timezone: 10},
            destination_airport: {id: 3351,name: "Perth International Airport",city: "Perth",country: "Australia",iata: "PER",latitude: -31.940299987793,longitude: 115.967002868652,altitude: 67,timezone: 8},
            airline: { code: "JQ", name: "Jetstar Airways", country: "Australia" },
            aircraft: [ "Airbus A320-100" ],
            codeshare: false
            }];
        const result = airportPairs(fakeData);
        expect(result).toEqual([]);
    })

    // Test case 12.3
    test("airportPairs should filter out pairs with less than one flight", () => {
        const result = airportPairs(sampleData);
        result.forEach(pair => {
            expect(pair.Number_of_Flights).toBeGreaterThanOrEqual(1);
        });
    })
})

const filteredSampleData = [{
    ID: "3339-3355",
    Airport1: { Name: "Melbourne International Airport", IATA: "MEL", ID: 3339 },
    Airport2: { Name: "Canberra International Airport", IATA: "CBR", ID: 3355 },
    Number_of_Flights: 6,
    Time_Difference: 0
  },{
    ID: "3320-4052",
    Airport1: { Name: "Brisbane International Airport", IATA: "BNE", ID: 3320 },
    Airport2: { Name: "Hervey Bay Airport", IATA: "HVB", ID: 4052 },
    Number_of_Flights: 2,
    Time_Difference: 0
  },{
    ID: "3322-3351",
    Airport1: { Name: "Cairns International Airport", IATA: "CNS", ID: 3322 },
    Airport2: { Name: "Perth International Airport", IATA: "PER", ID: 3351 },
    Number_of_Flights: 2,
    Time_Difference: 2
  }];

describe("Testing the flightStats function", () => {
    // Test case 13.1
    test("flightStats returns the min, max and avg no of flights between city pairs", () => {
        const result = flightStats(filteredSampleData);
        const expectedOutput = {
            "minimum": 2, 
            "maximum": 6, 
            "average": (6 + 2 + 2) / 3
        };
        expect(result).toEqual(expect.objectContaining(expectedOutput));
    })

    // Test case 13.2
    test("flightStats returns correct statistics when there is only one pair of airports", () => {
        const singlePairData = [{
            ID: "3320-3351",
            Airport1: { Name: "Brisbane International Airport", IATA: "BNE", ID: 3320 },
            Airport2: { Name: "Perth International Airport", IATA: "PER", ID: 3351 },
            Number_of_Flights: 2,
            Time_Difference: 2
        }];
        const result = flightStats(singlePairData);
        const expectedOutput = {
            "minimum": 2, 
            "maximum": 2, 
            "average": 2
        };
        expect(result).toEqual(expect.objectContaining(expectedOutput));
    });
})

describe("Testing the timeStats function", () => {
    // Test case 14.1
    test("timeStats returns the min, max and avg time differences between city pairs", () => {
        const result = timeStats(filteredSampleData);
        const expectedOutput = {
            "minimum": 0, 
            "maximum": 2, 
            "average": 2 / 3
        };
        expect(result).toEqual(expect.objectContaining(expectedOutput));
    })

    // Test case 14.2
    test("timeStats returns correct statistics when there is only one pair of airports", () => {
        const singlePairData = [{
            ID: "3320-3351",
            Airport1: { Name: "Brisbane International Airport", IATA: "BNE", ID: 3320 },
            Airport2: { Name: "Perth International Airport", IATA: "PER", ID: 3351 },
            Number_of_Flights: 2,
            Time_Difference: 2
        }];
        const result = timeStats(singlePairData);
        const expectedOutput = {
            "minimum": 2, 
            "maximum": 2, 
            "average": 2
        };
        expect(result).toEqual(expect.objectContaining(expectedOutput));
    });
})