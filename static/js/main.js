var socket = io.connect('http://' + window.location.host);
var accounts = undefined;

function showUser(userData){
	var account = $('<div>').addClass("account col-md-2 panel panel-default");
	if(userData.credit < 0){
		account.addClass("debt");
	}
	account.append($('<div>').addClass("name").text(userData.name));
	account.append($('<div>').addClass("credit").text(userData.credit.toFixed(2) + " €"));

	$('#accounts').append(account);
	account.click(function(){
		showDetail(userData);
	})
}

function showDetail(userData){
	var detail = $('<div class="detail">');

	var row = $('<div class="row">');
	detail.append(row);

	var userinfo = $('<div class="userinfo col-md-3 panel panel-default">');
	row.append(userinfo);

	userinfo.append($('<div>').addClass("name").text(userData.name));
	userinfo.append($('<div>').addClass("credit").text(userData.credit.toFixed(2) + " €"));

	// Add Credit-Area
	var addCreditArea = $('<div>').addClass('panel panel-default');
	addCreditArea.append($('<div>').addClass('panel-heading')
		.append($('<h3>').addClass('panel-title').text('Add Credit'))
	);

	var creditarea = $('<div class="creditarea col-md-9">');
	row.append(creditarea);

	creditarea.append(addCreditArea);
	var addCreditAreaBody = $('<div>').addClass('panel-body');
	addCreditArea.append(addCreditAreaBody);

	var plus10Button = $('<button>').addClass('btn btn-success btn-lg').text("+ 0.10€");
	var plus50Button = $('<button>').addClass('btn btn-success btn-lg').text("+ 0.50€");
	var plus100Button = $('<button>').addClass('btn btn-success btn-lg').text("+ 1,00€");
	var plus200Button = $('<button>').addClass('btn btn-success btn-lg').text("+ 2,00€");
	var plus500Button = $('<button>').addClass('btn btn-success btn-lg').text("+ 5,00€");

	var plusbuttons = [plus10Button, plus50Button, plus100Button, plus200Button, plus500Button];
	addCreditAreaBody.append(plusbuttons);
	
	var removeCreditArea = $('<div>').addClass('panel panel-default');
	addCreditArea.append($('<div>').addClass('panel-heading')
		.append($('<h3>').addClass('panel-title').text('Remove Credit'))
	);
	var removeCreditAreaBody = $('<div>').addClass('panel-body');

	addCreditArea.append(removeCreditAreaBody);

	var minus50Button  = $('<button>').addClass('btn btn-danger btn-lg').text("- 0,50€");
	var minus100Button = $('<button>').addClass('btn btn-danger btn-lg').text("- 1,00€");
	var minus150Button = $('<button>').addClass('btn btn-danger btn-lg').text("- 1,50€");
	var minus200Button = $('<button>').addClass('btn btn-danger btn-lg').text("- 2,00€");

	var minusbuttons = [minus50Button, minus100Button, minus150Button, minus200Button]
	removeCreditAreaBody.append(minusbuttons);

	var backButton = $('<ul>').addClass('pager').append($('<li>').addClass('previous').append($('<a>').text('← Back')));
	detail.append(backButton);

	$('#details').empty().append(detail);
	changeView('detail');

	// Plus Buttons
	plus10Button.click(function(){
		changeCredit(userData, 0.1);
	});
	plus50Button.click(function(){
		changeCredit(userData, 0.5);
	});
	plus100Button.click(function(){
		changeCredit(userData, 1);
	});
	plus200Button.click(function(){
		changeCredit(userData, 2);
	});
	plus500Button.click(function(){
		changeCredit(userData, 5);
	});

	// Minus Buttons
	minus50Button.click(function(){
		changeCredit(userData, -0.5);
	});
	minus100Button.click(function(){
		changeCredit(userData, -1);
	});
	minus150Button.click(function(){
		changeCredit(userData, -1.5);
	});
	minus200Button.click(function(){
		changeCredit(userData, -2);
	});

	// Back Button
	backButton.click(function(){
		changeView('accounts');
	});
}

function getAllUsers(){
	$('#accounts').empty();
	
	accounts.sort(function (a, b) {
		return (a.lastchanged < b.lastchanged);
	});
	
	accounts.forEach(function(user){
		showUser(user);
	});
	var newuser = $('<div>').addClass('account col-md-2 panel panel-default')
		.append($('<div>').addClass('newuser').text('+'));
	$('#accounts').append(newuser);

	newuser.click(function(){
		newUser();
	});
}

function newUser(){
	$('#newuser').empty();
	var newUserForm = $('<form role="form" id="newUserForm">');
	var newUserFormGroup = $('<div id="newUserForm" class="form-group">');
	newUserForm.append(newUserFormGroup);
	newUserFormGroup.append($('<input type="username" name="username" required class="form-control">'));
	newUserFormGroup.append($('<input type="submit" value="Add user" class="form-control">'));

	var backButton = $('<ul>').addClass('pager').append($('<li>').addClass('previous').append($('<a>').text('← Back')));
	$('#newuser').append(backButton);

	newUserForm.submit(function(e){
	    e.preventDefault();
	    $.ajax({
            url: '/user/add',
            type: "POST",
            data: $('#newUserForm').serialize(),
            success: function(){
            	changeView('accounts');
            },
            error: function(err){
            	alert(err.responseText);
            }
        });
	});

	backButton.click(function(){
		changeView('accounts');
	});

	$('#newuser').append(newUserForm);

	changeView('new');
}

function changeView(view){
	$('.view').hide();
	switch(view){
		case 'detail':
			$('#details').show();
			break;
		case 'accounts':
			socket.emit('getAccounts');
			$('#accounts').show();
			break;
		case 'new':
			$('#newuser').show();
			break;

		default:
			throw 'Invalid View: ' + view;
	}
}

function changeCredit(userData, delta){
	$.ajax({
		url: "/user/credit",
		type: "POST",
		dataType: "json",
		data: {
			"username": userData.name,
			"delta": delta
		}
	}).done(function(data){
		showDetail(data);
	});
}

socket.on('accounts', function (data) {
	data = JSON.parse(data);
	accounts = data;
	getAllUsers();
});

socket.on('ka-ching', function() {
    var p = $('#ka-ching').get(0);
    p.pause();
    p.currentTime = 0;
    p.play();
});

changeView('accounts');
