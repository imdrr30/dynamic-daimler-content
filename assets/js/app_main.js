// ------------------------------------------------------- Global level config

/**
 * The initial state for the entire application. This is used as a constant
 * for replacing the states when required.
 */
const INITIAL_STATE = {
	add_element_config: {
		code: null,
		values: {},
		temp: {},
		others: {},
		css_config: {},
		id: null,
	},
};

/**
 * This contains the common element configurations like the alignment,
 * font, size etc. This is used in the `getAllElementsConfig()` for making things dry.
 */
const COMMON_ELEMENT_CONFIG = {
	alignment: {
		left_align: "text-left",
		center_align: "text-center",
		right_align: "text-right",
	},
	font_size: {
		font_md: "font_md",
		font_lg: "font_lg",
		font_bold: "bold",
	},
	image_size: {
		image_sm: "image_sm",
		image_md: "image_md",
		image_banner: "image_banner",
	},
};

/**
 * The static element/component configuration for the entire application.
 * This is not directly used anywhere. Used as a wrapper constant.
 */
const STATIC_ELEMENT_CONFIG = {
	title_header: {
		html: `
		<div class="d-block element_config title_header {css_classes}">
			<h1>{heading}</h1>
			<h5>{sub_heading}</h5>
		</div>
		`,
		values: ["heading", "sub_heading"],
		css_config: {
			...COMMON_ELEMENT_CONFIG["alignment"],
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
			...COMMON_ELEMENT_CONFIG["alignment"],
			...COMMON_ELEMENT_CONFIG["font_size"],
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
			...COMMON_ELEMENT_CONFIG["image_size"],
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
			...COMMON_ELEMENT_CONFIG["alignment"],
		},
	},
	image_carousel: {
		html: `
		<div class="d-block element_config image_carousel {css_classes}">
			<div id="carouselElement_{id}" class="carousel slide" data-ride="carousel">

				<div class="carousel-inner">
					<div class="carousel-item active">
						<img class="d-block w-100" src="{image_src_1}">
					</div>
					<div class="carousel-item">
						<img class="d-block w-100" src="{image_src_2}">
					</div>
				</div>

				<a class="carousel-control-prev" href="#carouselElement_{id}" role="button" data-slide="prev">
					<span class="carousel-control-prev-icon" aria-hidden="true"></span>
				</a>
				<a class="carousel-control-next" href="#carouselElement_{id}" role="button" data-slide="next">
					<span class="carousel-control-next-icon" aria-hidden="true"></span>
				</a>

			</div>
		</div>
		`,
		values: ["image_src_1", "image_src_2"],
		css_config: {},
	},
};

/**
 * Main state of the application, used to handle the common functionalities
 * like edit, create etc. Used in the other functions.
 */
let state = {
	add_element_config: INITIAL_STATE["add_element_config"],
};

// ------------------------------------------------------- Functions

/**
 * The modal is used to create the elements dynamically, this is used to
 * get the data of the created components and inits the page with the elements.
 */
function initPageWithSavedComponents() {
	let main_saved_contents = $("#main_saved_contents");
	renderSavedElements(main_saved_contents);
}

/**
 * This function prepares all the event listeners for the app.
 * Since most of the contents are dynamic, this is called whenever some
 * new component is created.
 */
function initEventListeners() {
	/**
	 * When the menu buttons rendered are clicked, this invoked specific functions.
	 */
	$(".elements_menu_button").click(function (event) {
		// prepare the state
		setAddElementState(event.target.innerHTML);
		initAddElementConfigModal();

		// show modal
		$("#element_input_modal").modal("show");
	});

	/**
	 * This block of code, resets the state and other modal related stuff, when
	 * the modal is closed.
	 */
	$("#element_input_modal").on("hide.bs.modal", function (e) {
		resetAddElementConfig();
	});

	/**
	 * This is called when the save button in the modal is called. This gets the data
	 * from the modal elements and sends the data to the BE.
	 */
	$("#element_input_save").on("click", function (e) {
		e.preventDefault();

		let data_to_send = getUserInputFromModal();
		sendAjaxRequest(data_to_send, "content.php");
	});
}

/**
 * This function returns all the generated & static elements configuration
 * in the application. This is used everywhere in the app.
 */
function getAllElementsConfig() {
	return STATIC_ELEMENT_CONFIG;
}

// ------------------------------------------------------- Called after other pre processing

/**
 * This block initalizes the menu items defined by the `getAllElementsConfig()`.
 * Basically buttons rendered for the user to take actions.
 */
let elements_menu_holder = $("#elements_menu_holder");
$.each(getAllElementsConfig(), function (element_key, element_config) {
	let menu_button = $(
		"<button type='button' class='btn btn-primary btn-lg elements_menu_button m-2'></button>"
	).text(element_key);

	elements_menu_holder.append(menu_button);
});

/**
 * Space to call the other functions defined in the app.
 * Defined as a function just to make things DRY & clean.
 */
initPageWithSavedComponents();
initEventListeners();
