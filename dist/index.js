'use strict'

const defaultJSON = require('./../default.json')
const packageJSON = require('./../package.json')
var request = require("request");
const util = require('./../util.js')
const HomebridgeLib = require('homebridge-lib');

let Service, Characteristic, HomebridgeAPI

module.exports = function (homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory('messana-system', 'SwitchES', SwitchES)
  homebridge.registerAccessory('messana-system', 'SwitchSB', SwitchSB)
  homebridge.registerAccessory('messana-system', 'SwitchATU', SwitchAir)
  homebridge.registerAccessory('messana-system', 'SwitchDHW', SwitchDhw)
  homebridge.registerAccessory('messana-system', 'SwitchSystem', SwitchSystem)
  HomebridgeAPI = homebridge
}

function SwitchES(log, config) {
  this.log = log
  this.config = config
  this.name = config.name
  this.model = packageJSON.models[0];
  this.apiroute = util.staticValues.apiroute
  this.on = false
  this.service = new Service.Switch(this.name)
}

SwitchES.prototype = {

  identify: function(callback) {
    callback();
  },

  getEnergySaving: function(callback) {
    // this.log("[+] getEnergySaving from:", this.apiroute + defaultJSON.system.apis.getEnergySaving + "?apikey=" + defaultJSON.apikey);

    var url = this.apiroute + defaultJSON.system.apis.getSystemOn + "?apikey=" + defaultJSON.apikey;
    util.httpRequest(url, '', 'GET', function(error, response, responseBody) {
      if (error) {
        this.log("[!] Error getting System State: %s", error.message);
        callback(error);
      } else {
        var json = JSON.parse(responseBody);
        this.onSystem = (json.status == 0)? false : true
        if(!this.onSystem) {
          this.on = 0
          callback(null, this.on);
        }
        else {

          var url = this.apiroute + defaultJSON.system.apis.getEnergySaving + "?apikey=" + defaultJSON.apikey;
          util.httpRequest(url, '', 'GET', function(error, response, responseBody) {
            if (error) {
              this.log("[!] Error getting getEnergySaving: %s", error.message);
              callback(error);
            } else {
              var json = JSON.parse(responseBody);
              this.on = json.status;
              callback(null, this.on);
            }
          }.bind(this));

        }
      }
    }.bind(this));
  },

  setEnergySaving: function(value, callback) {
    // this.log("[+] setEnergySaving from:", this.apiroute + defaultJSON.system.apis.setEnergySaving + "?apikey=" + defaultJSON.apikey);
    if(!this.onSystem){
      this.log("System OFF - Unable to change")
      callback();
      return
    }
    var url = this.apiroute + defaultJSON.system.apis.setEnergySaving + "?apikey=" + defaultJSON.apikey;
    var body = {
      value: (value)? 1 : 0
    }
    util.httpRequest(url, body, 'PUT', function(error, response, responseBody) {
      if (error) {
        this.log("[!] Error setting setEnergySaving", error.message);
        callback(error);
      } else {
        this.log("[*] Sucessfully set setEnergySaving to %s", value);
        callback();
      }
    }.bind(this));
  },

  getName: function(callback) {
    // this.log("getName :", this.name);
    callback(null, this.name);
  },

  getServices: function() {
    // this.log("***** getServices *******");
    this.informationService = new Service.AccessoryInformation();
    this.informationService
      .setCharacteristic(Characteristic.Model, this.model)
      .setCharacteristic(Characteristic.Manufacturer, util.staticValues.manufacturer)
      .setCharacteristic(Characteristic.SerialNumber, defaultJSON.version);

    this.service
      .getCharacteristic(Characteristic.On)
      .on('get', this.getEnergySaving.bind(this))
      .on('set', this.setEnergySaving.bind(this));

    setInterval(function() {

      this.getEnergySaving(function(err, temp) {
        if (err) {temp = err;}
        this.service.getCharacteristic(Characteristic.On).updateValue(temp);
      }.bind(this));

    }.bind(this), defaultJSON.refreshSystem * 1000);

    return [this.informationService, this.service];
  }
}

function SwitchSB(log, config) {
  this.log = log
  this.config = config
  this.name = config.name
  this.model = packageJSON.models[1];
  this.apiroute = util.staticValues.apiroute
  this.on = false
  this.service = new Service.Switch(this.name)
}

