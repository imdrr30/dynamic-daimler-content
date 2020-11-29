// returns the URL param passed for the key
function getURLParam(k) {
	var p = {};
	location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (s, k, v) {
		p[k] = v;
	});
	return k ? p[k] : p;
}

// gets the user input from the user model with a defined schema
function getUserInputFromModal() {
	let data_to_send = {
		values: {},
		css_config: {},
		code: state.add_element_config["code"],
		id: state.add_element_config["id"] || null,
	};

	// text input
	$.each($("#element_input_form .text_input"), function (index, element) {
		data_to_send["values"][element.name] = element.value;
	});

	// check input
	$.each($("#element_input_form .check_input"), function (index, element) {
		data_to_send["css_config"][element.name] = element.checked;
	});

	// other backend config
	data_to_send["page_id"] = getURLParam("view");

	return data_to_send;
}

// sends request to the server
function sendAjaxRequest(data, url, isFileUpload = false, successFunc = null) {
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
		type: "POST",
		beforeSend: function (_) {
			console.log(data);
		},
		success: function (result) {
			if (successFunc === null) {
				window.location.reload();
			} else {
				successFunc(result);
			}
		},
		error: function (jqXHR, textStatus, errorThrown) {
			// window.location.reload();
		},
		...other_config,
	});
}

// resets the add element config and mmodal
function resetAddElementConfig() {
	state["add_element_config"] = {};
	$("#element_input_modal #element_input_form").empty();
}

// sets the add_element_config in the state based on the element code
function setAddElementState(element_code) {
	// variable to update the state
	let add_element_config = {
		values: {},
		css_config: {},
	};

	// get the element config
	let input_element_config = ELEMENT_CONFIG[element_code];

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

// to init the elements inside the add element config modal
// works based on the state.add_element_config
function initAddElementConfigModal() {
	let input_data_container = $("#element_input_modal #element_input_form");

	let code = state["add_element_config"]["code"];
	let text_input = state["add_element_config"]["values"];
	let check_input = state["add_element_config"]["css_config"];

	// if in case the element neeeds dynamic nature
	if (["image_carousel"].includes(code)) {
		let count_form_group = $("<div class='form-group'></div>")
			.append($("<label>Count</label>"))
			.append(
				$("<input />")
					.addClass("form-control text_input")
					.attr("name", `${code}__count`)
					.attr(
						"value",
						state["add_element_config"]["values"][
							`${code}__count`
						] || 2
					)
					.attr("type", "number")
					.attr("min", 2)
					.attr("max", 6)
					.on("change", function (e) {
						let given_other_value = parseInt(e.target.value);

						// reinit the state for the modal
						setAddElementState();

						let stored_values =
							state["add_element_config"]["values"];
						let defined_values_config =
							ELEMENT_CONFIG[code]["values"];

						defined_values_config[`${code}__count`] = stored_values;
						// update the state dynamically
						for (let index = 2; index <= stored_values; index++) {
							defined_values_config[`image_src_${index}`] = "";
						}
						state["add_element_config"][
							"values"
						] = defined_values_config;
						initAddElementConfigModal();
					})
			);
		input_data_container.append(count_form_group);
	}

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

		// if in case an image uploader is necessary
		// add a button that helps upload and get the file url
		if (
			["image_src", "file_src", "image_src_1", "image_src_2"].includes(
				input_name
			)
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
							"https://gprs-api.geopits.com/common/files/",
							true,
							function (result) {
								$(`input[name='${input_name}']`)[0].value =
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

// this renders the preview of the elemets from the server
function renderSavedElements(jQueryElement, addModifyActions = true) {
	$.each(saved_elements_data, function (index, saved_config) {
		let code = saved_config["code"];
		let element_config = ELEMENT_CONFIG[code];
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
				$(`<button class="btn btn-warning mr-2">Edit</button>`).on(
					"click",
					function () {
						// edit element state
						let indexData = saved_elements_data[index];
						state["add_element_config"] = indexData;

						initAddElementConfigModal();

						// show modal
						$("#element_input_modal").modal("show");
					}
				)
			);
			action_tab.append(
				$(`<button class="btn btn-danger">Delete</button>`).on(
					"click",
					function () {
						alert("delete: " + index);
					}
				)
			);
			// action tab | edit | delete
			jQueryElement.append(action_tab);
		}

		// add formed content to container
		jQueryElement.append(
			$(html).attr("id", `${code}__${saved_config["id"]}`)
		);
	});
}
