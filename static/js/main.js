var socket = io.connect('http://' + window.location.host);
var accounts = [];
var filter = ""
var sortby = "time" //valid values: time abc zyx

var products = [];

function showUser(userData) {
    var account = $('<div>').addClass("account col-md-2 panel panel-default");
    if (userData.credit < 0) {
        account.addClass("debt");
    }
    account.append($('<div>').addClass("name").text(userData.name));
    account.append($('<div>').addClass("credit").text(userData.credit.toFixed(2) + " €"));

    $('#accounts').append(account);
    account.click(function () {
        getUserDetail(userData.name, null);
    })
}

function getUserDetail(username, pincode) {
    lockUi();
    $.ajax({
        url: "/user/" + username,
        type: "GET",
        dataType: "json",
        headers: {
            "X-User-Pincode": pincode
        },
        success: function (data) {
            releaseUi();
            showDetail(data, pincode);
        },
        error: function (err) {
            releaseUi();
            if (err.status == 401) {
                hidePinpad();
                showPinpad(username, function (username, pincode) {
                    hidePinpad();
                    getUserDetail(username, pincode);
                });
                return;
            }
            alert(err.responseText);
        }
    });
}

function getUserByToken(token) {
    lockUi();
    $.ajax({
        url: "/token/" + token,
        type: "GET",
        dataType: "json",

        success: function (user) {
            releaseUi();
            if (!user != null) {
                getUserDetail(user.name, token);
            }
        },
        error: function (err) {
            releaseUi();
            alert(err.responseText);
        }
    });
}

function showDetail(userData, pincode) {
    var detail = $('<div class="detail">');

    var row = $('<div class="row">');
    detail.append(row);

    var userinfo = $('<div class="userinfo col-md-3">');
    row.append(userinfo);

    userinfo.append($('<div>').addClass("name").text(userData.name));
    userinfo.append($('<div>').addClass("credit").text(userData.credit.toFixed(2) + " €"));


    var backButton = $('<ul>').addClass('pager').append($('<li>').addClass('previous').append($('<a>').text('← Back')));
    userinfo.append(backButton);

    var creditarea = $('<div class="creditarea col-md-9">');
    row.append(creditarea);

    // Add Credit-Area
    var addCreditArea = $('<div>').addClass('panel panel-default');
    addCreditArea.append($('<div>').addClass('panel-heading')
        .append($('<h3>').addClass('panel-title').text('Add Credit'))
    );

    var addCreditAreaBody = $('<div>').addClass('panel-body');
    addCreditArea.append(addCreditAreaBody);

    var plus50Button = $('<button>').addClass('btn btn-success btn-lg btn-credit-action').text("+ 0.50€").attr("data-credit", "0.5");
    var plus100Button = $('<button>').addClass('btn btn-success btn-lg btn-credit-action').text("+ 1.00€").attr("data-credit", "1");
    var plus200Button = $('<button>').addClass('btn btn-success btn-lg btn-credit-action').text("+ 2.00€").attr("data-credit", "2");
    var plus500Button = $('<button>').addClass('btn btn-success btn-lg btn-credit-action').text("+ 5.00€").attr("data-credit", "5");

    var plusbuttons = [plus50Button, plus100Button, plus200Button, plus500Button];
    addCreditAreaBody.append(plusbuttons);

    var removeCreditArea = $('<div>').addClass('panel panel-default');
    removeCreditArea.append($('<div>').addClass('panel-heading')
        .append($('<h3>').addClass('panel-title').text('Remove Credit'))
    );

    var removeCreditAreaBody = $('<div>').addClass('panel-body');
    removeCreditArea.append(removeCreditAreaBody);


    var productsArray = [];

    products.forEach(function (product) {
        var button = $('<button>').addClass('btn btn-danger btn-lg btn-credit-action')
        button.attr("data-credit", -product.price)
            .attr("data-name", product.name)
            .attr("data-desc", product.description)
            .attr("data-ean", product.ean);

        button.append($('<img>').attr('src', product.image).attr('style', 'height: 90px'), $('<br>'), "-" + product.price.toFixed(2) + " €");
        productsArray.push(button);
    });

    var minus50Button = $('<button>').addClass('btn btn-danger btn-lg btn-credit-action').text("- 0.50€").attr("data-credit", "-0.5");
    var minus100Button = $('<button>').addClass('btn btn-danger btn-lg btn-credit-action').text("- 1.00€").attr("data-credit", "-1");
    var minus150Button = $('<button>').addClass('btn btn-danger btn-lg btn-credit-action').text("- 1.50€").attr("data-credit", "-1.5");
    var minus200Button = $('<button>').addClass('btn btn-danger btn-lg btn-credit-action').text("- 2.00€").attr("data-credit", "-2");

    var minusbuttons = [minus50Button, minus100Button, minus150Button, minus200Button]
    removeCreditAreaBody.append(productsArray);
    removeCreditAreaBody.append($("<br>"));
    removeCreditAreaBody.append(minusbuttons);


    creditarea.append([addCreditArea, removeCreditArea]);


    var changeSetPinButton = $('<ul>').addClass('pager').append($('<li>').addClass('previous').append($('<a>').text('change/set PIN')));
    detail.append(changeSetPinButton);

    var renameButton = $('<ul>').addClass('pager').append($('<li>').addClass('previous').append($('<a>').text('rename')));
    detail.append(renameButton);

    var changeTokenButton = $('<ul>').addClass('pager').append($('<li>').addClass('previous').append($('<a>').text('change/set token')));
    detail.append(changeTokenButton);

    $('#details').empty().append(detail);
    changeView('details');

    // Credit buttons
    $("button.btn-credit-action[data-credit!=''][data-credit]").click(function () {
        changeCredit(userData, pincode, $(this).attr("data-credit"), $(this).attr("data-desc"), $(this).attr("data-name"));
        resetTimer();
    });

    // Back Button
    backButton.click(function () {
        changeView('accounts');
    });

    // rename Button
    renameButton.click(function () {
        renameUser(userData, pincode);
    });

    // rename Button
    changeTokenButton.click(function () {
        changeToken(userData, pincode);
    });

    // set PIN button
    changeSetPinButton.click(function () {
        showPinpad(userData.name, function (username, newPincode) {
            hidePinpad();
            changePin(username, pincode, newPincode);
        });
    })
}