SwitchSB.prototype = {

  identify: function(callback) {
    // this.log("Identify requested!");
    callback();
  },

  getSetback: function(callback) {
    // this.log("[+] getSetback from:", this.apiroute + defaultJSON.system.apis.getSetback + "?apikey=" + defaultJSON.apikey);

    var url = this.apiroute + defaultJSON.system.apis.getSystemOn + "?apikey=" + defaultJSON.apikey;
    util.httpRequest(url, '', 'GET', function(error, response, responseBody) {
      if (error) {
        this.log("[!] Error getting System State: %s", error.message);
        callback(error);
      } else {
        var json = JSON.parse(responseBody);
        this.onSystem = (json.status == 0)? false : true
        if(!this.onSystem) {
          this.on = 0
          callback(null, this.on);
        }
        else {

          var url = this.apiroute + defaultJSON.system.apis.getSetback + "?apikey=" + defaultJSON.apikey;
          util.httpRequest(url, '', 'GET', function(error, response, responseBody) {
            if (error) {
              this.log("[!] Error getting getSetback: %s", error.message);
              callback(error);
            } else {
              var json = JSON.parse(responseBody);
              this.on = json.status
              // this.log("[*] getSetback: %s", json.on);
              callback(null, this.on);
            }
          }.bind(this));

        }
      }
    }.bind(this));

  },

  setSetback: function(value, callback) {
    // this.log("[+] setSetback from:", this.apiroute + defaultJSON.system.apis.setSetback + "?apikey=" + defaultJSON.apikey);
    if(!this.onSystem){
      this.log("System OFF - Unable to change")
      callback();
      return
    }
    var url = this.apiroute + defaultJSON.system.apis.setSetback + "?apikey=" + defaultJSON.apikey;
    var body = {
      value: (value)? 1 : 0
    }
    util.httpRequest(url, body, 'PUT', function(error, response, responseBody) {
      if (error) {
        this.log("[!] Error setting setSetback", error.message);
        callback(error);
      } else {
        this.log("[*] Sucessfully set setSetback to %s", value);
        callback();
      }
    }.bind(this));
  },

  getName: function(callback) {
    // this.log("getName :", this.name);
    callback(null, this.name);
  },

  getServices: function() {
    // this.log("***** getServices *******");
    this.informationService = new Service.AccessoryInformation();
    this.informationService
      .setCharacteristic(Characteristic.Model, this.model)
      .setCharacteristic(Characteristic.Manufacturer, util.staticValues.manufacturer)
      .setCharacteristic(Characteristic.SerialNumber, defaultJSON.version);

    this.service
      .getCharacteristic(Characteristic.On)
      .on('get', this.getSetback.bind(this))
      .on('set', this.setSetback.bind(this));

    setInterval(function() {

      this.getSetback(function(err, temp) {
        if (err) {temp = err;}
        this.service.getCharacteristic(Characteristic.On).updateValue(temp);
      }.bind(this));

    }.bind(this), defaultJSON.refreshSystem * 1000);

    return [this.informationService, this.service];
  }
}

function SwitchAir(log, config) {
  this.log = log
  this.config = config
  this.name = config.name
  this.id = config.id || 0
  this.model = packageJSON.models[2];
  this.apiroute = util.staticValues.apiroute
  this.on = false
  this.service = new Service.Switch(this.name)
}

