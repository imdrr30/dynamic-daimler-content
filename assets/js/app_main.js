// ------------------------------------------------------- Global level config

// Elements configuration
const ELEMENT_CONFIG = {
	title_header: {
		html: `
		<div class="d-block element_config title_header {css_classes}">
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
	text_content: {
		html: `
		<div class="d-block element_config text_content {css_classes}">
			<p>
				{content}
			</p>
		</div>
		`,
		values: ["content"],
		css_config: {
			left_align: "text-left",
			center_align: "text-center",
			font_md: "font_md",
			font_lg: "font_lg",
		},
	},
	image_with_content: {
		html: `
		<div class="element_config image_with_content row {css_classes}">
			<div class="col-md-6">{content}</div>
			<div class="col-md-6">
				<img class='img-fluid' src="{image_src}" />
			</div>
		</div>
		`,
		values: ["content", "image_src"],
		css_config: {
			center_align_text: "text-center",
			reverse_image_direction: "flex-row-reverse",
		},
	},
	single_image: {
		html: `
		<div class="d-block element_config single_image {css_classes}">
			<img class='img-fluid' src="{image_src}" />
		</div>
		`,
		values: ["image_src"],
		css_config: {
			left_align: "text-left",
			right_align: "text-right",
			center_align: "text-center",
			image_sm: "image_sm",
			image_md: "image_md",
			image_banner: "image_banner",
		},
	},
	single_file: {
		html: `
		<div class="d-block element_config single_file {css_classes}">
			<div class="single_file_container bg-light">
				<img src="./assets/images/file.png" />
				<a target='_blank' href="{file_src}">
					{file_src_name}
				</a>
			</div>
		</div>
		`,
		values: ["file_src"],
		css_config: {
			left_align: "text-left",
			right_align: "text-right",
			center_align: "text-center",
		},
	},
	image_carousel: {
		html: `
		<div class="d-block element_config image_carousel {css_classes}">
			<div id="carouselElement__{id}" class="carousel slide" data-ride="carousel">

				<div class="carousel-inner">
					<div class="carousel-item active">
						<img class="d-block w-100" src="{image_src_1}">
					</div>
					<div class="carousel-item">
						<img class="d-block w-100" src="{image_src_2}">
					</div>
				</div>

				<a class="carousel-control-prev" href="#carouselElement__{id}" role="button" data-slide="prev">
					<span class="carousel-control-prev-icon" aria-hidden="true"></span>
				</a>
				<a class="carousel-control-next" href="#carouselElement__{id}" role="button" data-slide="next">
					<span class="carousel-control-next-icon" aria-hidden="true"></span>
				</a>

			</div>
		</div>
		`,
		values: ["image_src_1", "image_src_2"],
		css_config: {},
	},
};

// Main state of the application
let state = {
	// code : ""
	// values:
	// 		heading: ""
	// css_config:
	// 		left_align: true
	// id: null || ""
	add_element_config: {},
};

// ------------------------------------------------------- Functions

// to render the page with the data from the BE
// this data is the saved components in the BE
function initPageWithSavedComponents() {
	let main_saved_contents = $("#main_saved_contents");
	renderSavedElements(main_saved_contents);
}

// To init all the event listeners in the app
function initEventListeners() {
	$(".elements_menu_button").click(function (event) {
		event.preventDefault();
		setAddElementState(event.target.innerHTML);
		initAddElementConfigModal();

		// show modal
		$("#element_input_modal").modal("show");
	});
}

// ------------------------------------------------------- Event listeners

// On element config input model close
$("#element_input_modal").on("hide.bs.modal", function (e) {
	resetAddElementConfig();
});

// On element config input model saved | save button for input input
$("#element_input_save").on("click", function (e) {
	let data_to_send = getUserInputFromModal();
	sendAjaxRequest(data_to_send, "content.php");
});

// ------------------------------------------------------- Called after other pre processing

// Elements menu rendering function
let elements_menu_holder = $("#elements_menu_holder");
$.each(ELEMENT_CONFIG, function (element_key, element_config) {
	let menu_button = $("<button></button>")
		.addClass("btn btn-primary btn-lg elements_menu_button m-2")
		.text(element_key);

	elements_menu_holder.append(menu_button);
});

initPageWithSavedComponents();
initEventListeners();