function showStatistics() {
    $('#statistics').empty();
    var saldo = 0;
    accounts.forEach(function (account) {
        saldo += account.credit;
    });
    var statistic = $('<div>').addClass("statistic col-md-2 panel panel-default");
    statistic.append($('<div>').addClass("title").text("Gesamtsaldo"));
    statistic.append($('<div>').addClass("value").text(saldo + " €"));

    $('#statistics').append(statistic);

    var backButton = $('<ul>').addClass('pager').append($('<li>').addClass('previous').append($('<a>').text('← Back')));
    $('#statistics').append(backButton);

    backButton.click(function () {
        changeView('accounts');
    });
}

function getAllUsers() {
    $('#accounts').empty();

    accounts.sort(function (a, b) {
        switch (sortby) {
            case "time":
                var aDate = new Date(a.lastchanged)
                var bDate = new Date(b.lastchanged)
                return (aDate < bDate) ? 1 : -1;
            case "abc":
                return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
            case "zyx":
                return b.name.toLowerCase().localeCompare(a.name.toLowerCase());
            default:
                throw "Invalid sorting criteria"
        }

    });

    var filtered = accounts.filter(function (account) {
        return account.name.toLowerCase().indexOf(filter) != -1
    });

    filtered.forEach(function (user) {
        showUser(user);
    });
    var newuser = $('<div>').addClass('account col-md-2 panel panel-default')
        .append($('<div>').addClass('newuser').text('+'));
    $('#accounts').append(newuser);

    newuser.click(function () {
        newUser();
    });
}

