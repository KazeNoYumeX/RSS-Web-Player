# RSS-Web-Player-
以原生JavaScript做WEB簡易播放器，內含各式簡易播放方法以及RSS跑馬燈，具ES6、ES5雙版本。

![Sample]()

### Demo: https://kazenakanohume.github.io/RSS-Web-Player/

### Note
以原生JavaScript做WEB簡易播放器，內含各式簡易播放方法以及RSS跑馬燈，具ES6、ES5雙版本。

### Features
* **原生 JavaScript (no jQuery)**
* **為符合相異環境，同時具備ES5和ES6雙版本**
* **使用 CSS animations**

## ES6 Version

### Quick Usage
use the `rss-ES6.js` script file and declare the `RSSMarquee` Class
```
<body>
    <div class=""></div>

    <script src="rss-ES6.js"></script>

    <script>
        document.addEventListener('DOMContentLoaded', () => {

            const feedUrl = ['https://www.dnoticias.pt/rss/home.xml', 'https://cors-anywhere.herokuapp.com/https://www.buzzfeed.com/world.xml'];

            const elementSelector = document.getElementById('marquee');

            new RSSMarquee(feedUrl, elementSelector);
        });
    </script>
</body>
```

## RSSMarquee(feedURLs, elementContainer, options)

### Class options
Property         | Type     | Required    | Description
---------------- | -------- | ---------- | ----------------------
`feedURLs`  | `string[]` | yes     | List of RSS Feed URLs
`elementContainer`  	 | `HTMLelement` | yes   | the selector of the marquee container
`options.speed`  	 | `number` | no | Duration in ms per character. Bigger values = slow speed. Value between 50-300. Default value: 110
`options.maxItems`  	 | `number` | no | specify max number of titles to show (useful to debug: not wait for all titles before goes to the next feed)
`options.hostnameSelector`  	 | `HTMLelement` | no | The selector of the element where you want to show the URL of the news feed source (usefull for copyright atttribution)

## Motivation and history
I've created this code because I needed a news feed scrolling text on a client project. After a quick search, I found some solutions, but none completely satisfies me. I didn't want to use jQuery and many libraries depend on it. Also, I want to make it at lean as possible and to take advantage of recent browser technologies with graphic acceleration, so I ditched all alternatives who use the `setInterval` function to set the animation time.

## How it works
1. The XML feed is fetched using the native `fetch API`
2. The XML is parsed to extract all the titles
3. The titles are processed (remove HTML tags and invalid characters)
4. The container element is animated with the `translateX` CSS function
5. After the animation ends (with the `onfinish` event), the library fetches the next feed

# ES5 Version

### Quick Usage
use the `rss-ES5.js` script file and declare the `RSSMarquee` function
```
<body>
    <div id="rss"></div>

    <script src="rss-ES5.js"></script>

    <script>
         var feedUrl = ['https://ithelp.ithome.com.tw/rss/series/1227']
         var rss = document.querySelector('.RSS-ES5');

         RSSMarquee = {
             feedURLs: null, elementContainer: null
             , options: {speed: null, maxItems: null, hostnameSelector: null}
         }
        RSSMarqueeSetting()
    </script>
</body>
```

## RSSMarquee(feedURLs, elementContainer, options)

### Class options
Property         | Type     | Required    | Description
---------------- | -------- | ---------- | ----------------------
`feedURLs`  | `string[]` | yes     | List of RSS Feed URLs
`elementContainer`  	 | `HTMLelement` | yes   | the selector of the marquee container
`options.speed`  	 | `number` | no | Duration in ms per character. Bigger values = slow speed. Value between 50-300. Default value: 110
`options.maxItems`  	 | `number` | no | specify max number of titles to show (useful to debug: not wait for all titles before goes to the next feed)
`options.hostnameSelector`  	 | `HTMLelement` | no | The selector of the element where you want to show the URL of the news feed source (usefull for copyright atttribution)

## Motivation and history
I've created this code because I needed a news feed scrolling text on a client project. After a quick search, I found some solutions, but none completely satisfies me. I didn't want to use jQuery and many libraries depend on it. Also, I want to make it at lean as possible and to take advantage of recent browser technologies with graphic acceleration, so I ditched all alternatives who use the `setInterval` function to set the animation time.

## How it works
1. The XML feed is fetched using the native `fetch API`
2. The XML is parsed to extract all the titles
3. The titles are processed (remove HTML tags and invalid characters)
4. The container element is animated with the `translateX` CSS function
5. After the animation ends (with the `onfinish` event), the library fetches the next feed


