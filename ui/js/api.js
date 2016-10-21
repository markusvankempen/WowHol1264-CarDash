/*
 * Copyright © 2016 I.B.M. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the “License”);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an “AS IS” BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* The Api module is designed to handle all interactions with the server */

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^Api$" }] */
var mysocket = null;
 var myaftime = null;
 var myconnected = "offline"; 
 var myled = "off"; 
  var mybuttcnt  = 0; 
  var myName="";
  var wsUri = 'ws://wowhol1264t06.mybluemix.net/toCarDashboard';  ###ADJUST
var Api = (function() {
  'use strict';
  var userPayload;
  var watsonPayload;
  var context;
  
 
  var messageEndpoint = '/api/message';

  // Publicly accessible methods defined
  return {
    initConversation: initConversation,
    postConversationMessage: postConversationMessage,

    // The request/response getters/setters are defined here to prevent internal methods
    // from calling the methods without any of the callbacks that are added elsewhere.
    getUserPayload: function() {
      return userPayload;
    },
    setUserPayload: function(payload) {
      userPayload = payload;
    },
    getWatsonPayload: function() {
      return watsonPayload;
    },
    setWatsonPayload: function(payload) {
      watsonPayload = payload;
    }
  };

  // Function used for initializing the conversation with the first message from Watson
  function initConversation() {
    postConversationMessage('');
    //Api.setWatsonPayload({output: {text: ['Hello Markus.... just checking' ]}});
  //  postConversationMessage('Update'); // user messahe
     wsConnect();
    
/* WebSocket
mysocket = new WebSocket( 'ws://wownr.mybluemix.net/blinkupdate');  
mysocket.addEventListener( 'message', doSocketMessage );
mysocket.addEventListener( 'message', doSocketMessage );
// Message
function doSocketMessage( message ) {  
  var data = null;

  // Parse
  data = JSON.parse( message.data );
  console.log("ws data received"+data);
  //displayMessage({'output': { 'text': data.d.text}},authorTypes.watson);
   Api.setWatsonPayload({output: {text: [  data.d.text ]}});
}

*/
}

 function wsConnect() {
            console.log("connect to "+wsUri);
            mysocket = new WebSocket(wsUri);
            mysocket.onmessage = function(msg) {
               var data = null;
               var shoulditalk=false;
			  data = JSON.parse( msg.data );
  				console.log("ws data received:"+JSON.stringify(data));
  			//displayMessage({'output': { 'text': data.d.text}},authorTypes.watson);
   			   
   			if (data.d.task.toLowerCase() == "spray")
           	{
           		shoulditalk=data.d.speak;
           				 Panel.af('af');
                     	 //Panel.meOFF('af');  
			}
			
   			if (data.d.task.toLowerCase() == "led")
           	{
           		shoulditalk=data.d.speak;
           		if (data.d.dir.toLowerCase() == "on")
           		{
 					myconnected =  "online"; 
           		 	myled = "on"; 
           		 	Panel.af('afledon');
           		}else{
           		  myled =  "off"; 
           		  	Panel.af('afledoff');
       		  }

           		
           		  myaftime = new Date().getTime(); 
			}
			
			if (data.d.task.toLowerCase() == "button")
           	{
           		shoulditalk=data.d.speak;
           		 myconnected = "online";  
           		 mybuttcnt =  data.d.count;
           		  	Panel.af('afbutton');
			}
			
			if (data.d.task.toLowerCase() == "update") /// update context
			{
				shoulditalk=data.d.speak;
				 myconnected =  data.d.connected; 
           	 	 myled       =  data.d.led;
            	 mybuttcnt   =  data.d.count;
            	 if(data.d.myName !="")
           	 	 myName      =  data.d.myName;
           	 	 
           	 	
           	 	 if (typeof(data.d.context) != "undefined")
           	 	 {
           	 	 	
           	 	 	context.NR = data.d.context;
           	 	 	console.log("Setting dynamic NR context:"+JSON.stringify(data.d.context));
           	 	 }
           	 	 
           	 	 
			}
			
			if (data.d.task.toLowerCase() == "status")
           	{
           		shoulditalk=data.d.speak;
           		if (data.d.dir.toLowerCase() == "on")
           		{
           		 	myconnected = "online"; 
           		 	 	Panel.af('afonline');
           		}else{
           		   myconnected = "offline"; 
           		   	Panel.af('afoffline');
       			}

           	  myaftime = new Date().getTime(); 
           	  /*var _initial = '2015-05-21T10:17:28.593Z';
var fromTime = new Date(_initial);
var toTime = new Date();

var differenceTravel = toTime.getTime() - fromTime.getTime();
var seconds = Math.floor((differenceTravel) / (1000));
document.write('+ seconds +');
*/
			}
			//  talk
			if(shoulditalk)
			Api.setWatsonPayload({output: {text: [  data.d.text ]}});

            }//message
            mysocket.onopen = function() {

                console.log("connected to "+wsUri );
            }
			mysocket.onclose = function() {
                setTimeout(wsConnect,3000);
            }
        }//wsConnect

  // Send a message request to the server
  function postConversationMessage(text) {
    var data = {'input': {'text': text}};
    if (context) {
      context.myconnected = myconnected; // set connext
	  context.myled       = myled; 
      context.mybuttcnt   = mybuttcnt; 
      if(myName !="")
      context.myName     =  myName;
      data.context        = context;
      console.log("context2 = "+JSON.stringify(context));
    }
    Api.setUserPayload(data);
    var http = new XMLHttpRequest();
    http.open('POST', messageEndpoint, true);
    http.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    http.onload = function() {
      if (http.status === 200 && http.responseText) {
        var response = JSON.parse(http.responseText);
        context = response.context;
    
        console.log("context3 = "+JSON.stringify(context));
        Api.setWatsonPayload(response);
      } else {
        Api.setWatsonPayload({output: {text: [
          'The service may be down at the moment; please check' +
          ' <a href="https://status.ng.bluemix.net/" target="_blank">here</a>' +
          ' for the current status. <br> If the service is OK,' +
          ' the app may not be configured correctly,' +
          ' please check workspace id and credentials for typos. <br>' +
          ' If the service is running and the app is configured correctly,' +
          ' try refreshing the page and/or trying a different request.'
        ]}});
        console.error('Server error when trying to reply!');
      }
    };
    http.onerror = function() {
      console.error('Network error trying to send message!');
    };

    http.send(JSON.stringify(data));
  }
}());
