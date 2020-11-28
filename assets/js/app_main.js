/**
 * Elements configuration
 */
const ELEMENT_CONFIG = {
	title_header: {
		html: `
		<div class="d-block text-center title_header">
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

/**
 * Elements menu rendering function
 */
let elements_menu_holder = $("#elements_menu_holder");
$.each(ELEMENT_CONFIG, function (element_key, element_config) {
	let menu_button = $("<button></button>")
		.addClass("btn btn-primary btn-lg")
		.text(element_key);

	elements_menu_holder.append(menu_button);
});
