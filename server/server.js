Devices  = new Mongo.Collection('devices'); //devices listed collection mongo.
GpioData = new Mongo.Collection('gpiodata');//gpio data stored.
Meteor.npmRequire('events').EventEmitter.prototype._maxListeners = 1000000;//max listner set to memory for serialport 


var serialport = Meteor.npmRequire("serialport"),
    SerialPort = serialport.SerialPort; //serial port npm initialization.

var curPortName = ""; //current port name selected.
var curPort; //current port object selected.
var manufacturer;
var com_port = []; //ports stored.
var prod_details = []; //port vendor id,product id details stored.
var prod_name = []; //product name stored.
var numRelay = [];
var numGpio = [];
var numAnalog = [];



console.log('server started');


if (Meteor.isServer) {



    Meteor.methods({
        'relayStatus': function(data) {
            console.log(data);
            curPort.write(data); //relay control
        },
        'gpiostatus': function(data) {

            console.log(data);
            curPort.write(data); //digital output 
        },
        'GetDigitalInput': function(data, ret) {
           

            curPort.write("gpio read " + data + "\r");

            curPort.on('data', Meteor.bindEnvironment(function(Result) {
                var digital = Result.toString().split("\n");
                var index = digital[0].substring(10);
                var digitalData = digital[1];
                var index_string = 'gip' + index;
                GpioData.update({
                    index: index_string
                }, {
                    $set: {
                        data: digitalData
                    }
                })

            }, function(e) {

                throw e;
            }));


        },
        'GetAnalog': function(data, ret) {

            try {
                curPort.write("adc read " + data + "\r");
                curPort.on('data', Meteor.bindEnvironment(function(Result) {



                    var analog = Result.toString().split("\n");
                   
                    var index = analog[0].substring(9);
                    var analogData = analog[1];
                    // console.log('index: '+index+'result: '+analogData);
                    var index_string = 'gip' + index;
                    GpioData.update({
                        index: index_string
                    }, {
                        $set: {
                            data: analogData
                        }
                    })
                   
                }, function(e) {

                    throw e;
                }));

            } catch (e) {
                throw new Meteor.Error(500, 'exception in do_something', e);
            }
        },


        'portopen': function(data) {
            Devices.update({
                _id: data
            }, {
                $set: {
                    current_port: true
                }
            }); //current port set true.
            Devices.update({
                _id: {
                    $ne: data
                }
            }, {
                $set: {
                    current_port: false
                }
            }, {
                multi: true
            }); //other port are false.

            var newport = Devices.findOne({
                current_port: true
            }).port;
            console.log('current clicked port : ' + newport);


            if (curPortName == "") {
                //first time open
                console.log('----------+++++++++++-------------')
                console.log('first time curportname is not set!');
                curPort = new SerialPort(newport, {
                    baudrate: 19200,
                    // parser: serialport.parsers.readline('\n')
                }, false);
                curPort.open();
                console.log(newport + ' open');
                curPortName = newport;
                console.log('----------###########-------------')

            } else {


                // next time open
                if (!(curPortName == newport)) {
                    console.log('-----------------------------------')
                    console.log('port changed')
                    curPort.close();

                    console.log('current port ' + curPort.path + ' closed');

                    curPort = new SerialPort(newport, {
                        baudrate: 19200,
                        // parser: serialport.parsers.readline('\n')
                    }, false);
                    curPort.open();
                    console.log('new selected ' + newport + ' open ');

                    curPortName = newport;


                    console.log(curPort.path + ' current open port');
                    console.log('---------*****************-------')

                }

            }

GpioData.remove({});//if prject statring gpio data clear.
            numGpio = Devices.findOne({
                current_port: true
            }).numGpio; //to konow num of gpio current open device

            for (var i = 0; i < numGpio; i++) {
                GpioData.insert({
                    index: 'gip' + [i],
                    data:  'R ' + i
                })
            }
        },
        'removePort': function(data) {


            if (curPort.isOpen()) {
                curPort.close();
                curPortName = "";//new port start to help.
                console.log('..............close port.............');
            }



        },




        'device_info': function() {

            Devices.remove({}); //collection remove
            serialport.list(Meteor.bindEnvironment(function(err, ports) {

                ports.forEach(function(port) {

                   
                     if (port.pnpId.substring(17, 21) === "0C00") 
                     {
                                prod_name = "2 Channel USB Relay";
                                numRelay = 2;
                                numGpio = 8;
                                numAnalog = 6;
                     }else if (port.pnpId.substring(17, 21) === "0C01") {
                                prod_name = "4 Channel USB Relay"
                                numRelay = 4;
                                numGpio = 6;
                                numAnalog = 5;

                     }else if (port.pnpId.substring(17, 21) === "0C02") {
                               prod_name = "8 Channel USB Relay";
                               numRelay = 8;
                               numGpio = 0;
                               numAnalog = 0;
                     }else if (port.pnpId.substring(17, 21) === "0C05") {
                                prod_name = "1 Channel USB Powered Relay";
                                numRelay = 1;
                                numGpio = 4;
                                numAnalog=0;
                     }else if (port.pnpId.substring(17, 21) === "0C06") {
                                prod_name = "2 Channel USB Powered Relay";
                                numRelay = 2;
                                numGpio = 4;
                                numAnalog = 4;
                    } else if (port.pnpId.substring(17, 21) === "0C07") {
                                prod_name = "4 Channel USB Powered Relay";
                                numRelay = 4;
                                numGpio= 4;
                                numAnalog = 4;
                    } else if (port.pnpId.substring(17, 21) === "0800") {
                               prod_name = "8 Channel USB GPIO";
                               numRelay = 0;
                               numGpio = 8;
                               numAnalog = 6;
                     }else if (port.pnpId.substring(17, 21) === "0801") {
                                prod_name = "16 Channel USB GPIO";
                                numRelay = 0;
                                numGpio = 16;
                                numAnalog = 7;

                     } else{
                        prod_name="Numato Device"//default sample
                        numGpio=4//default sample
                        numRelay=4//default
                     }
 
                     Devices.insert({
                                        port: port.comName,
                                        productID:port.pnpId.substring(17, 21),
                                        vendorID:port.pnpId.substring(8, 12),
                                        current_port: false,
                                        manufacturer:port.manufacturer,
                                        prod_name:prod_name,
                                        numRelay:numRelay,
                                        numGpio:numGpio,
                                        numAnalog:numAnalog
                                        
                                    });
                                                    
                   });
            }, function(e) {

                throw e;
        }));
 
    },




    }); //method end

} //server end