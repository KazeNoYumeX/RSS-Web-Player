/*!
 * RSS Marquee
 *
 * Licensed under MIT
 * Copyright (c) 2021 [KazeNoYumeX]
 */

class RSSMarquee {
    constructor(feedURLs, elementContainer, options = {speed: 110, maxItems: null, hostnameSelector: null}) {
        this._feedURLs = new Array();

        if (Array.isArray(feedURLs)) {
            this._feedURLs = feedURLs;
        } else {
            this._feedURLs[0] = feedURLs;
        }

        const URLvalidation = this._feedURLs.every(this.validateURL);

        if (!URLvalidation) throw new TypeError('Invalid URL on list')

        this._urlIndex = 0
        this._anim = null
        this._newsText = ''
        this._lastTime = Date.now()

        if (elementContainer === null) throw new TypeError('Invalid element selector')

        this._elementContainer = elementContainer
        this.styleElementContainer()

        this._options = {
            speed: this.validateSpeed(options.speed),
            maxItems: options.maxItems,
            hostnameSelector: options.hostnameSelector,
            // ...options
        };

        this.getRSS();
    }


    validateSpeed(speed) {
        if (!Number(speed) || speed < 50 || speed > 300) {
            return 110; // default safe value
        } else {
            return speed;
        }
    }

    validateURL(url) {
        try {
            const u = new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }

    getHostname(url) {
        try {
            const u = new URL(url);
            return u.hostname;
        } catch (e) {
            return '';
        }
    }

    getRSS() {
        const url = this._feedURLs[this._urlIndex];

        this.fetchRSS(url)
            .then((xmlText) => {
                this._newsText = this.parseXMLFeed(xmlText);

                this.showMarquee(this._newsText);

                this.showHostname(url);
            })
            .catch((err) => {
                console.error(err);

                this.handleErrors();
            });

    }

    handleErrors() {
        const diffTime = Date.now() - this._lastTime;

        if (diffTime > 5000) {
            console.log('Trying next feed URL...');

            this.nextURL();
            this._lastTime = Date.now();
        } else {
            if (this._newsText === '') {
                console.log('Delay...');
                setTimeout(() => this.nextURL(), 5000);
            } else {
                console.log('show again cached saved news');
                this.showMarquee(this._newsText);
            }
        }
    }

    nextURL() {
        this.increaseIndex();
        this.getRSS();
    }

    styleElementContainer() {
        this._elementContainer.style.overflow = 'hidden';
        this._elementContainer.style.whiteSpace = 'nowrap';
    }

    showHostname(url) {
        if (!this._options.hostnameSelector) return
        this._options.hostnameSelector.innerText = this.getHostname(url);
    }


    showMarquee(text) {
        try {
            const animKeyframes = [{
                transform: 'translateX(0)'
            },
                {
                    transform: 'translateX(-100%)'
                }
            ];

            const animOptions = {
                duration: 25000, // The number of milliseconds each iteration of the animation takes to complete. Defaults to 0. Although this is technically optional, keep in mind that your animation will not run if this value is 0.
                easing: 'linear', // The rate of the animation's change over time. Accepts the pre-defined values "linear", "ease", "ease-in", "ease-out", and "ease-in-out", or a custom "cubic-bezier" value like "cubic-bezier(0.42, 0, 0.58, 1)". Defaults to "linear".
                iterations: 1, // The number of times the animation should repeat. Defaults to 1, and can also take a value of Infinity to make it repeat for as long as the element exists.
                delay: 0, // The number of milliseconds to delay the start of the animation. Defaults to 0.
                endDelay: 0 // The number of milliseconds to delay after the end of an animation. This is primarily of use when sequencing animations based on the end time of another animation. Defaults to 0. 
            };

            animOptions.duration = text.length * this._options.speed;

            const elementChildNode = document.createElement('span');
            elementChildNode.style.display = 'inline-block';
            elementChildNode.style.paddingLeft = '100%';
            elementChildNode.style.color = "white";
            elementChildNode.style.fontSize = "28px"
            text = text.replace(/â€¢/g, " ")

            const textNode = document.createTextNode(text);

            elementChildNode.appendChild(textNode);

            this._elementContainer.appendChild(elementChildNode);
            this._anim = elementChildNode.animate(animKeyframes, animOptions);

            this._anim.onfinish = () => {
                // console.log('end');
                while (this._elementContainer.firstChild) {
                    this._elementContainer.firstChild.remove();
                }
                delete this._anim.onfinish;

                this.nextURL();
            };

            this._lastTime = Date.now();
        } catch (err) {
            console.error(err);
        }
    }

    increaseIndex() {
        this._urlIndex += 1;
        if (this._urlIndex > this._feedURLs.length - 1) this._urlIndex = 0;
    }

    fetchRSS(feedURL) {
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

    parseXMLFeed(xmlText) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(xmlText, "text/xml");

            let news = '';
            let totals = 0;

            for (let item of doc.querySelectorAll('item')) {
                let title = item.getElementsByTagName("title")[0].childNodes[0].nodeValue;
                // let description = item.getElementsByTagName("description")[0].childNodes[0].nodeValue;

                if (title) {
                    if (news.length) news += '\xa0' + ' • ' + '\xa0'

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

            console.info(`Parsed ${totals} title(s)`);
            return news;
        } catch (err) {
            console.error(err);
            return '   ';
        }
    }

    stripTags(textWithTags) {
        return textWithTags.replace(/<(.|\n)*?>/g, '');
    }

    remoteCData(originalText) {
        return originalText.replace("<![CDATA[", "").replace("]]>", "");
    }
}