function newUser() {
    $('#newuser').empty();
    var newUserForm = $('<form role="form" id="newUserForm">');
    var newUserFormGroup = $('<div id="newUserForm" class="form-group">');
    newUserForm.append(newUserFormGroup);
    newUserFormGroup.append($('<input type="username" name="username" placeholder="user name   (15 characters maximum)" maxlength=15 required class="form-control">'));
    newUserFormGroup.append($('<input type="submit" value="Add user" class="form-control">'));

    var backButton = $('<ul>').addClass('pager').append($('<li>').addClass('previous').append($('<a>').text('← Back')));
    $('#newuser').append(backButton);

    newUserForm.submit(function (e) {
        lockUi()
        e.preventDefault();
        $.ajax({
            url: '/user/add',
            type: "POST",
            data: $('#newUserForm').serialize(),
            success: function () {
                releaseUi()
                changeView('accounts');
            },
            error: function (err) {
                releaseUi()
                alert(err.responseText);
            }
        });
    });

    backButton.click(function () {
        changeView('accounts');
    });

    $('#newuser').append(newUserForm);

    changeView('newuser');
}

function renameUser(userData, pincode) {
    $('#renameuser').empty();
    var renameUserForm = $('<form role="form" id="renameUserForm">');
    var renameUserFormGroup = $('<div id="renameUserForm" class="form-group">');
    renameUserForm.append(renameUserFormGroup);
    renameUserFormGroup.append($('<input type="hidden" name="username" value="' + userData.name + '" required class="form-control">'));
    renameUserFormGroup.append($('<input type="username" name="newname" id="newname" placeholder="new name   (15 characters maximum)" maxlength=15 required class="form-control" >'));
    renameUserFormGroup.append($('<input type="submit" value="rename user" class="form-control">'));

    var backButton = $('<ul>').addClass('pager').append($('<li>').addClass('previous').append($('<a>').text('← Back')));
    $('#renameuser').append(backButton);

    renameUserForm.submit(function (e) {
        lockUi()
        e.preventDefault();
        $.ajax({
            url: '/user/rename',
            type: "POST",
            data: $('#renameUserForm').serialize(),
            headers: {
                "X-User-Pincode": pincode
            },
            success: function () {
                userData.name = $('#newname').val();
                getUserDetail(userData.name, pincode);
                releaseUi();
            },
            error: function (err) {
                releaseUi()
                alert(err.responseText);
            }
        });
    });

    backButton.click(function () {
        changeView('details');
    });

    $('#renameuser').append(renameUserForm);

    changeView('rename');
}


function changeToken (userData, pincode) {
    $('#changetoken').empty();
    var changeTokenForm = $('<form role="form" id="changeTokenForm">');
    var changeTokenFormGroup = $('<div id="changeTokenForm" class="form-group">');
    changeTokenForm.append(changeTokenFormGroup);
    changeTokenFormGroup.append($('<input type="hidden" name="username" value="' + userData.name + '" required class="form-control">'));
    changeTokenFormGroup.append($('<input type="token" readonly=readonly name="newtoken" id="newtoken" placeholder="please scan token now" maxlength=15 required class="form-control" >'));
    changeTokenFormGroup.append($('<input type="submit" value="save token" class="form-control">'));

    var backButton = $('<ul>').addClass('pager').append($('<li>').addClass('previous').append($('<a>').text('← Back')));
    $('#changetoken').append(backButton);

    changeTokenForm.submit(function (e) {
        lockUi()
        e.preventDefault();
        $.ajax({
            url: '/user/change-token',
            type: "POST",
            data: $('#changeTokenForm').serialize(),
            headers: {
                "X-User-Pincode": pincode
            },
            success: function () {
                getUserDetail(userData.name, pincode);
                releaseUi();
            },
            error: function (err) {
                releaseUi()
                alert(err.responseText);
            }
        });
    });

    backButton.click(function () {
        changeView('details');
    });


    $('#changetoken').append(changeTokenForm);
    changeView('changetoken');
}

