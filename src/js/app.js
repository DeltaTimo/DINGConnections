/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
//var Vector2 = require('vector2');

function requestBusData(sessionID)
{
  var outputFormat = "JSON";
  var requestStr = "http://ding.eu/ding2/XML_DM_REQUEST?sessionID=" + sessionID + "&requestID=0&language=de&outputFormat=" + outputFormat + "&command=&execInst=normal&useRealtime=1&locationServerActive=1&anySigWhenPerfectNoOtherMatches=1&convertCorssingsITKernal2LocationServer=1&convertStopsPTKernel2LocationServer=1&convertCoord2LocationServer=1&anyMaxSizeHitList=50";
  var now = new Date();
  var location = "Universitat Ulm";
  requestStr += "&itdDateDay=" + (now.getDay() < 10 ? "0" + now.getDay() : "" + now.getDay());
  requestStr += "&itdDateMonth=" + (now.getMonth() < 10 ? "0" + now.getMonth() : "" + now.getMonth());
  requestStr += "&itdDateYear=" + now.getFullYear().toString().substring(2,4);
  requestStr += "&itdTimeHour=" + (now.getHours() < 10 ? "0" + now.getHours() : "" + now.getHours());
  requestStr += "&itdTimeMinute=" + (now.getMinutes() < 10 ? "0" + now.getMinutes() : "" + now.getMinutes());
  requestStr += "&type_dm=any";
  requestStr += "&name_dm=" + location;
  
  console.log(requestStr);
  
  httpBusRequest(requestStr);
}

function initialRequest() {
  console.log("xhttp: state: " + this.readyState + ", status: "+ this.status);
  if (this.readyState == 4 && this.status == 200)
    {
      console.log(this.responseText);
      handleInitialRequest(JSON.parse(this.responseText));
    }
}

function handleInitialRequest(response) {
  console.log("Response: " + response);
  var sessionID = response.parameters.sessionID;
  console.log("Session ID: " + sessionID);
}

function httpBusRequest(requestStr)
{
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = initialRequest;
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
requestBusData(0);

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
