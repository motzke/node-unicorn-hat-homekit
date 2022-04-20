// const local imports
const LOG = require("./log.js");
const HANDLER = require("./handler.js");
const UTILS = require("./utils.js");
const SETTINGS = require("./settings.js");

const UNICORN = require('unicornhat-mini');
let unicorn = new UNICORN();
let currColor;
let currBrightness;


// ToDo: save current brighness and color for future use.

function getSubmethod(urlParts, index) {
    const pathMatch = urlParts.pathname.match(SETTINGS.BASE_URL);
    const pathName = (pathMatch && pathMatch.length >= 2) ? pathMatch[index] : null;
    return pathName;
};


function getCurrColor() {
    return currColor ? currColor : [ 255, 255, 255];
};

function getCurrColorHEX() {
    let tempColor = getCurrColor();
    let hexColor = tempColor.map(function(rgb, index, array){
        let hex = parseInt(rgb).toString(16);
        if (hex.length == 1) {
            hex = `0${hex}`;
        }
        return hex;
    });

    return hexColor.join("");
};

function getStatus() {
    let temp = parseFloat(getBrightness());
    return (temp !== 0 ? '1' : '0');
};

function getBrightness() {
    return ((currBrightness ? currBrightness : 0) * 100);
};
function setBrightness(brgthnss) {
    if (brgthnss >= SETTINGS.maxBrightness) {
        currBrightness = SETTINGS.maxBrightness;
    } else {
        currBrightness = brgthnss;
    }
    unicorn.setBrightness(currBrightness);
};
function showCurrColor() {
    let tempColor = getCurrColor();
    showColor(tempColor[0], tempColor[1], tempColor[2]);
};
function showColor(red, green, blue) {
  currColor = [red, green, blue];
  unicorn.setAll(red, green, blue);
};

function getStatusJson(message, type) {
    let returnValue = {
        'status' : null,
        'statusType' : type,
        'color' : `${getCurrColorHEX()}`,
        'brightness' : `${getBrightness()}`,
        'onOff' : `${getStatus()}`,
        'message' : `${message}`
    };

    if (type && type === "color") {
        returnValue.status = `${getCurrColorHEX()}`;
    } else if (type && type === "brightness") {
        returnValue.status = `${getBrightness()}`;
    } else if (type && type === "switch") {
        returnValue.status = `${getStatus()}`;
    }
    return returnValue;

};

function getStatusString(type) {
    let returnValue = "";

    if (type && type === "color") {
        returnValue = `${getCurrColorHEX()}`;
    } else if (type && type === "brightness") {
        returnValue = `${getBrightness()}`;
    } else if (type && type === "switch") {
        returnValue = `${getStatus()}`;
    }
    return returnValue;

};

function init() {
    showCurrColor();
    setBrightness(1);
    unicorn.show();
    setTimeout(function(){
      showColor(255, 0, 0);
      unicorn.show();
      LOG.debug(`red`);
    }, 1000);
    setTimeout(function(){
      showColor(0, 255, 0);
      unicorn.show();
      LOG.debug(`green`);
    }, 2000);
    setTimeout(function(){
      showColor(0,0,255);
      unicorn.show();
      LOG.debug(`blue`);
    }, 3000);
    setTimeout(function(){
      setBrightness(0);
      showColor(255,255,255);
      unicorn.show();
      LOG.debug(`off`);
    }, 4000);
    LOG.debug(`Init ... `);
};


/* public api methods */
function status(request, response, urlParts) {
    UTILS.write(response, 200, getStatusString("switch"));
};

function on(request, response, urlParts) {
    setBrightness(1);
    showCurrColor();
    unicorn.show();
    LOG.debug(`Turn on`);
    UTILS.write(response, 200, getStatusJson("Turn on", "switch"));

};

function off(request, response, urlParts) {
    setTimeout(function(){
      setBrightness(0);
      unicorn.show();
    },30);
    setTimeout(function(){
      setBrightness(0);
      unicorn.show();
    },500);
    LOG.debug(`Turn off`);
    UTILS.write(response, 200, getStatusJson("Turn off", "switch"));
};

function brightness(request, response, urlParts) {
    const valutToSet = getSubmethod(urlParts, 2);

    const parsed = (parseFloat(valutToSet, 10) / 100);

    if (valutToSet && 0 <= parsed <= 1) {
        setBrightness(parsed);
        showCurrColor();
        unicorn.show();
        LOG.debug(`Set brighness to ${parsed}`);
        UTILS.write(response, 200, getStatusJson(`Set brighness to ${parsed}`, "brightness"));
    } else if (valutToSet && !parsed) {
        UTILS.write(response, 500, `unable to parse brighness: ${valutToSet}`);
    } else {
        UTILS.write(response, 200, getStatusString("brightness"));
    }


};

function set(request, response, urlParts) {
    const valutToSet = getSubmethod(urlParts, 2);

    if (!valutToSet) {
        UTILS.write(response, 200, getStatusString("color"));
    } else {

        const red = parseInt(valutToSet.substring(0, 2), 16);
        const green = parseInt(valutToSet.substring(2, 4), 16);
        const blue =  parseInt(valutToSet.substring(4, 6), 16);

        if (isNaN(red) || isNaN(green) || isNaN(blue)) {
            UTILS.write(response, 500, `unable to parse color: ${valutToSet}`);
        } else if ((0 <= red <= 255) && (0 <= green <= 255) && (0 <= blue <= 255)) {
            showColor(red, green, blue);
            unicorn.show();
            let message = `Set colors to r=${red}, g=${green}, b=${blue}`;
            UTILS.write(response, 200, getStatusJson(message, "color"));
        } else if (!valutToSet) {
            UTILS.write(response, 200, getStatusJson("alles GUT!", "color"));
        } else {
            UTILS.write(response, 500, `unable to parse color: ${valutToSet}`);
        }
    }

};

exports.init = init;
exports.status = status;
exports.on = on;
exports.off = off;
exports.brightness = brightness;
exports.set = set;
