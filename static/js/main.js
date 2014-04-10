function showUser(userData){
	var account = $('<div>').addClass("account").addClass("col-md-2 panel panel-default");
	account.append($('<div>').addClass("name").text(userData.name));
	account.append($('<div>').addClass("credit").text(userData.credit + " €"));

	$('#accounts').append(account);
	account.click(function(){
		showDetail(userData);
	})
}

function showDetail(userData){
	var detail = $('<div class="detail">');
	detail.append($('<div>').addClass("name").text(userData.name));
	detail.append($('<div>').addClass("credit").text(userData.credit + " €"));

	// Add Credit-Area
	var addCreditArea = $('<div>').addClass('panel').addClass('panel-default');
	addCreditArea.append($('<div>').addClass('panel-heading')
		.append($('<h3>').addClass('panel-title').text('Add Credit'))
	);

	detail.append(addCreditArea);

	var plus5Button = $('<div>').addClass('panel-body')
		.append($('<button>').addClass('btn btn-primary btn-lg').text("+ 5€"));
	addCreditArea.append(plus5Button);
	
	var removeCreditArea = $('<div>').addClass('panel').addClass('panel-default');
	addCreditArea.append($('<div>').addClass('panel-heading')
		.append($('<h3>').addClass('panel-title').text('Remove Credit'))
	);
	var removeCreditAreaBody = $('<div>').addClass('panel-body');

	addCreditArea.append(removeCreditAreaBody);

	var minus50Button  = $('<button>').addClass('btn btn-danger btn-lg').text("- 0,50€");
	var minus100Button = $('<button>').addClass('btn btn-danger btn-lg').text("- 1,00€");
	var minus150Button = $('<button>').addClass('btn btn-danger btn-lg').text("- 1,50€");
	var minus200Button = $('<button>').addClass('btn btn-danger btn-lg').text("- 2,00€");

	removeCreditAreaBody.append(minus50Button);
	removeCreditAreaBody.append(minus100Button);
	removeCreditAreaBody.append(minus150Button);
	removeCreditAreaBody.append(minus200Button);

	var backButton = $('<ul>').addClass('pager').append($('<li>').addClass('previous').append($('<a>').text('← Back')));
	detail.append(backButton);

	$('#details').empty().append(detail);
	changeView('detail');

	plus5Button.click(function(){
		changeCredit(userData, 5);
	});
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

	backButton.click(function(){
		changeView('accounts');
	});
}

function getAllUsers(){
	$.getJSON("/users/all", function(data){
		$('#accounts').empty();
		data.forEach(function(user){
			showUser(user);
		});
	});
}

function changeView(view){
	$('.view').hide();
	switch(view){
		case 'detail':
			$('#details').show();
			break;
		case 'accounts':
			getAllUsers();
			$('#accounts').show();
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

$(function(){
	changeView('accounts');
	getAllUsers();
});