SwitchAir.prototype = {

  identify: function(callback) {
    callback();
  },

  getAirOn: function(callback) {
    // this.log("[+] getAirOn from:", this.apiroute + defaultJSON.system.apis.getAirOn + this.id + "?apikey=" + defaultJSON.apikey);
    var url = this.apiroute + defaultJSON.system.apis.getSystemOn + "?apikey=" + defaultJSON.apikey;
    util.httpRequest(url, '', 'GET', function(error, response, responseBody) {
      if (error) {
        this.log("[!] Error getting System State: %s", error.message);
        callback(error);
      } else {
        var json = JSON.parse(responseBody);
        this.onSystem = (json.status == 0)? false : true
        if(!this.onSystem) {
          this.on = 0
          callback(null, this.on);
        }
        else {

          var url = this.apiroute + defaultJSON.system.apis.getAirOn + this.id + "?apikey=" + defaultJSON.apikey;
          util.httpRequest(url, '', 'GET', function(error, response, responseBody) {
            if (error) {
              this.log("[!] Error getting getAirOn: %s", error.message);
              callback(error);
            } else {
              var json = JSON.parse(responseBody);
              this.on = (json.status == 0)? false : true
              // this.log("[*] getAirOn: %s", json.on);
              callback(null, this.on);
            }
          }.bind(this));

        }
      }
    }.bind(this));


  },

  setAirOn: function(value, callback) {
    if(!this.onSystem){
      this.log("System OFF - Unable to change")
      callback();
      return
    }
    // this.log("[+] setAirOn from:", this.apiroute + defaultJSON.system.apis.setAirOn + "?apikey=" + defaultJSON.apikey);
    var url = this.apiroute + defaultJSON.system.apis.setAirOn + "?apikey=" + defaultJSON.apikey;
    var body = {
      id: this.id,
      value: (value)? 1 : 0
    }
    console.log(body)
    util.httpRequest(url, body, 'PUT', function(error, response, responseBody) {
      this.log("[!] setAirOn ");
      if (error) {
        this.log("[!] Error setting setAirOn", error.message);
        callback(error);
      } else {
        this.log("[*] Sucessfully set setAirOn to %s", value);
        callback();
      }
    }.bind(this));
  },

  getName: function(callback) {
    // this.log("getName :", this.name);
    callback(null, this.name);
  },

  getServices: function() {
    // this.log("***** getServices *******");
    this.informationService = new Service.AccessoryInformation();
    this.informationService
      .setCharacteristic(Characteristic.Model, this.model)
      .setCharacteristic(Characteristic.Manufacturer, util.staticValues.manufacturer)
      .setCharacteristic(Characteristic.SerialNumber, defaultJSON.version);

    this.service
      .getCharacteristic(Characteristic.On)
      .on('get', this.getAirOn.bind(this))
      .on('set', this.setAirOn.bind(this));

    setInterval(function() {
      this.getAirOn(function(err, temp) {
        if (err) {temp = err;}
        this.service.getCharacteristic(Characteristic.On).updateValue(temp);
      }.bind(this));

    }.bind(this), defaultJSON.refreshSystem * 1000);

    return [this.informationService, this.service];
  }
}

function SwitchSystem(log, config) {
  this.log = log
  this.config = config
  this.name = config.name
  this.id = config.id || 0
  this.model = packageJSON.models[3];
  this.apiroute = util.staticValues.apiroute
  this.on = false
  this.service = new Service.Switch(this.name)
  console.log('SwitchSystem')
  const optionParser = new HomebridgeLib.OptionParser(this.config, true);
  console.log(optionParser.stringKey('apikey'))
}

SwitchSystem.prototype = {

  identify: function(callback) {
    // this.log("Identify requested!");
    callback();
  },

  getSystemOn: function(callback) {
    this.log("[+] getSystemn from:", this.apiroute + defaultJSON.system.apis.getSystemOn + "?apikey=" + defaultJSON.apikey);
    var url = this.apiroute + defaultJSON.system.apis.getSystemOn + "?apikey=" + defaultJSON.apikey;
    util.httpRequest(url, '', 'GET', function(error, response, responseBody) {
      if (error) {
        this.log("[!] Error getting getSystemOn: %s", error.message);
        callback(error);
      } else {
        var json = JSON.parse(responseBody);
        this.on = (json.status == 0)? false : true
        // this.log("[*] getSystemOn: %s", json.on);
        callback(null, this.on);
      }
    }.bind(this));
  },

  setSystemOn: function(value, callback) {
    // this.log("[+] setSystemOn from:", this.apiroute + defaultJSON.system.apis.setSystemOn + "?apikey=" + defaultJSON.apikey);
    var url = this.apiroute + defaultJSON.system.apis.setSystemOn + "?apikey=" + defaultJSON.apikey;
    var body = {
      value: (value)? 1 : 0
    }
    util.httpRequest(url, body, 'PUT', function(error, response, responseBody) {
      if (error) {
        this.log("[!] Error setting setSystemOn", error.message);
        callback(error);
      } else {
        this.log("[*] Sucessfully set setSystemOn to %s", value);
        callback();
      }
    }.bind(this));
  },

  getName: function(callback) {
    // this.log("getName :", this.name);
    callback(null, this.name);
  },

  getServices: function() {
    // this.log("***** getServices *******");
    this.informationService = new Service.AccessoryInformation();
    this.informationService
      .setCharacteristic(Characteristic.Model, this.model)
      .setCharacteristic(Characteristic.Manufacturer, util.staticValues.manufacturer)
      .setCharacteristic(Characteristic.SerialNumber, defaultJSON.version);

    this.service
      .getCharacteristic(Characteristic.On)
      .on('get', this.getSystemOn.bind(this))
      .on('set', this.setSystemOn.bind(this));


    setInterval(function() {

      this.getSystemOn(function(err, temp) {
        if (err) {temp = err;}
        this.service.getCharacteristic(Characteristic.On).updateValue(temp);
      }.bind(this));

    }.bind(this), defaultJSON.refreshSystem * 1000);

    return [this.informationService, this.service];
  }
}

