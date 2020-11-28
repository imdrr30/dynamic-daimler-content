// ------------------------------------------------------- Global level config

// Elements configuration
const ELEMENT_CONFIG = {
	title_header: {
		html: `
		<div class="d-block text-center element_config title_header {css_classes}">
			<h2>{heading}</h2>
			<h5>{sub_heading}</h5>
		</div>
		`,
		values: ["heading", "sub_heading"],
		css_config: {
			left_align: "text-left",
			center_align: "text-center",
		},
	},
};

// Main state of the application
let state = {
	// code : ""
	// values:
	// 		heading: ""
	// css_config:
	// 		left_align: true
	add_element_config: {},
};

// ------------------------------------------------------- Functions

// returns the URL param passed for the key
function getURLParam(k) {
	var p = {};
	location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (s, k, v) {
		p[k] = v;
	});
	return k ? p[k] : p;
}

// to init the elements inside the add element config modal
// works based on the state.add_element_config
function initAddElementConfigModal() {
	let input_data_container = $("#element_input_modal #element_input_form");

	let text_input = state["add_element_config"]["values"];
	let check_input = state["add_element_config"]["css_config"];

	// text input
	$.each(text_input, function (input_name, input_value) {
		let form_group = $("<div></div>").addClass("form-group");
		form_group.append($("<label></label>").text(input_name));
		form_group.append(
			$("<input/>")
				.addClass("form-control text_input")
				.attr("name", input_name)
				.attr("value", input_value)
		);
		input_data_container.append(form_group);
	});

	// checkbox input
	$.each(check_input, function (input_name, input_value) {
		let form_group = $("<div></div>").addClass("form-group form-check");
		form_group.append(
			$("<input/>")
				.addClass("form-check-input check_input")
				.attr("name", input_name)
				.attr("type", "checkbox")
				.attr("checked", input_value)
		);
		form_group.append(
			$("<label></label>").text(input_name).addClass("form-check-label")
		);
		input_data_container.append(form_group);
	});
}

// to render the page with the data from the BE
// this data is the saved components in the BE
function initPageWithSavedComponents() {
	let main_saved_contents = $("#main_saved_contents");

	$.each(saved_elements_data, function (index, saved_config) {
		let code = saved_config["code"];
		let element_config = ELEMENT_CONFIG[code];
		let html = element_config["html"];

		// replace html values
		$.each(saved_config["values"], function (data_name, data_value) {
			html = html.replace(`{${data_name}}`, data_value);
		});

		// init the actions
		let action_tab = $(`<div class="d-flex justify-content-end"></div>`);
		action_tab.append(
			$(`<button class="btn btn-warning mr-2">Edit</button>`).on(
				"click",
				function () {
					alert(index);
				}
			)
		);
		action_tab.append(
			$(`<button class="btn btn-danger">Delete</button>`).on(
				"click",
				function () {
					alert(index);
				}
			)
		);

		// action tab | edit | delete
		main_saved_contents.append(action_tab);

		// add formed content to container
		main_saved_contents.append(
			$(html).attr("id", `${code}__${saved_config["id"]}`)
		);
	});
}

// To init all the event listeners in the app
function initEventListeners() {
	$(".elements_menu_button").click(function (event) {
		event.preventDefault();

		// variable to update the state
		let add_element_config = {
			values: {},
			css_config: {},
		};

		let element_code = event.target.innerHTML;

		// get the element config
		let input_element_config = ELEMENT_CONFIG[element_code];

		// input values
		$.each(input_element_config["values"], function (index, input_key) {
			add_element_config["values"][input_key] = "";
		});

		// select values
		$.each(
			input_element_config["css_config"],
			function (css_key, css_class) {
				add_element_config["css_config"][css_key] = false;
			}
		);

		// code for the input
		add_element_config["code"] = element_code;

		// update state before model open
		state["add_element_config"] = add_element_config;

		initAddElementConfigModal();
		// show modal
		$("#element_input_modal").modal("show");
	});
}

// ------------------------------------------------------- Event listeners

// On element config input model close
$("#element_input_modal").on("hide.bs.modal", function (e) {
	state["add_element_config"] = {};
	$("#element_input_modal #element_input_form").empty();
});

// On element config input model saved | save button for input input
$("#element_input_save").on("click", function (e) {
	let data_to_send = {
		values: {},
		css_config: {},
		code: state.add_element_config["code"],
	};

	// text input
	$.each($("#element_input_form .text_input"), function (index, element) {
		data_to_send["values"][element.name] = element.value;
	});

	// check input
	$.each($("#element_input_form .check_input"), function (index, element) {
		data_to_send["css_config"][element.name] = element.checked;
	});

	// same page request
	$.ajax({
		data: JSON.stringify(data_to_send),
		type: "POST",
		dataType: "json",
		contentType: "application/json",
		beforeSend: function (_) {
			data_to_send["page_id"] = getURLParam("view");
			console.log(data_to_send);
		},
		success: function (result) {
			alert(result, "success response");
			window.location.reload();
		},
	});
});

// ------------------------------------------------------- Called after other pre processing

// Elements menu rendering function
let elements_menu_holder = $("#elements_menu_holder");
$.each(ELEMENT_CONFIG, function (element_key, element_config) {
	let menu_button = $("<button></button>")
		.addClass("btn btn-primary btn-lg elements_menu_button")
		.text(element_key);

	elements_menu_holder.append(menu_button);
});

initPageWithSavedComponents();
initEventListeners();
