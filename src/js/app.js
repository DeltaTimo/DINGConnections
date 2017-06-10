/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var requestID = 0;
var busses = [];
var busRequestsPending = 0;
var menu;
var requestEntry = {
        title: 'Request',
        subtitle: 'Get bus-data'
      };
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

function requestBusData(sessionID, requestOperation, requestArgs, addTime)
{
  var outputFormat = "JSON";
  requestID = (requestID === null ? 0 : 1);
  var requestStr = "http://ding.eu/ding2/XML_DM_REQUEST?sessionID=" + sessionID + "&requestID=" + requestID + "&language=de&outputFormat=" + outputFormat + "&command=&execInst=normal&useRealtime=1&locationServerActive=1&anySigWhenPerfectNoOtherMatches=1&convertCorssingsITKernal2LocationServer=1&convertStopsPTKernel2LocationServer=1&convertCoord2LocationServer=1&anyMaxSizeHitList=50";
  var now = new Date();
  var location = "Pranger";
  if (addTime !== null && !addTime)
    {
      requestStr += "&itdDateDay=" + (now.getDay() < 10 ? "0" + now.getDay() : "" + now.getDay());
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
  var outputFormat = "JSON";
  var maxStops = 3;
  requestID = (requestID === null ? 0 : 1);
  var requestStr = "http://ding.eu/ding2/XML_COORD_REQUEST?outputFormat=" + outputFormat + "&coord=" + longitude + ":" + latitude + ":WGS84&mapNameOutput=WGS84&inclFilter=1&radius_1=3000&type_1=STOP&max=" + maxStops;
  
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
      //console.log("Response text: " + this.responseText);
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
  //console.log("Response: " + JSON.stringify(response));
  var sessionID = getEntry(response.parameters, "sessionID");
  //console.log("Session ID: " + sessionID);
  var departures = response.departureList !== null ? response.departureList : [];
  for (var i = 0; i < Math.max(departures.length,3); i++)
    {
      var bus = departures[i];
      busses.push([
        bus.nameWO,
        bus.countdown,
        bus.servingLine.number,
        bus.servingLine.direction
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
    requestBusData(0, "getBusses", [
      ["typeInfo_dm","stopID"],
      ["nameInfo_dm",element.id],
      ["deleteAssignedStops_dm", 1],
      ["mode", "direct"]
    ]);
    busRequestsPending++;
  });
  if (response.pins.length >= 1)
    {
      newEntry("Please wait...", "Getting busses");
    }
}

function busListToEntries(busList)
{
  busList.sort(function(a,b){
    return a[1] - b[1];
  });
  var itemList = [requestEntry];
  for (var i = 0; i < Math.min(10, busList.length); i++)
    {
      itemList.push({
        title: busList[i][2] + " " + busList[i][3],
        subtitle: "(" + busList[i][1] + "min) " + busList[i][0]
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