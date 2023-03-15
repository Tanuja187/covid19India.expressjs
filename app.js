const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "covid19India.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running on http://localhost:3000/");
    });
  } catch (error) {
    console.log(`Database Error is ${error}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API 1
//Returns a list of all states in the state table
const convertStateDbObject = (object) => {
  return {
    stateId: object.state_id,
    stateName: object.state_name,
    population: object.population,
  };
};

app.get("/states/", async (request, response) => {
  const getStatesListQuery = `SELECT * FROM state;`;
  const getStatesListQueryResponse = await database.all(getStatesListQuery);
  response.send(
    getStatesListQueryResponse.map((eachState) =>
      convertStateDbObject(eachState)
    )
  );
});

//API 2
//Returns a state based on the state ID
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStatesListByIdQuery = `SELECT * FROM state WHERE state_id =${stateId};`;
  const getStatesListByIdQueryResponse = await database.get(
    getStatesListByIdQuery
  );
  response.send(convertStateDbObject(getStatesListByIdQueryResponse));
});

//API 3
//Create a district in the district table, district_id is auto-incremented
app.post("/districts/", async (request, response) => {
  const { directorName, stateId, cases, cured, active, deaths } = request.body;
  const createDistrictQuery = `Insert into district (district_name, state_id,cases,cured,active,deaths) 
    values('${districtName}',${stateId},${cases},${cured},${active},${deaths});`;
  const createDistrictQueryResponse = await database.run(createDistrictQuery);
  response.send("District successfully Added");
});

//API 4
//Returns a district based on the district ID
const convertDbObjectAPI4 = (object) => {
  return {
    districtId: object.district_id,
    districtName: object.district_name,
    stateId: object.state_id,
    cases: object.cases,
    cured: object.cured,
    active: object.active,
    deaths: object.deaths,
  };
};

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictByIdQuery = `SELECT * FROM district WHERE district_id=${districtId};`;
  const getDistrictByIdQueryResponse = await database.get(getDistrictByIdQuery);
  response.send(convertDbObjectAPI4(getDistrictByIdQueryResponse));
});

//API 5
//Deletes a district from the district table based on the district ID
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `delete from district where district_id=${districtId};`;
  const deleteDistrictQueryResponse = await database.run(deleteDistrictQuery);
  response.send("District Removed");
});

//API 6
//Updates the details of a specific district based on the district ID
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const updateDistrictQuery = `update district set 
    district_name ='${district_name}',
    state_id = ${stateId},
    cases = ${cases},
    cured = ${cured},
    active = ${active},
    deaths = ${deaths}, 
    where district_id = ${districtId};`;
  const updateDistrictQueryResponse = await database.run(updateDistrictQuery);
  response.send("District Details Updated");
});

//API 7
//Returns the statistics of totalCases,cured,active,deaths of a specific state based on state ID
app.get("/states/:statesId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStateByIdStatsQuery = `select sum(cases) AS totalCases,
    sum(cured) AS totalCured,sum(active) AS totalActive,sum(deaths) AS totalDeaths 
    from district where state_id=${stateId};`;
  const getStateByIdStatsQueryResponse = await database.get(
    getStateByIdStatsQuery
  );
  response.send(getStateByIdStatsQueryResponse);
});

//API 8
//Returns an object containing the state name of a district based on the district ID
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictIdQuery = `select state_id from district 
    where district_id=${districtId};`;
  const getDistrictIdQueryResponse = await database.get(getDistrictIdQuery);
  //console.log(typeof getDistrictIdQueryResponse.state_id);
  const getStateNameQuery = `select state_name AS stateName from state where state_id=${getDistrictIdQueryResponse.state_id}`;
  const getStateNameQueryResponse = await database.get(getStateNameQuery);
  response.send(getDistrictIdQueryResponse);
});

module.exports = app;