function SwitchDhw(log, config) {
  this.log = log
  this.config = config
  this.name = config.name
  this.id = config.id || 0
  this.model = packageJSON.models[4];
  this.apiroute = util.staticValues.apiroute
  this.on = false
  this.service = new Service.Switch(this.name)
}

SwitchDhw.prototype = {

  identify: function(callback) {
    // this.log("Identify requested!");
    callback();
  },

  getDhwOn: function(callback) {
    // this.log("[+] getDhwOn from:", this.apiroute + defaultJSON.system.apis.getDhwOn + this.id + "?apikey=" + defaultJSON.apikey);

    // var url = this.apiroute + defaultJSON.system.apis.getSystemOn + "?apikey=" + defaultJSON.apikey;
    // util.httpRequest(url, '', 'GET', function(error, response, responseBody) {
    //   if (error) {
    //     this.log("[!] Error getting System State: %s", error.message);
    //     callback(error);
    //   } else {
    //     var json = JSON.parse(responseBody);
    //     this.onSystem = (json.status == 0)? false : true
    //     if(!this.onSystem) {
    //       this.on = 0
    //       callback(null, this.on);
    //     }
    //     else {

          var url = this.apiroute + defaultJSON.system.apis.getDhwOn + this.id + "?apikey=" + defaultJSON.apikey;
          util.httpRequest(url, '', 'GET', function(error, response, responseBody) {
            if (error) {
              this.log("[!] Error getting getDhwOn: %s", error.message);
              callback(error);
            } else {
              var json = JSON.parse(responseBody);
              this.on = (json.status == 0)? false : true
              // this.log("[*] getDhwOn: %s", json.on);
              callback(null, this.on);
            }
          }.bind(this));

    //     }
    //   }
    // }.bind(this));

  },

  setDhwOn: function(value, callback) {
    // this.log("[+] setDhwOn from:", this.apiroute + defaultJSON.system.apis.setDhwOn + "?apikey=" + defaultJSON.apikey);
    var url = this.apiroute + defaultJSON.system.apis.setDhwOn + "?apikey=" + defaultJSON.apikey;
    var body = {
      id: this.id,
      value: (value)? 1 : 0
    }
    util.httpRequest(url, body, 'PUT', function(error, response, responseBody) {
      if (error) {
        this.log("[!] Error setting setDhwOn", error.message);
        callback(error);
      } else {
        this.log("[*] Sucessfully set setDhwOn to %s", value);
        callback();
      }
    }.bind(this));
  },

  getName: function(callback) {
    // this.log("getName :", this.name);
    callback(null, this.name);
  },

  getServices: function() {
    // this.log("***** getServices *******");
    this.informationService = new Service.AccessoryInformation();
    this.informationService
      .setCharacteristic(Characteristic.Model, this.model)
      .setCharacteristic(Characteristic.Manufacturer, util.staticValues.manufacturer)
      .setCharacteristic(Characteristic.SerialNumber, defaultJSON.version);

    this.service
      .getCharacteristic(Characteristic.On)
      .on('get', this.getDhwOn.bind(this))
      .on('set', this.setDhwOn.bind(this));


    setInterval(function() {

      this.getDhwOn(function(err, temp) {
        if (err) {temp = err;}
        this.service.getCharacteristic(Characteristic.On).updateValue(temp);
      }.bind(this));

    }.bind(this), defaultJSON.refreshSystem * 1000);

    return [this.informationService, this.service];
  }
}
