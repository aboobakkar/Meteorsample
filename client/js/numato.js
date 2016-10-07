var checked; /* client side global variable declared */
var Relaytable;
var Gpiotable;
var isPaused = false; //set intervel pausing using variable.

Devices = new Mongo.Collection('devices'); //devices collection name initialized Client.
GpioData = new Mongo.Collection('gpiodata'); //gpio collection name initialized Client.
if (Meteor.isClient) {

    Template.statBoxes.helpers({
        DeviceCount: function() {
            return Devices.find().count(); //show no.of devices count.
        },
        DeviceShowtext: function() {
            if (Devices.find().count() == 1) {
                return 'Device Connected'
            } else {
                return 'Devices Connected'
            }

        },
        Relaycount: function() {
            if (Devices.find({
                    current_port: true
                }).count() == 0) {
                return '0';
            } else {
                return Devices.findOne({
                    current_port: true
                }).numRelay; //show no.of relay channel current selected device.
            }

        },
        RelayShowtext: function() {

            if (Devices.find({
                    current_port: true
                }).count() == 0 || Devices.findOne({
                    current_port: true
                }).numRelay == 1 || Devices.findOne({
                    current_port: true
                }).numRelay == 0) {
                return 'Relay Channel';
            } else {
                return 'Relay Channels';
            }
        },
        AnalogCount: function() {
            if (Devices.find({
                    current_port: true
                }).count() == 0) {
                return '0';
            } else {
                return Devices.findOne({
                    current_port: true
                }).numAnalog; //show no.of analog channel current selected device.
            }
        },
        AnalogShowtext: function() {

            if (Devices.find({
                    current_port: true
                }).count() == 0 || Devices.findOne({
                    current_port: true
                }).numAnalog == 1 || Devices.findOne({
                    current_port: true
                }).numAnalog == 0) {
                return 'Analog Input ';
            } else {
                return 'Analog Inputs';
            }
        },
        DigitalCount: function() {
            if (Devices.find({
                    current_port: true
                }).count() == 0) {
                return '0';
            } else {
                return Devices.findOne({
                    current_port: true
                }).numGpio; //show no.of digital channel current selected device.
            }
        },
        DigitalShowtext: function() {

            if (Devices.find({
                    current_port: true
                }).count() == 0 || Devices.findOne({
                    current_port: true
                }).numGpio == 1 || Devices.findOne({
                    current_port: true
                }).numGpio == 0) {
                return 'Digital Input ';
            } else {
                return 'Digital Inputs';
            }
        },
    })

    Template.sideBar.helpers({
        tasks: function() {
            return Devices.find({}); //show listed devices in left sidebar.
        },
    })

    Template.controlSideBar.helpers({
        tasks: function() {
            return Devices.find({}); //show listed devices in right controlsidebar.
        },
    })

    Template.dashboard.helpers({


        tabcontent: function() {
            var device_id = Session.get('selectedDevice') //show clicked device details. 
            return Devices.find({
                _id: device_id
            });
        },
    });

}


