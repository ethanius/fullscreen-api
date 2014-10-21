# Fullscreen API polyfill #

## Overview ##

This project aims to polyfill the implementation of  https://fullscreen.spec.whatwg.org/ in the browsers that do not support it at all by enabling an element to be stretched over the whole viewport and in those that support it prefixed to get rid of the prefix hell.

As for javascript the whole API is supported:

* Element.prototype.requestFullscreen()
* document.exitFullscreen()
* document.fullscreenEnabled (false if we will use fake fullscreen, true if native solution - prefixed or not - will be used)
* document.fullscreenElement
* document.onfullscreenchange (and its preferred form of fullscreenchange event)
* document.onfullscreenerror (and its preferred form of fullscreenerror event)

Also:

* exitFullscreen on ESC key is added in fake fullscreen to mimic the native implementations
* native prefixed events are stopped to not cause any double reaction if you for any reason listen to the unprefixed and prefixed version as well (but not the onmozXXX/onwebkitXXX/etc. versions, I want to discourage the use of those)

## Dependencies ##

This polyfill depends on a few functionalities that also need to be polyfilled in older browsers:

* Function.prototype.bind - [polyfill](https://github.com/polyfill/Function.prototype.bind) or as [part of JAK](https://github.com/seznam/JAK/blob/master/lib/polyfills/es5.js)
* Array.prototype.indexOf - [polyfill as part of JAK](https://github.com/seznam/JAK/blob/master/lib/polyfills/js16.js)
* Element.prototype.classList - [polyfill as part of JAK](https://github.com/seznam/JAK/blob/master/lib/polyfills/classList.js)
* eventTarget interface (standards compliant event handling) - [polyfill](https://github.com/ondras/ie8eventtarget/)

All of those polyfills can be found for example in https://github.com/seznam/JAK and if you are using it you do not need to include them separately.

## Known issues ##

CSS can't be polyfilled therefore there is no support for ::backdrop and :fullscreen. On the other hand the CSS that gets injected into the page makes sure that the fullscreen element looks the same on all browsers. Or at least as close to it as possible. If you rely on some sort of backdrop functionality I suggest to make fullscreen the parent element of desired fullscreen content and style it as you would the backdrop and make the child react to the size of the parent accordingly.

Also:
* Safari on OSX prevents text input in form fields if fullscreen is enabled (ie. do not use fullscreen for forms)
* IE in prefixed and in fake fullscreen fires keyboard events even though they are ESC key to end the fullscreen mode, other browsers don't do that
* older Chrome might prevent text input just as Safari does but since it autoupdates and you can't rely on that because of Safari, that should be no problem
