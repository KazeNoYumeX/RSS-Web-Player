function RSSMarqueeSetting() {
    RSSMarquee._feedURLs = []

    if (Array.isArray(RSSMarquee.feedURLs)) {
        RSSMarquee._feedURLs = RSSMarquee.feedURLs;
    } else {
        RSSMarquee._feedURLs[0] = RSSMarquee.feedURLs;
    }

    var URLvalidation = RSSMarquee._feedURLs.every(validateURL);

    if (!URLvalidation) {
        throw new TypeError('Invalid URL on list');
    }

    RSSMarquee._urlIndex = 0;

    RSSMarquee._anim = null;

    RSSMarquee._newsText = '';

    RSSMarquee._lastTime = Date.now();

    if (RSSMarquee.elementContainer === null) {
        throw new TypeError('Invalid element selector');
    }

    RSSMarquee._elementContainer = RSSMarquee.elementContainer
    styleElementContainer()

    RSSMarquee._options = {
        speed: validateSpeed(RSSMarquee.options.speed),
        maxItems: RSSMarquee.options.maxItems,
        hostnameSelector: RSSMarquee.options.hostnameSelector,
    };

    getRSS();
}

function validateSpeed(speed) {
    if (!Number(speed) || speed < 50 || speed > 300) {
        return 110; // default safe value
    } else {
        return speed;
    }
}

function setSpeed(speed) {
    RSSMarquee._options.speed = validateSpeed(speed);
}

function getSpeed() {
    return RSSMarquee._options.speed;
}

function validateURL(url) {
    try {
        var u = new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

function getHostname(url) {
    try {
        var u = new URL(url);
        return u.hostname;
    } catch (e) {
        return '';
    }
}

//TODO Fix ES5
function getRSS() {
    var url = RSSMarquee._feedURLs[RSSMarquee._urlIndex];
    var xmlText = xhrRSS(url)

    setTimeout(function () {
        if (xmlText) {
            RSSMarquee._newsText = parseXMLFeed(xmlText)
            showMarquee(RSSMarquee._newsText);
            showHostname(url);
        } else {
            handleErrors()
        }
    }, 4000)

    // fetchRSS(url)
    //     .then((xmlText) => {
    //         this._newsText = this.parseXMLFeed(xmlText);
    //
    //         this.showMarquee(this._newsText);
    //
    //         this.showHostname(url);
    //     })
    //     .catch((err) => {
    //         console.error(err);
    //
    //         this.handleErrors();
    //     });
}

function handleErrors() {
    var diffTime = Date.now() - this._lastTime;

    if (diffTime > 5000) {
        console.log('Trying next feed URL...');

        nextURL();
        RSSMarquee._lastTime = Date.now();
    } else {
        if (RSSMarquee._newsText === '') {
            console.log('Delay...');
            setTimeout(function () {
                nextURL();
            }, 5000);
        } else {
            console.log('show again cached saved news');
            showMarquee(RSSMarquee._newsText);
        }
    }
}

function nextURL() {
    increaseIndex();
    getRSS();
}

function styleElementContainer() {
    RSSMarquee._elementContainer.style.overflow = 'hidden';
    RSSMarquee._elementContainer.style.whiteSpace = 'nowrap';
}

function showHostname(url) {
    if (!RSSMarquee._options.hostnameSelector) return
    RSSMarquee._options.hostnameSelector.innerText = getHostname(url);
}

function showMarquee(text) {
    try {
        var animKeyframes = [{
            transform: 'translateX(0)'
        },
            {
                transform: 'translateX(-100%)'
            }
        ];

        var animOptions = {
            duration: 25000, // The number of milliseconds each iteration of the animation takes to complete. Defaults to 0. Although this is technically optional, keep in mind that your animation will not run if this value is 0.
            easing: 'linear', // The rate of the animation's change over time. Accepts the pre-defined values "linear", "ease", "ease-in", "ease-out", and "ease-in-out", or a custom "cubic-bezier" value like "cubic-bezier(0.42, 0, 0.58, 1)". Defaults to "linear".
            iterations: 1, // The number of times the animation should repeat. Defaults to 1, and can also take a value of Infinity to make it repeat for as long as the element exists.
            delay: 0, // The number of milliseconds to delay the start of the animation. Defaults to 0.
            endDelay: 0 // The number of milliseconds to delay after the end of an animation. This is primarily of use when sequencing animations based on the end time of another animation. Defaults to 0.
        };

        animOptions.duration = text.length * RSSMarquee._options.speed;

        var elementChildNode = document.createElement('span');
        elementChildNode.style.display = 'inline-block';
        elementChildNode.style.paddingLeft = '100%';
        elementChildNode.style.color = "white";
        elementChildNode.style.fontSize = "40px"
        text = text.replace(/â€¢/g, " ")

        var textNode = document.createTextNode(text);

        elementChildNode.appendChild(textNode);

        RSSMarquee._elementContainer.appendChild(elementChildNode);

        RSSMarquee._anim = elementChildNode.animate(animKeyframes, animOptions);

        RSSMarquee._anim.onfinish = () => {
            // console.log('end');
            while (RSSMarquee._elementContainer.firstChild) {
                RSSMarquee._elementContainer.firstChild.remove();
            }
            delete RSSMarquee._anim.onfinish;

            nextURL();
        };

        RSSMarquee._lastTime = Date.now();
    } catch (err) {
        console.error(err);
    }
}

function increaseIndex() {
    RSSMarquee._urlIndex += 1;
    if (RSSMarquee._urlIndex > RSSMarquee._feedURLs.length - 1) {
        RSSMarquee._urlIndex = 0;
    }
}

//TODO FIX ES5
function fetchRSS(feedURL) {
    return new Promise((resolve, reject) => {
        console.info(`Start fetching ${feedURL}...`);

        fetch(feedURL, {mode: 'cors', redirect: 'follow'})
            .then((response) => {
                return response.text();
            })
            .then((xmlTxt) => {
                return resolve(xmlTxt);
            })
            .catch(() => {
                console.error('Error in fetching the RSS feed');
                reject();
            })
    });
}

// feedURL
function xhrRSS() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        console.log(xhr.responseText)
        console.log(xhr.getResponseHeader())
    }
    xhr.open("GET", 'https://www.police.ntpc.gov.tw/rss-14-1.html', true);
    xhr.send(null);
}

function parseXMLFeed(xmlText) {
    try {
        var parser = new DOMParser();
        var doc = parser.parseFromString(xmlText, "text/xml");

        var news = '';
        var totals = 0;

        for (var item of doc.querySelectorAll('item')) {
            var title = item.getElementsByTagName("title")[0].childNodes[0].nodeValue;
            // var description = item.getElementsByTagName("description")[0].childNodes[0].nodeValue;

            if (title) {
                if (news.length) news += '\xa0' + ' • ' + '\xa0';
                title = this.remoteCData(title);
                title = this.stripTags(title);
                news += title;
                totals += 1;
            }

            if (this._options.maxItems !== null && totals >= this._options.maxItems) {
                console.info('Maximum items reached!');
                break;
            }
        }

        console.info('Parsed ' + totals + ' title(s)');
        return news;
    } catch (err) {
        console.error(err);
        return '   ';
    }
}

function stripTags(textWithTags) {
    return textWithTags.replace(/<(.|\n)*?>/g, '');
}

function remoteCData(originalText) {
    return originalText.replace("<![CDATA[", "").replace("]]>", "");
}

var RSSMarquee = {
    feedURLs: null, elementContainer: null
    , options: {speed: null, maxItems: null, hostnameSelector: null}
}