function changePin(username, pincode, newPincode) {
    lockUi();
    $.ajax({
        url: '/user/change-pin',
        type: "POST",
        data: {
            username: username,
            pincode: newPincode
        },
        headers: {
            "X-User-Pincode": pincode
        },
        success: function () {
            releaseUi();
            getUserDetail(username, newPincode);
        },
        error: function (err) {
            releaseUi()
            alert(err.responseText);
        }
    });
}

function changeView(view) {
    resetTimer();
    $('.view').hide();
    switch (view) {
        case 'details':
            $('#details').show();
            break;
        case 'accounts':
            socket.emit('getAccounts');
            $('#accounts').show();
            $("nav").show();
            break;
        case 'newuser':
            $('#newuser').show();
            break;
        case 'rename':
            $('#renameuser').show();
            break;
        case 'changetoken':
            $('#changetoken').show();
            break;
        case 'statistics':
            socket.emit('getAccounts');
            showStatistics();
            $('#statistics').show();
            break;

        default:
            throw 'Invalid View: ' + view;
    }
}

var timer = null;
function resetTimer() {
    clearTimeout(timer);
    timer = setTimeout(function () {
        hidePinpad();
        changeView('accounts');
    }, 23.42 * 1000);
}


function changeCredit(userData, pincode, delta, description, product) {
    description = description || null;
    product = product || null;

    lockUi();
    $.ajax({
        url: "/user/credit",
        type: "POST",
        dataType: "json",
        data: {
            "username": userData.name,
            "delta": delta,
            "product": product,
            "description": description
        },
        headers: {
            "X-User-Pincode": pincode
        },
        success: function (data) {
            showDetail(data, pincode);
            releaseUi()
        },
        error: function (err) {
            releaseUi()
            alert(err.responseText);
        }
    });
}

function lockUi() {
    $("#uilock").modal({
        backdrop: false,
        keyboard: false,

    })
}

function releaseUi() {
    $("#uilock").modal('hide')
}


function showPinpad(username, cb) {

    var pinwindowForm = $('<form role="form" id="pinwindowForm">');
    var pinwindowFormGroup = $('<div id="pinwindowFormGroup" class="form-group">');
    pinwindowForm.append(pinwindowFormGroup);
    pinwindowFormGroup.append($('<input type="hidden" id="pinwindow-user" name="username" value="' + username + '" />'));
    pinwindowFormGroup.append($('<input type="password" name="pin" id="pinwindow-pin" placeholder="PIN" required class="form-control">'));

    var pinwindowPad = $('<div id="pinwindow-pad" class="form-group">');
    pinwindowPad.append($('<div class="col-xs-4 btn" id="pinpad-num-1">1</div>'));
    pinwindowPad.append($('<div class="col-xs-4 btn" id="pinpad-num-2">2</div>'));
    pinwindowPad.append($('<div class="col-xs-4 btn" id="pinpad-num-3">3</div>'));
    pinwindowPad.append($('<div class="col-xs-4 btn" id="pinpad-num-4">4</div>'));
    pinwindowPad.append($('<div class="col-xs-4 btn" id="pinpad-num-5">5</div>'));
    pinwindowPad.append($('<div class="col-xs-4 btn" id="pinpad-num-6">6</div>'));
    pinwindowPad.append($('<div class="col-xs-4 btn" id="pinpad-num-7">7</div>'));
    pinwindowPad.append($('<div class="col-xs-4 btn" id="pinpad-num-8">8</div>'));
    pinwindowPad.append($('<div class="col-xs-4 btn" id="pinpad-num-9">9</div>'));
    pinwindowPad.append($('<div class="col-xs-4 btn btn-danger" id="pinpad-back"><i class="glyphicon glyphicon-remove" /></div>'));
    pinwindowPad.append($('<div class="col-xs-4 btn" id="pinpad-num-0">0</div>'));
    pinwindowPad.append($('<div class="col-xs-4 btn btn-success btn-subm" id="pinpad-ok"><i class="glyphicon glyphicon-ok" /></div>'));

    pinwindowForm.append(pinwindowFormGroup);
    pinwindowForm.append(pinwindowPad);

    $("#pinwindow-content").empty().append(pinwindowForm);

    for (var i = 0; i <= 9; i++) {
        $('#pinpad-num-' + i).on('click', function (e) {
            var field = $('#pinwindow-pin');
            field.val(field.val() + e.target.textContent);
            resetTimer();
        });
    }

    $('#pinpad-ok').click(function () {
        pinwindowForm.submit()
    });

    pinwindowForm.submit(function (e) {
        e.preventDefault();
        cb($("#pinwindow-user").val(), $("#pinwindow-pin").val());
        return false;
    });

    $('#pinpad-back').click(function () {
        hidePinpad();
    });

    $("#pinwindow").modal({
        backdrop: "static",
        keyboard: false,
    })
}

