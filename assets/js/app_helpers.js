/**
 * Gets the passed URL params for a given page and return the query_param value for the
 * passed key. Used while sending data to the server.
 */
function getURLParam(k) {
	var p = {};
	location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (s, k, v) {
		p[k] = v;
	});
	return k ? p[k] : p; // single value or all
}

/**
 * The user input modal handles the data while creating a component and while
 * editing a component. This function is used to get the necessary data from the model.
 * This is moslty called before sending data to the BE.
 */
function getUserInputFromModal() {
	let data_to_send = {
		...INITIAL_STATE["add_element_config"],
		code: state.add_element_config["code"],
		id: state.add_element_config["id"] || null,
	};

	// text input
	$.each($("#element_input_form .text_input"), function (index, element) {
		let dict_key_to_store = element.name.includes("__") ? "temp" : "values";
		data_to_send[dict_key_to_store][element.name] = element.value;
	});

	// check input
	$.each($("#element_input_form .check_input"), function (index, element) {
		data_to_send["css_config"][element.name] = element.checked;
	});

	// other backend config
	data_to_send["page_id"] = getURLParam("view");

	return data_to_send;
}

/**
 * This function sends the requests to the BE server. This uses ajax jQuery.
 * This is also used to send Form and JSON data depending on the params.
 */
function sendAjaxRequest(
	data,
	url,
	method = "POST",
	isFileUpload = false,
	successFunc = null
) {
	let other_config = {};
	if (isFileUpload) {
		// for file upload | i.e FormData
		other_config = {
			data: data,
			contentType: false,
			processData: false,
		};
	} else {
		// for other json request | json data
		other_config = {
			data: JSON.stringify(data),
			dataType: "json",
			contentType: "application/json",
		};
	}

	$.ajax({
		url: url,
		type: method,
		beforeSend: function (_) {
			console.log(data);
			console.log(JSON.stringify(data));
		},
		success: function (result) {
			if (successFunc === null) {
				window.location.reload();
			} else {
				successFunc(result);
			}
		},
		error: function (jqXHR, textStatus, errorThrown) {
			window.location.reload();
		},
		...other_config,
	});
}

/**
 * This function resets the add_element_config state and the linked model.
 * Used after each opeartion that modifies the model.
 */
function resetAddElementConfig() {
	state["add_element_config"] = INITIAL_STATE["add_element_config"];
	$("#element_input_modal #element_input_form").empty();
}

/**
 * This is called before the opening/init of the model. This simply sets the state
 * for the model based on the element code.
 */
function setAddElementState(element_code) {
	// variable to update the state
	let add_element_config = JSON.parse(
		JSON.stringify(INITIAL_STATE["add_element_config"])
	);

	// get the element config
	let input_element_config = getAllElementsConfig()[element_code];

	// input values
	$.each(input_element_config["values"], function (index, input_key) {
		add_element_config["values"][input_key] = "";
	});

	// select values
	$.each(input_element_config["css_config"], function (css_key, css_class) {
		add_element_config["css_config"][css_key] = false;
	});

	// code for the input
	add_element_config["code"] = element_code;

	// update state before model open
	state["add_element_config"] = add_element_config;
}

/**
 * To init the contents of the modal based on the data from the state.
 * This renders other dynamic fields as well.
 */
function initAddElementConfigModal() {
	let input_data_container = $("#element_input_modal #element_input_form");

	let add_element_config = state["add_element_config"];
	let text_input = add_element_config["values"];
	let check_input = add_element_config["css_config"];

	// text input
	$.each(text_input, function (input_name, input_value) {
		let form_group = $("<div></div>").addClass("form-group");
		form_group.append($("<label></label>").text(input_name));
		form_group.append(
			$("<textarea>"+input_value+"</textarea>")
				.addClass("form-control text_input")
				.attr("name", input_name)
				//.attr("value", input_value)
		);

		// if in case an image uploader is necessary
		// add a button that helps upload and get the file url
		if (
			input_name.includes("image_src") ||
			input_name.includes("file_src")
		) {
			form_group.append(
				$(
					`<input type="file" class='mt-2' name='${input_name}__file' />`
				).on("change", function () {
					let formData = new FormData();
					let files = $(`input[name='${input_name}__file']`)[0].files;
					if (files.length > 0) {
						formData.append("file", files[0]);
						sendAjaxRequest(
							formData,
							"content.php",
							"POST",
							true,
							function (result) {
								$(`textarea[name='${input_name}']`)[0].value =
									result["file"];
							}
						);
					}
				})
			);
		}

		input_data_container.append(form_group);
	});

	// just to separate css from html
	input_data_container.append($(`<hr />`));

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

/**
 * Given the parent block under which the saved elements are to be created, this function
 * renders the elements using the defined config and other stuff. When the `addModifyActions` is
 * passed, this adds the edit and the delete button as well for modification operations.
 */
function renderSavedElements(jQueryElement, addModifyActions = true) {
	// for each element in the data from the server
	$.each(saved_elements_data, function (index, saved_config) {
		let code = saved_config["code"];
		let element_config = getAllElementsConfig()[code];
		let html = element_config["html"];

		// adding ID for dynamic content
		html = html.replaceAll(`{id}`, saved_config["id"] || "null");

		// replace html values
		$.each(saved_config["values"], function (data_name, data_value) {
			html = html.replace(`{${data_name}}`, data_value);

			// other custom elements | showing file source
			if (["file_src"].includes(data_name)) {
				html = html.replace(
					`{file_src_name}`,
					data_value.split("/").pop()
				);
			}
		});

		// adding the css class names
		let css_class_string = "";
		$.each(saved_config["css_config"], function (css_key, css_bool) {
			if (css_bool) {
				css_class_string += `${element_config["css_config"][css_key]} `;
			}
		});
		html = html.replace(`{css_classes}`, css_class_string);

		if (addModifyActions) {
			// init the actions
			let action_tab = $(
				`<div class="d-flex justify-content-end"></div>`
			);
			action_tab.append(
				$(
					`<button type="button" class="btn btn-warning mr-2">Edit</button>`
				).on("click", function (e) {
					e.preventDefault();

					// edit element state
					state["add_element_config"] = saved_config;

					initAddElementConfigModal();

					// show modal
					$("#element_input_modal").modal("show");
				})
			);
			action_tab.append(
				$(
					`<button type="button" class="btn btn-danger">Delete</button>`
				).on("click", function (e) {
					e.preventDefault();

					sendAjaxRequest(
						{
							page_id: getURLParam("view"),
							id: saved_config["id"],
						},
						"content.php",
						"DELETE"
					);
				})
			);
			// action tab | edit | delete
			jQueryElement.append(action_tab);
		}

		// add formed content to container
		jQueryElement.append(
			$(html).attr("id", `${code}_${saved_config["id"]}`)
		);
	});
}
