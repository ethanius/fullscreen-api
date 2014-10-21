(function() {
	var nativeMode = true;
	if (!("fullscreenEnabled" in document)) {
		// true pokud zvladneme nativni, false pokud dame jen nas fake pres viewport
		var flag = document.msFullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled;
		document.fullscreenEnabled = flag ? flag : false;
		nativeMode = false;
	}

	if (!("fullscreenElement" in document)) {
		// nativne je tohle read-only, takze v takovem pripade to nebudeme schopni plnit
		document.fullscreenElement = null;
	}

	// chytame ruzne varianty fullscreenchange eventu a vysilame svuj vlastni se spravnym jmenem
	var fceChange = function(e) {
		e.stopImmediatePropagation();
		if (!nativeMode) {
			var elm = document.msFullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
			document.fullscreenElement = elm ? elm : null;
		}
		var event = new CustomEvent("fullscreenchange");
		document.dispatchEvent(event);

		if (typeof document.onfullscreenchange == "function") {
			document.onfullscreenchange(event);
		}
	};
	document.addEventListener("mozfullscreenchange", fceChange, false);
	document.addEventListener("MSFullscreenChange", fceChange, false);
	document.addEventListener("webkitfullscreenchange", fceChange, false);

	// chytame ruzne varianty fullscreenerror eventu a vysilame svuj vlastni se spravnym jmenem
	var fceError = function(e) {
		e.stopImmediatePropagation();
		var event = new CustomEvent("fullscreenerror");
		document.dispatchEvent(event);

		if (typeof document.onfullscreenerror == "function") {
			document.onfullscreenerror(event);
		}
	};
	document.addEventListener("mozfullscreenerror", fceError, false);
	document.addEventListener("MSFullscreenError", fceError, false);
	document.addEventListener("webkitfullscreenerror", fceError, false);

	// odchytavani klavesy ESC, pokud jsme ve fullscreenu
	var escHandler = function(e) {
		if (e.keyCode == 27) {
			e.stopImmediatePropagation();
			document.exitFullscreen();
		}
	}

	if (!("requestFullscreen" in Element)) {
		// nemame nativni metodu, ale muzeme jeste umet nekterou z prefixovanych
		var method = Element.prototype.msRequestFullscreen || Element.prototype.mozRequestFullScreen || Element.prototype.webkitRequestFullscreen;
		if (document.fullscreenEnabled && method) {
			// umim to, ale jen s prefixem
			Element.prototype.requestFullscreen = method;
		} else {
			// neumim to vubec, budeme roztahovat element v ramci viewportu
			Element.prototype.requestFullscreen = function() {
				var error = false;
				if (!document.body.contains(this)) { error = true; }
				if (error) {
					fceError();
					return;
				}
				if (document.fullscreenElement != null) {
					document.fullscreenElement.classList.remove("polyfill-full-screen");
				} else {
					document.addEventListener("keydown", escHandler, false);
				}
				document.fullscreenElement = this;
				document.fullscreenElement.classList.add("polyfill-full-screen");

				var event = new CustomEvent("fullscreenchange");
				document.dispatchEvent(event);

				if (typeof document.onfullscreenchange == "function") {
					document.onfullscreenchange(event);
				}
			}
		}
	}

	if (!("exitFullscreen" in document)) {
		// nemame nativni metodu, ale muzeme jeste umet nekterou z prefixovanych
		var method = document.msExitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen;
		if (document.fullscreenEnabled && method) {
			// umim to, ale jen s prefixem
			document.exitFullscreen = method;
		} else {
			// neumim to vubec, budeme roztahovat element v ramci viewportu
			document.exitFullscreen = function() {
				if (document.fullscreenElement != null) {
					document.removeEventListener("keydown", escHandler, false);

					document.fullscreenElement.classList.remove("polyfill-full-screen");
					document.fullscreenElement = null;

					var event = new CustomEvent("fullscreenchange");
					document.dispatchEvent(event);

					if (typeof document.onfullscreenchange == "function") {
						document.onfullscreenchange(event);
					}
				}
			}
		}
	}

	// CSS do stranky, normalizujeme rozdily mezi implementacemi
	var head = document.querySelector("head");
	var styles = document.createElement("style");
	var rules =
		"*:-webkit-full-screen {\n" +
		"	width: 100% !important;\n" +
		"	height: 100% !important;\n" +
		"	box-sizing: border-box !important;\n" +
		"	margin: 0 !important;\n" +
		"}\n" +

		"*:-ms-fullscreen {\n" +
		"	width: 100% !important;\n" +
		"	height: 100% !important;\n" +
		"	margin: 0 !important;\n" +
		"}\n" +

		"*:-moz-full-screen {\n" +
		"	width: 100% !important;\n" +
		"	height: 100% !important;\n" +
		"}\n" +

		".polyfill-full-screen {\n" +
		"	position: fixed !important;\n" +
		"	box-sizing: border-box !important;\n" +
		"	width: 100% !important;\n" +
		"	height: 100% !important;\n" +
		"	margin: 0 !important;\n" +
		"	left: 0 !important;\n" +
		"	top: 0 ! important;\n" +
		"	z-index: 2147483647 ! important;\n" +
		"}\n";

	styles.type = "text/css";
	if (styles.styleSheet) {
		styles.styleSheet.cssText = rules;
	} else {
		var ruleNode = document.createTextNode(rules);
		styles.appendChild(ruleNode);
	}
	head.appendChild(styles);
})();
