/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var requestID = 0;
var busses = [];
var stopDistances = [];
var busRequestsPending = 0;
var menu;
var requestEntry = {
        title: 'Request',
        subtitle: 'Get bus-data'
      };
var locationLat;
var locationLon;
var UI = require('ui');
//var Vector2 = require('vector2');

/*
function responseToString(errorCode)
{
  var ret;
  switch (errorCode)
    {
      case -8010:
        ret = "getClosestStop";
        break;
      case -8011:
        ret = "selectRoad";
        break;
    }
  return (ret === null ? "" : ret);
}

function newBusRequest()
{
  requestID = null;
  requestBusData(0, "init");
}
*/

function getDistanceFromLatLonInKm(lat2,lon2) {
  var lat1 = locationLat;
  var lon1 = locationLon;
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

function distanceToMinutes(distance) {
  return distance * 10;
}

function requestBusData(sessionID, requestOperation, requestArgs, addTime)
{
  var outputFormat = "JSON";
  requestID = (requestID === null ? 0 : 1);
  var requestStr = "http://ding.eu/ding2/XML_DM_REQUEST?sessionID=" + sessionID + "&requestID=" + requestID + "&language=de&outputFormat=" + outputFormat + "&command=&execInst=normal&useRealtime=1&locationServerActive=1&anySigWhenPerfectNoOtherMatches=1&convertCorssingsITKernal2LocationServer=1&convertStopsPTKernel2LocationServer=1&convertCoord2LocationServer=1&anyMaxSizeHitList=50";
  var now = new Date();
  var location = "Pranger";
  if (addTime !== null && !addTime)
    {
      requestStr += "&itdDateDay=" + (now.getDate() < 10 ? "0" + now.getDate() : "" + now.getDate());
      requestStr += "&itdDateMonth=" + (now.getMonth() < 10 ? "0" + now.getMonth() : "" + now.getMonth());
      requestStr += "&itdDateYear=" + now.getFullYear().toString().substring(2,4);
      requestStr += "&itdTimeHour=" + (now.getHours() < 10 ? "0" + now.getHours() : "" + now.getHours());
      requestStr += "&itdTimeMinute=" + (now.getMinutes() < 10 ? "0" + now.getMinutes() : "" + now.getMinutes());
      requestStr += "&type_dm=any";
    }
  if (requestOperation === null || requestOperation == "init")
    {
      requestStr += "&name_dm=" + location;
    }
  else {
      requestArgs.forEach(function(element) {
        requestStr += "&" + element[0] + "=" + element[1];
      });
    }
  
  //console.log("Request: " + requestStr);
  
  httpRequest(requestStr, (requestOperation === null ? "init" : requestOperation));
}

function requestStops(latitude, longitude)
{
  locationLat = latitude;
  locationLon = longitude;
  
  var outputFormat = "JSON";
  var maxStops = 3;
  requestID = (requestID === null ? 0 : 1);
  var radius = 6000;
  var requestStr = "http://ding.eu/ding2/XML_COORD_REQUEST?outputFormat=" + outputFormat + "&coord=" + longitude + ":" + latitude + ":WGS84&mapNameOutput=WGS84&inclFilter=1&radius_1=" + radius + "&type_1=STOP&max=" + maxStops;
  
  //console.log("Stop Request: " + requestStr);
  
  httpRequest(requestStr, "getStops");
}

function getEntry(array, name)
{
  var ret;
  array.forEach(function(element) {
    if (element.name == name)
      {
        ret = element.value;
      }
  });
  return ret;
}

/*
function getEntryWhere(array, entryname, compareto)
{
  var ret;
  array.forEach(function(element) {
    if (element[entryname] !== null && element[entryname] == compareto)
      {
        ret = element;
      }
  });
  return (ret === null ? false : ret);
}

function getBestRoadFromList(roadList)
{
  var ret = [];
  for (var i = 0; i < roadList.length; i++)
    {
      if (roadList[i].best == 1)
        {
          ret = [i, roadList[i]];
        }
    }
  return ret;
}

function getIDString(id)
{
  return id + ":" + (id+1);
}

function initialRequest() {
  console.log("xhttp: state: " + this.readyState + ", status: "+ this.status);
  if (this.readyState == 4 && this.status == 200)
    {
      console.log("Response text: " + this.responseText);
      handleInitialRequest(JSON.parse(this.responseText));
    }
}

function selectRoad() {
  console.log("xhttp: state: " + this.readyState + ", status: "+ this.status);
  if (this.readyState == 4 && this.status == 200)
    {
      console.log("Response text: " + this.responseText);
      handleRoadSelectRequest(JSON.parse(this.responseText));
    }
}
*/

function getBusses() {
  //console.log("xhttp: state: " + this.readyState + ", status: "+ this.status);
  if (this.readyState == 4 && this.status == 200)
    {
      //console.log("Response text: " + this.responseText);
      if (this.status == 200)
        {
          handleGetBussesRequest(JSON.parse(this.responseText));
        }
      else
        {
          newEntry("Error", "Couldn't reach server");
        }
    }
}

function getStops() {
  //console.log("xhttp: state: " + this.readyState + ", status: "+ this.status);
  if (this.readyState == 4)
    {
      console.log("Response text: " + this.responseText);
      if (this.status == 200)
        {
          handleGetStopsRequest(JSON.parse(this.responseText));
        }
      else
        {
          newEntry("Error", "Couldn't reach server");
        }
    }
}

/*
function handleInitialRequest(response) {
  console.log("Response: " + JSON.stringify(response));
  var sessionID = getEntry(response.parameters, "sessionID");
  console.log("Session ID: " + sessionID);
  var bestStop = getBestRoadFromList(response.dm.points);
  var bestStopID = getIDString(bestStop[0]);
  requestBusData(sessionID, "selectRoad", [
    ["name_dm", bestStopID],
    ["nameState_dm", "list"]
  ]);
}

function handleRoadSelectRequest(response) {
  console.log("Response: " + JSON.stringify(response));
  var sessionID = getEntry(response.parameters, "sessionID");
  console.log("Session ID: " + sessionID);
  busses = [];
  response.dm.itdOdvAssignedStops.forEach(function(element){
  //var element = response.dm.itdOdvAssignedStops[0];
    console.log("Stop: " + element + ", Stop ID: " + element.stopID);
    requestBusData(0, "getBusses", [
      ["typeInfo_dm","stopID"],
      ["nameInfo_dm",element.stopID],
      ["deleteAssignedStops_dm", 1],
      ["mode", "direct"]
    ]);
    busRequestsPending++;
  });
}
*/

function handleGetBussesRequest(response) {
  console.log("Response: " + JSON.stringify(response));
  //console.log("Session ID: " + sessionID);
  var coords = stopDistances[response.dm.points.point.ref.id].split(",");
  var coordLat = parseInt(coords[1]) / 1000000;
  var coordLon = parseInt(coords[0]) / 1000000;
  var distance = getDistanceFromLatLonInKm(coordLat,coordLon);
  console.log("Stop lat: " + coordLat + ", Stop lon: " + coordLon + ", distance: " + distance);
  var departures = response.departureList !== null ? response.departureList : [];
  for (var i = 0; i < Math.max(departures.length,3); i++)
    {
      var bus = departures[i];
      busses.push([
        bus.nameWO,
        bus.countdown,
        bus.servingLine.number,
        bus.servingLine.direction,
        distance
      ]);
      busRequestsPending--;
    }
  if (busRequestsPending <= 0)
    {
      var busList = busListToEntries(busses);
      if (busList !== null && busList.length > 0)
        {
          updateMenuItems((busList !== null && busList.length > 0) ? busList : []);
        }
      else
        {
          newEntry("Error", "No busses found");
        }
    }
}

function handleGetStopsRequest(response)
{
  //console.log("Response: " + JSON.stringify(response));
  busses = [];
  stopDistances = [];
  busRequestsPending = 0;
  if (response.pins.length < 1)
    {
      newEntry("Error", "No nearby stops");
    }
  else
    {
      newEntry("Please wait...", "Requesting busses");
    }
  response.pins.forEach(function(element){
  //var element = response.dm.itdOdvAssignedStops[0];
    //console.log("Stop: " + element + ", Stop ID: " + element.id);
    //1000000
    //var coords = element.coords.split(",");
    //var coordLat = parseInt(coords[0]) / 1000000;
    //var coordLon = parseInt(coords[1]) / 1000000;
    //if (stopDistances[element.id.toString()] === null)
      //{
      //    stopDistances[element.id.toString()] = getDistanceFromLatLonInKm(coordLat,coordLon);
      //}
    stopDistances[element.id] = element.coords;
    requestBusData(0, "getBusses", [
      ["typeInfo_dm","stopID"],
      ["nameInfo_dm",element.id],
      ["deleteAssignedStops_dm", 1],
      ["mode", "direct"]
    ]);
    busRequestsPending++;
  });
  console.log(stopDistances);
  if (response.pins.length >= 1)
    {
      newEntry("Please wait...", "Getting busses");
    }
}

function busListToEntries(busList)
{
  busList.sort(function(a,b){
    return a[1]*distanceToMinutes(a[4]) - b[1]*distanceToMinutes(b[4]);
  });
  var itemList = [requestEntry];
  for (var i = 0; i < Math.min(10, busList.length); i++)
    {
      itemList.push({
        title: busList[i][2] + " " + busList[i][3],
        subtitle: (busList[i][1] <= 1 ? "(Arr./Dep.)" : "(" + (busList[i][1]-1) + " Min)") + " " + busList[i][0]
      });
    }
  return itemList;
}

function updateMenuItems(items)
{
  menu.items(0, items);
}

function httpRequest(requestStr, requestOperation)
{
  var xhttp = new XMLHttpRequest();
  /*
  if (requestOperation === null || requestOperation == "init")
    {
      xhttp.onreadystatechange = initialRequest;
    }
  else if (requestOperation == "selectRoad")
    {
      xhttp.onreadystatechange = selectRoad;
    }
  else
  */
  if (requestOperation == "getStops")
    {
      xhttp.onreadystatechange = getStops;
    }
  else if (requestOperation == "getBusses")
    {
      xhttp.onreadystatechange = getBusses;
    }
  xhttp.open("GET", requestStr, true);
  xhttp.send();
}

function newEntry(errorMsg, errorMsg2) {
  updateMenuItems([requestEntry,
    {
      title: errorMsg,
      subtitle: errorMsg2
    }
  ]);
}

function newBusMenu(busList) {
  var main = new UI.Menu({
  sections: [{
      items: [requestEntry]
    }]
  });
  menu = main;
  main.on('select', function(e) {
    //console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    //console.log('The item is titled "' + e.item.title + '"');
    
    if (e.itemIndex === 0 && e.sectionIndex === 0)
      {
        this.items(0,[requestEntry]);
        //requestBusData(0, "init");
        getPosAndRequestBusses(0, 10000);
      }
  });
  main.show();
}
newBusMenu([]);
//newBusRequest();

function getPosAndRequestBusses(retry, timeout)
{
  if (retry === 0) {
      newEntry("Please wait...", "Getting position");
    }
  else
    {
      newEntry("Please wait...", "Retrying position (" + retry + ")");
    }
  navigator.geolocation.getCurrentPosition(function(pos){
    console.log("Lat: " + pos.coords.latitude + ", Lon: " + pos.coords.longitude);
    newEntry("Please wait...", "Getting bus stops");
    requestStops(pos.coords.latitude, pos.coords.longitude);
  }, retry === 0 ? retryPos1 : (retry == 1 ? retryPos2 : positionError), {enableHighAccuracy: true, maximumAge: 10000, timeout: timeout});
}

function positionError(error)
{
  newEntry("Error", "Couldn't get location");
}
function retryPos1(error)
{
  getPosAndRequestBusses(1, 5000);
}
function retryPos2(error)
{
  getPosAndRequestBusses(2, 2500);
}

getPosAndRequestBusses(0, 10000);