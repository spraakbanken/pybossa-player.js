var html5Player = function() {
    var video;

    function init(videoUrl, containerId) {
        video = document.createElement("video");
        video.setAttribute("src", videoUrl);
        video.setAttribute("width", 512);
        video.setAttribute('controls', true);
        document.getElementById(containerId).appendChild(video);
    }

    function play() {
        video.play();
    }

    function pause() {
        video.pause();
    }

    function destroy() {
        video.remove();
    }

    return {init: init, play: play, pause: pause, destroy: destroy};
}


var vimeoPlayer = function() {
    var video,
        divWrapper;

    function init(videoUrl, containerId) {
        var vimeoApi = (function(){
            function Froogaloop(iframe) {
                return new Froogaloop.fn.init(iframe);
            }

            var eventCallbacks = {},
                hasWindowEvent = false,
                isReady = false,
                slice = Array.prototype.slice,
                playerOrigin = '*';

            Froogaloop.fn = Froogaloop.prototype = {
                element: null,

                init: function(iframe) {
                    if (typeof iframe === "string") {
                        iframe = document.getElementById(iframe);
                    }

                    this.element = iframe;

                    return this;
                },

                api: function(method, valueOrCallback) {
                    if (!this.element || !method) {
                        return false;
                    }

                    var self = this,
                        element = self.element,
                        target_id = element.id !== '' ? element.id : null,
                        params = !isFunction(valueOrCallback) ? valueOrCallback : null,
                        callback = isFunction(valueOrCallback) ? valueOrCallback : null;

                    if (callback) {
                        storeCallback(method, callback, target_id);
                    }

                    postMessage(method, params, element);
                    return self;
                },

                addEvent: function(eventName, callback) {
                    if (!this.element) {
                        return false;
                    }

                    var self = this,
                        element = self.element,
                        target_id = element.id !== '' ? element.id : null;


                    storeCallback(eventName, callback, target_id);

                    if (eventName != 'ready') {
                        postMessage('addEventListener', eventName, element);
                    }
                    else if (eventName == 'ready' && isReady) {
                        callback.call(null, target_id);
                    }

                    return self;
                },

                removeEvent: function(eventName) {
                    if (!this.element) {
                        return false;
                    }

                    var self = this,
                        element = self.element,
                        target_id = element.id !== '' ? element.id : null,
                        removed = removeCallback(eventName, target_id);

                    if (eventName != 'ready' && removed) {
                        postMessage('removeEventListener', eventName, element);
                    }
                }
            };

            function postMessage(method, params, target) {
                if (!target.contentWindow.postMessage) {
                    return false;
                }

                var data = JSON.stringify({
                    method: method,
                    value: params
                });

                target.contentWindow.postMessage(data, playerOrigin);
            }

            function onMessageReceived(event) {
                var data, method;

                try {
                    data = JSON.parse(event.data);
                    method = data.event || data.method;
                }
                catch(e)  {
                }

                if (method == 'ready' && !isReady) {
                    isReady = true;
                }

                if (!(/^https?:\/\/player.vimeo.com/).test(event.origin)) {
                    return false;
                }

                if (playerOrigin === '*') {
                    playerOrigin = event.origin;
                }

                var value = data.value,
                    eventData = data.data,
                    target_id = target_id === '' ? null : data.player_id,

                    callback = getCallback(method, target_id),
                    params = [];

                if (!callback) {
                    return false;
                }

                if (value !== undefined) {
                    params.push(value);
                }

                if (eventData) {
                    params.push(eventData);
                }

                if (target_id) {
                    params.push(target_id);
                }

                return params.length > 0 ? callback.apply(null, params) : callback.call();
            }

            function storeCallback(eventName, callback, target_id) {
                if (target_id) {
                    if (!eventCallbacks[target_id]) {
                        eventCallbacks[target_id] = {};
                    }
                    eventCallbacks[target_id][eventName] = callback;
                }
                else {
                    eventCallbacks[eventName] = callback;
                }
            }

            function getCallback(eventName, target_id) {
                if (target_id) {
                    return eventCallbacks[target_id][eventName];
                }
                else {
                    return eventCallbacks[eventName];
                }
            }

            function removeCallback(eventName, target_id) {
                if (target_id && eventCallbacks[target_id]) {
                    if (!eventCallbacks[target_id][eventName]) {
                        return false;
                    }
                    eventCallbacks[target_id][eventName] = null;
                }
                else {
                    if (!eventCallbacks[eventName]) {
                        return false;
                    }
                    eventCallbacks[eventName] = null;
                }

                return true;
            }

            function isFunction(obj) {
                return !!(obj && obj.constructor && obj.call && obj.apply);
            }

            function isArray(obj) {
                return toString.call(obj) === '[object Array]';
            }

            Froogaloop.fn.init.prototype = Froogaloop.fn;

            if (window.addEventListener) {
                window.addEventListener('message', onMessageReceived, false);
            }
            else {
                window.attachEvent('onmessage', onMessageReceived);
            }

            return Froogaloop;

        })();

        this.baseUrl = 'https://player.vimeo.com/video/';
        this.videoId = videoUrl.split('//player.vimeo.com/video/')[1];

        this.iframe = document.createElement('iframe');
        this.iframe.setAttribute('title', 'Vimeo Video Player');
        this.iframe.setAttribute('class', 'vimeoplayer');
        this.iframe.setAttribute('src', this.baseUrl + this.videoId + '?api=1');
        this.iframe.setAttribute('frameborder', '0');
        this.iframe.setAttribute('scrolling', 'no');
        this.iframe.setAttribute('marginWidth', '0');
        this.iframe.setAttribute('marginHeight', '0');
        this.iframe.setAttribute('webkitAllowFullScreen', '0');
        this.iframe.setAttribute('mozallowfullscreen', '0');
        this.iframe.setAttribute('allowFullScreen', '0');

        video = vimeoApi(this.iframe);

        divWrapper = document.createElement('div');
        divWrapper.setAttribute('style', 'margin:0 auto;padding-bottom:56.25%;width:100%;height:0;position:relative;overflow:hidden;');
        divWrapper.setAttribute('class', 'vimeoFrame');
        divWrapper.appendChild(this.iframe);
        document.getElementById(containerId).appendChild(divWrapper);
    }

    function play() {
        video.api('play');
    }

    function pause() {
        video.api('pause');
    }

    function destroy() {
        divWrapper.remove();
    }

    return {init: init, play: play, pause: pause, destroy: destroy};
}

var pybossaPlayer = function(videoUrl, containerId) {
    var player;

    if (videoUrl.split('.').indexOf('vimeo') !== -1) {
        player = vimeoPlayer();
    }
    else {
        player = html5Player();
    }
    player.init(videoUrl, containerId);

    function play() {
        player.play();
    }

    function pause() {
        player.pause();
    }

    function destroy() {
        player.destroy();
    }

    return {play: play, pause: pause, destroy: destroy};
}