Meteor.startup(function() {

    Template.dataTablesPage.onRendered(function() {
        //Gpio table listed analog,digital Datas,Table initialization.
        Gpiotable = $("#example1").DataTable({
            "ordering": false,
            "lengthMenu": [8, 16, 32],
            "columns": [{
                class: 'alignCenter'
            }, {
                'width': '200px',
                class: 'alignCenter'
            }, {
                'width': '200px',
                class: 'alignCenter'
            }, {
                'width': '200px',
                class: 'alignCenter'
            }, {
                "width": "100px",
                class: 'alignCenter'
            }],
        });
    });

    //Relay details table initialized.
    Template.dataTablesPageRelay.onRendered(function() {
        Relaytable = $("#example2").DataTable({
            "ordering": false,
            "lengthMenu": [8, 16, 32],
            "columns": [{
                class: 'alignCenter'
            }, {
                class: 'alignCenter'
            }],
        });
    });

    Template.dashboard.rendered = function() {

        totHeight = $(window).height();
        resize_tabs = totHeight - 264; //table height set.
        resize_tabs1 = totHeight - 369;

        $('#tabs').css({
            'height': resize_tabs + "px"
        });
        $('#tabs-1').css({
            'height': resize_tabs1 + "px"
        });
        var tableHeight = resize_tabs1 - 28;
        $('#example1_wrapper').css({
            'font-size': '12px',
            'overflow-y': 'scroll',
            'overflow-x': 'hidden',
            'height': tableHeight + 'px'
        });

        $('#example2_wrapper').css({
            'font-size': '12px',
            'overflow-y': 'scroll',
            'overflow-x': 'hidden',
            'height': tableHeight + 'px'
        });

        $('#example1_filter').hide(); //search filter hide datatable
        $('#example2_filter').hide();
        $('#tabs ul').css({
            'padding': '2.7em .2em 0'
        }); //jquery padding styled.

        //statring device no device added.old history clear.
        $(this).parent().remove();
        $('#tabs-1 div:first').hide();
        $("#tabs-1").removeClass("ui-tabs-panel");
        $('#tabs-1').addClass('No_device'); //starting no devices selected default.
        $('#tabs-1').css({
            'margin-top': resize_tabs1 / 2 + 'px'
        }); //no device align center.
        $('#tabs-1').append('<span>No Device Selected <i class="fa fa-usb"></i></span>');

        //tab panel clicked,each device.
        $(document).on("click", "#tabs ul li", function(e) {


            var tab_device_id = $(this).find('a').attr('data-deviceid');
            Session.set('selectedDevice', tab_device_id);
            Meteor.call('portopen', tab_device_id);
            $("#infoTab").parent().addClass('active');
            $("#relayTab").parent().removeClass('active');
            $("#tablegpioTab").parent().removeClass('active');

            setTimeout(function() {
                /* Start Relay table generation*/
                NumRelay = Devices.findOne({
                    current_port: true
                }).numRelay; //To find no.of relay selected device.
                console.log('No.of relay:' + NumRelay);
                Relaytable.clear(); // clear raw.
                Relaytable.draw(); //new creation table.
                for (var e = 0; e < NumRelay; e++) {
                    Relaytable.row.add([
                        'Relay ' + e.toString(),
                        '<input id="' + (e).toString() + '" data-toggle="clear" name="check-1" type="checkbox" class="lcs_check" autocomplete="off" /> '

                    ]).draw(false);
                    $('input[type="checkbox"]').lc_switch();
                }
                /* End Relay table generation*/

                /* Start Gpio table generation*/
                numGpio = Devices.findOne({
                    current_port: true
                }).numGpio;
                numAnalog = Devices.findOne({
                    current_port: true
                }).numAnalog;
                console.log('No.of Gpio:' + numGpio);
                Gpiotable.clear(); // clear raw.
                Gpiotable.draw(); //new creation table.

                for (var d = 0; d < numGpio; d++) {
                    if (d < numAnalog)
                        Gpiotable.row.add([
                            'Gpio ' + d.toString(),
                            '<input type="radio" id="aip' + d.toString() + '" name="q' + d.toString() + '"/> ',
                            '<input type="radio" id="dip' + d.toString() + '" name="q' + d.toString() + '" checked/>',
                            '<input type="radio" id="dop' + d.toString() + '" class="dop" name="q' + d.toString() + '"/>',
                            '<span id="s' + d.toString() + '"></span>'


                        ]).draw(false);
                    else
                        Gpiotable.row.add([
                            'Gpio ' + d.toString(),
                            ' ',
                            '<input type="radio" id="dip' + d.toString() + '" name="q' + d.toString() + '" checked/>',
                            '<input type="radio" id="dop' + d.toString() + '" class="dop" name="q' + d.toString() + '"/>',
                            '<span id="s' + d.toString() + '"></span>'


                        ]).draw(false);
                    $('input[type="checkbox"]').lc_switch();

                }
                /* End Gpio table generation*/

                $("input[type='radio']").change(function() {

                    if ($(this).closest("tr").find("td:eq(3) input").is(":checked")) {

                        $(this).closest("tr").find("td:eq(4) div").show();
                        $(this).closest("tr").find("td:eq(4) span").remove();
                    } else {
                        $(this).closest("tr").find("td:eq(4) div").hide();
                    }

                });
            }, 100);

            /* check current device gpio or relay */
            var DeviceName = $(this).text();

            var StrRelay = "Relay"; //check device is relay .
            var StrGpio = "GPIO"; //check device is gpio .
            if (DeviceName.indexOf(StrRelay) != -1) {
                // alert(StrRelay + " found");
                $("#tablegpioTab").parent().show();
                $("#relayTab").parent().show();
                $('#info').show();
                $('#tablegpio').hide();
                $('#relay').hide();
            } else if (DeviceName.indexOf(StrGpio) != -1) {
                // alert(StrGpio + " found");
                $("#relayTab").parent().hide();
                $("#tablegpioTab").parent().show();
                $('#info').show();
                $('#tablegpio').hide();
                $('#relay').hide();
            }

        });
        //info details sub tab.
        $("#infoTab").click(function(e) {
            $("#infoTab").parent().addClass('active');
            $('#info').show();
            $('#tablegpio').hide();
            $('#relay').hide();
            $("#relayTab").parent().removeClass('active');
            $("#tablegpioTab").parent().removeClass('active');
            return false;
        });
        //Relay details sub tab.
        $("#relayTab").click(function() {
            $("#relayTab").parent().addClass('active');
            $('#relay').show();
            $('#info').hide();
            $('#tablegpio').hide();
            $("#infoTab").parent().removeClass('active');
            $("#tablegpioTab").parent().removeClass('active');
            return false;
        });
        //Gpio details Sub tab.
        $("#tablegpioTab").click(function(e) {


            $("#tablegpioTab").parent().addClass('active');
            $('#tablegpio').show();
            $('#info').hide();
            $('#relay').hide();
            $("#relayTab").parent().removeClass('active');
            $("#infoTab").parent().removeClass('active');


            return false;
        });

        $('.paginate_button').click(function(e) {

            e.preventDefault();
            e.stopPropagation();
        })

        // triggered each time a field is checked
        $('#example1').delegate('.lcs_check', 'lcs-on', function() {
            console.log('field is checked');
            $(this).attr('data-toggle', 'set');
            checked = "gpio " + $(this).attr('data-toggle') + " " + $(this).attr('id') + "\r";
            Meteor.call('gpiostatus', checked);
        });

        // triggered each time a is unchecked
        $('#example1').delegate('.lcs_check', 'lcs-off', function() {
            console.log('field is unchecked');
            $(this).attr('data-toggle', 'clear');
            checked = "gpio " + $(this).attr('data-toggle') + " " + $(this).attr('id') + "\r";
            Meteor.call('gpiostatus', checked);
            //$("#example1 tbody tr:eq(" + d.toString() + ") td:eq(4) input").removeAttr("disabled");
        });
        // triggered each time a field is checked
        $('#example2').delegate('.lcs_check', 'lcs-on', function() {

            $(this).attr('data-toggle', 'on');
            checked = "relay " + $(this).attr('data-toggle') + " " + $(this).attr('id') + "\r";
            Meteor.call('relayStatus', checked);
        });

        // triggered each time a is unchecked
        $('#example2').delegate('.lcs_check', 'lcs-off', function() {

            $(this).attr('data-toggle', 'off');
            checked = "relay " + $(this).attr('data-toggle') + " " + $(this).attr('id') + "\r";
            Meteor.call('relayStatus', checked);

        });
        /*Starting Device Information Collected.*/
        Meteor.call('device_info'); //Device information Fetched.


        $(".tablegpioTab").click(function() {
            isPaused = false; //interval resume .
            Tracker.autorun(function() {
                for (var i = 0; i < numGpio; i++) {
                    myTags = GpioData.findOne({
                        index: 'gip' + i
                    }).data;
                    console.log('index:' + i + 'result: ' + myTags);

                    $("#s" + i).text(myTags);

                }


            });


            function doSetTimeout(i) {
                Meteor.setInterval(function() {
                    if (!isPaused) { //intervel paused close tab.

                        if ($('#aip' + i.toString()).is(':checked')) {

                            console.log('aip' + i);
                            $("#example1 tbody tr:eq(" + i.toString() + ") td:eq(4) .lcs_wrap").remove();
                            $("#s" + i.toString()).show(); //span shows.

                            Meteor.call('GetAnalog', i.toString());

                        } else if ($('#dip' + i.toString()).is(':checked')) {

                            console.log('dip' + i);
                            $("#example1 tbody tr:eq(" + i.toString() + ") td:eq(4) .lcs_wrap").remove();
                            $("#s" + i.toString()).show();
                            Meteor.call('GetDigitalInput', i.toString());
                        }


                        i++;

                        if (i == numGpio)
                            i = 0;
                    } //if paused.
                }, 500);


            }
            doSetTimeout(0);

            $(document).on("click", ".dop", function() {

                var i = $(this).attr("id").substring(3);

                $("#example1 tbody tr:eq(" + i.toString() + ") td:eq(4) .lcs_wrap").remove();
                $("#s" + i.toString()).hide();
                var toggle_button = $('<input id="' + (i).toString() + '" data-toggle="clear" name="check-1" type="checkbox" class="lcs_check" autocomplete="off" />')
                $("#example1 tbody tr:eq(" + i.toString() + ") td:eq(4)").append(toggle_button);
                $('input[type="checkbox"]').lc_switch();

            });


        }); //table tab gpio end.


    }


    Template.sideBar.rendered = function() {

            //dynamic tab creation if tab selected.
            var device_id_selected;

            $(function() {
                var tabTemplate = "<li style=border-radius:0px;margin-top:9px;margin-left:7px><a style=font-size:12px data-deviceid='#{device_id_selected}' href='#{href}'>#{label}</a> <span style=font-size:12px;padding-top:8px;padding-right:3px  class='fa fa-times'role='presentation'></span></li>";

                var tabs = $("#tabs").tabs();

                function addTab(string_id) {
                    var label = string_id,
                        id = "tabs-1",
                        li = $(tabTemplate.replace(/#\{href\}/g, "#" + id).replace(/#\{label\}/g, label).replace(/#\{device_id_selected\}/g, device_id_selected));

                    tabs.find(".ui-tabs-nav").append(li);
                    tabs.tabs("refresh");
                }

                //left side bar device name clicked then tab created.
                $(document).on('click', '.add_tab', function() {

                    $('#tabs ul').css({
                        'padding': '.2em .2em 0',
                        'width': '100%'
                    }); //jquery style changes dynamically.
                    device_id_selected = $(this).attr('data-deviceid');
                    var Device_id = device_id_selected;
                    Session.set('selectedDevice', Device_id); //selected device id passed.
                    var clicked = $(this).text();
                    var Device_details3 = Devices.findOne({
                        _id: Device_id
                    }).port;
                    Meteor.call('portopen', Device_id); //clicked device port name passed to server.


                    /* check current device gpio or relay */
                    var DeviceName = $(this).text();

                    var StrRelay = "Relay";
                    var StrGpio = "GPIO";
                    if (DeviceName.indexOf(StrRelay) != -1) {
                        // alert(StrRelay + " found");
                        $("#tablegpioTab").parent().show();
                        $("#relayTab").parent().show();
                    } else if (DeviceName.indexOf(StrGpio) != -1) {
                        // alert(StrGpio + " found");
                        $("#relayTab").parent().hide();
                        $("#tablegpioTab").parent().show();
                    }

                    setTimeout(function() {

                        $("#tabs-1").show();
                        $('#info').show();
                        $('#tablegpio').hide();
                        $('#relay').hide();
                        $("#infoTab").parent().addClass('active');
                        $("#relayTab").parent().removeClass('active');
                        $("#tablegpioTab").parent().removeClass('active');


                        $('#tabs').tabs({
                            active: -1 //current tab is show active.       
                        });
                        /* Start Relay table generation*/
                        NumRelay = Devices.findOne({
                            current_port: true
                        }).numRelay; //To find no.of relay selected device.
                        console.log('No.of relay:' + NumRelay);
                        Relaytable.clear(); // clear raw.
                        Relaytable.draw(); //new creation table.
                        for (var e = 0; e < NumRelay; e++) {
                            Relaytable.row.add([
                                'Relay ' + e.toString(),
                                '<input id="' + (e).toString() + '" data-toggle="clear" name="check-1" type="checkbox" class="lcs_check" autocomplete="off" /> '

                            ]).draw(false);
                            $('input[type="checkbox"]').lc_switch();
                        }
                        /* End Relay table generation*/

                        /* Start Gpio table generation*/
                        numGpio = Devices.findOne({
                            current_port: true
                        }).numGpio;
                        numAnalog = Devices.findOne({
                            current_port: true
                        }).numAnalog;
                        console.log('No.of Gpio:' + numGpio);
                        Gpiotable.clear(); // clear raw.
                        Gpiotable.draw(); //new creation table.
                        for (var d = 0; d < numGpio; d++) {
                            if (d < numAnalog)
                                Gpiotable.row.add([
                                    'Gpio ' + d.toString(),
                                    '<input type="radio" id="aip' + d.toString() + '" name="q' + d.toString() + '"/> ',
                                    '<input type="radio" id="dip' + d.toString() + '" name="q' + d.toString() + '" checked/>',
                                    '<input type="radio" id="dop' + d.toString() + '" class="dop" name="q' + d.toString() + '"/>',
                                    '<span id="s' + d.toString() + '"></span>'


                                ]).draw(false);
                            else
                                Gpiotable.row.add([
                                    'Gpio ' + d.toString(),
                                    ' ',
                                    '<input type="radio" id="dip' + d.toString() + '" name="q' + d.toString() + '" checked/>',
                                    '<input type="radio" id="dop' + d.toString() + '" class="dop" name="q' + d.toString() + '"/>',
                                    '<span id="s' + d.toString() + '"></span>'


                                ]).draw(false);
                            $('input[type="checkbox"]').lc_switch();
                        }
                        /* End Gpio table generation*/




                        if ($('#tabs >ul >li').length == 1) {

                            $("#tabs ul li:first ").addClass("ui-tabs-active ui-state-active");
                        } else {
                            $('#tabs ul li:last ').addClass("ui-tabs-active ui-state-active");
                        }

                    }, 50)

                    //clicked tab is active other de active. 
                    $("#tabs ul li ").each(function() {

                        if ($(this).find("a").text() == clicked) {
                            $(this).addClass("ui-tabs-active ui-state-active");
                        } else {
                            $(this).removeClass("ui-tabs-active ui-state-active");

                        }

                    });
                    //tab creation dynamic same tab more than not added.
                    $('.ui-tabs .ui-tabs-nav ').css({
                        'padding': '.2em .2em 0'
                    });
                    $('#tabs-1 div:first').show();
                    $('#tabs-1 span').remove();
                    $('#tabs-1').removeClass('No_device');
                    $('#tabs-1').css({
                        'margin-top': '0px'
                    }); //normal margin after device selection
                    var tab_id = $(this).text();
                    var string_value = tab_id;
                    var isadded = "0";



                    $("#tabs ul li ").each(function() {

                        if ($(this).find("a").text() == string_value) {
                            isadded = "1";
                        }
                    });

                    if (isadded == "0") {
                        addTab(string_value);
                    }

                });

                // close icon: removing the tab on click 

                tabs.delegate("span.fa-times", "click", function() {

                    Meteor.call('removePort');
                    isPaused = true; //intervel paused.

                    if ($('#tabs >ul >li').length > 1) {
                        $(this).parent().remove();
                        tabs.tabs("refresh");
                    } else //first li remove then show no device selected
                    {
                        $('.ui-tabs .ui-tabs-nav ').css({
                            'padding': '2.7em .2em 0'
                        });
                        $(this).parent().remove();
                        $('#tabs-1 div:first').hide();
                        $("#tabs-1").removeClass("ui-tabs-panel");
                        $("#tabs-1").removeClass("ui-widget-content");
                        $('#tabs-1').addClass('No_device');
                        $('#tabs-1').css({
                            'margin-top': resize_tabs1 / 2 + 'px'
                        });
                        $('#tabs-1').append('<span>No Device Selected <i class="fa fa-usb"></i></span>');

                    }
                });

            }); // funtion end tab creation

        } //side bar end rendered

}); //startup meteor end