function hidePinpad() {
    $("#pinwindow-pin").val("");
    $("#pinwindow").modal('hide');
    $("#pinwindow-content").empty();
}

socket.on('accounts', function (data) {
    var data = JSON.parse(data);
    accounts = data;
    getAllUsers();
});

socket.on('products', function (data) {
    var data = JSON.parse(data);
    products = data;
});

socket.on('ka-ching', function () {
    var p = $('#ka-ching').get(0);
    p.pause();
    p.currentTime = 0;
    p.play();
});

socket.on('one-up', function () {
    var p = $('#one-up').get(0);
    p.pause();
    p.currentTime = 0;
    p.play();
});

function updateFilter() {
    filter = $("#search input").get(0).value.toLowerCase()
    changeView("accounts")
}

function setup() {
    $("#search input").on("input", null, null, updateFilter)
    $("#search button").click(function (e) {
        //fix because click fires before the field is actually reseted
        e.preventDefault();
        $("#search").get(0).reset();
        updateFilter();
    })
    $("#searchtoggle").click(function () {
        if ($("#search").is(":visible")) {
            $("#search").get(0).reset();
            updateFilter();
            $("#searchtoggle").removeClass("active");
            $("#search").hide();
        } else {
            $("#searchtoggle").addClass("active");
            $("#search").show();
        }
    })
    $("#search").hide();


    $("#stats").click(function () {
        changeView('statistics')
    });
    $("#sorttime").click(function () {
        setSort("time")
    });
    $("#sortabc").click(function () {
        setSort("abc")
    });
    $("#sortzyx").click(function () {
        setSort("zyx")
    });


    $(document).scannerDetection({
        timeBeforeScanTest: 2000,
        avgTimeByChar: 2000,
        ignoreIfFocusOn: 'input',
        onComplete: function (barcode) {

            if (barcode.substr(0, 3) == "<U>") {
                // User barcode scanned
                if ($('#details').is(":visible")) {
                    // Logout from user page
                    changeView("accounts");
                } else if ($('#changetoken').is(":visible")) {
                    $('#newtoken').attr("value", barcode.substr(3));
                } else {
                    // Logout from any other page
                    getUserByToken(barcode.substr(3));
                }
            } else {
                // Product barcode scanned

                // When on user page, "click" the right button
                console.log("Searching product for ean " + barcode);

                var product = null;

                $.each(products, function (key, value) {
                    if (value.ean != null) {

                        eans = value.ean.split("|");
                        console.log(eans);
                        if (eans.indexOf(barcode) >= 0) {
                            console.log("Found product " + value.name + " in ean array");
                            product = value;
                            return false;
                        }
                    }
                });

                if (product != null) {
                    if ($('#details').is(":visible")) {

                        button = $("button[data-name='" + product.name + "']");

                        if ($(button).length > 0) {
                            button.click();
                        } else {
                            alert("Product not found.");
                        }
                    }
                } else {
                    alert("Product not found.");
                }
                product = null;
            }
        }
    });


}

function setSort(by) {
    sortby = by;
    changeView("accounts");
    $(".sortbtn").removeClass("active");
    $("#sort" + by).addClass("active");
}

setup();
changeView('accounts');
