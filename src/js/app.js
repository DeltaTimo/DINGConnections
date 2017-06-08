/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var requestID = 0;
var UI = require('ui');
//var Vector2 = require('vector2');

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
  requestBusData(0);
}

function requestBusData(sessionID, requestOperation, requestArgs)
{
  var outputFormat = "JSON";
  requestID = (requestID === null ? 0 : requestID + 1);
  var requestStr = "http://ding.eu/ding2/XML_DM_REQUEST?sessionID=" + sessionID + "&requestID=" + requestID + "&language=de&outputFormat=" + outputFormat + "&command=&execInst=normal&useRealtime=1&locationServerActive=1&anySigWhenPerfectNoOtherMatches=1&convertCorssingsITKernal2LocationServer=1&convertStopsPTKernel2LocationServer=1&convertCoord2LocationServer=1&anyMaxSizeHitList=50";
  var now = new Date();
  var location = "Universitat Ulm";
  requestStr += "&itdDateDay=" + (now.getDay() < 10 ? "0" + now.getDay() : "" + now.getDay());
  requestStr += "&itdDateMonth=" + (now.getMonth() < 10 ? "0" + now.getMonth() : "" + now.getMonth());
  requestStr += "&itdDateYear=" + now.getFullYear().toString().substring(2,4);
  requestStr += "&itdTimeHour=" + (now.getHours() < 10 ? "0" + now.getHours() : "" + now.getHours());
  requestStr += "&itdTimeMinute=" + (now.getMinutes() < 10 ? "0" + now.getMinutes() : "" + now.getMinutes());
  requestStr += "&type_dm=any";
  if (requestOperation === null || requestOperation == "init")
    {
      requestStr += "&name_dm=" + location;
    }
  else if (requestOperation == "selectRoad")
    {
      requestArgs.forEach(function(element) {
        requestStr += "&" + element[0] + "=" + element[1];
      });
    }
  
  console.log("Request: " + requestStr);
  
  httpRequest(requestStr, requestOperation);
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
          ret = [i,roadList[i]];
        }
    }
}

function getIDString(id, entry)
{
  var ret = "";
  switch (entry.anyType)
    {
      case "stop":
        ret += "0";
        break;
      case "loc":
        ret += "1";
        break;
      case "street":
        ret += "2";
        break;
    }
  ret += ":";
  ret += id;
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

function handleInitialRequest(response) {
  console.log("Response: " + JSON.stringify(response));
  var sessionID = getEntry(response.parameters, "sessionID");
  console.log("Session ID: " + sessionID);
  var bestStop = getBestRoadFromList(response.dm.points);
  var bestStopID = getIDString(bestStop[0], bestStop[1]);
  requestBusData(sessionID, "selectRoad", [
    ["name_dm", bestStopID]
  ]);
}

function handleRoadSelectRequest(response) {
  console.log("Response: " + JSON.stringify(response));
  var sessionID = getEntry(response.parameters, "sessionID");
  console.log("Session ID: " + sessionID);
}

function httpRequest(requestStr, requestOperation)
{
  var xhttp = new XMLHttpRequest();
  if (requestOperation === null || requestOperation == "init")
    {
      xhttp.onreadystatechange = initialRequest;
    }
  else if (requestOperation == "selectRoad")
    {
      xhttp.onreadystatechange = selectRoad;
    }
  xhttp.open("GET", requestStr, true);
  xhttp.send();
}

var main = new UI.Menu({
sections: [{
    items: [{
      title: 'Request',
      icon: 'images/menu_icon.png',
      subtitle: 'Get bus-data'
    }]
  }]
});
main.on('select', function(e) {
  console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
  console.log('The item is titled "' + e.item.title + '"');
  
  if (e.itemIndex === 0 && e.sectionIndex === 0)
    {
      requestBusData(0);
    }
});
main.show();
newBusRequest();

/*
var main = new UI.Card({
  title: 'Pebble.js',
  icon: 'images/menu_icon.png',
  subtitle: 'Hello World!',
  body: 'Press any button.',
  subtitleColor: 'indigo', // Named colors
  bodyColor: '#9a0036' // Hex colors
});

main.show();
*/

/*
main.on('click', 'up', function(e) {
  var menu = new UI.Menu({
    sections: [{
      items: [{
        title: 'Request',
        icon: 'images/menu_icon.png',
        subtitle: 'Get bus-data'
      }, {
        title: 'Second Item',
        subtitle: 'Subtitle Text'
      }, {
        title: 'Third Item',
      }, {
        title: 'Fourth Item',
      }]
    }]
  });
  menu.on('select', function(e) {
    console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '"');
  });
  menu.show();
});
*/

/*
main.on('click', 'select', function(e) {
  var wind = new UI.Window({
    backgroundColor: 'black'
  });
  var radial = new UI.Radial({
    size: new Vector2(140, 140),
    angle: 0,
    angle2: 300,
    radius: 20,
    backgroundColor: 'cyan',
    borderColor: 'celeste',
    borderWidth: 1,
  });
  var textfield = new UI.Text({
    size: new Vector2(140, 60),
    font: 'gothic-24-bold',
    text: 'Dynamic\nWindow',
    textAlign: 'center'
  });
  var windSize = wind.size();
  // Center the radial in the window
  var radialPos = radial.position()
      .addSelf(windSize)
      .subSelf(radial.size())
      .multiplyScalar(0.5);
  radial.position(radialPos);
  // Center the textfield in the window
  var textfieldPos = textfield.position()
      .addSelf(windSize)
      .subSelf(textfield.size())
      .multiplyScalar(0.5);
  textfield.position(textfieldPos);
  wind.add(radial);
  wind.add(textfield);
  wind.show();
});

main.on('click', 'down', function(e) {
  var card = new UI.Card();
  card.title('A Card');
  card.subtitle('Is a Window');
  card.body('The simplest window type in Pebble.js.');
  card.show();
});
*/
