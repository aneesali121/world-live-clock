# World Live Clock

A responsive, single-file world clock website. Pick any supported country or city and see its live local time on a realistic analog wall clock, with a digital readout beneath it. Every clock updates each second and follows its time zone's daylight saving rules automatically.

## Features

- **Live analog and digital clocks** for each selected location: round wall-clock face with numbers 1 to 12, smooth second hand, and a digital display (HH:MM:SS, AM/PM, full date, weekday, time zone and UTC offset)
- **Searchable country and city picker** with flags. Search by country, city, or country code, and use arrow keys and Enter
- **Multiple clocks**: add as many as you like and remove any of them
- **Favorites**: starred locations are pinned to the top
- **Compare times**: see each clock's time and its difference from your time zone or any saved clock
- **Display options**: analog, digital, or both views; 12-hour or 24-hour format; light, dark, or auto theme
- **Full-screen mode** for any clock
- **Persistent state**: clocks, favorites, and preferences are saved in the browser's local storage

## Technology

- Plain HTML, CSS, and JavaScript. No frameworks or build step
- `Intl.DateTimeFormat` with IANA time zone names for accurate, DST-aware times
- `requestAnimationFrame` for smooth, continuous updates

## Getting started

1. Download or clone this repository
2. Open `world-live-clock.html` in any modern browser

No server or installation is needed.

## Customizing the locations

All countries and cities are defined in the `COUNTRIES` array near the top of the `<script>` section. Each entry follows this pattern:

```js
["CODE", "Country name", [["City name", "Area/City_IANA_zone"]]]
```

Use IANA zone names such as `Europe/Oslo` or `America/Sao_Paulo`. Full list: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

## Browser support

Works in current versions of Chrome, Edge, Firefox, Safari, and mobile browsers.

## License

Add a license of your choice before publishing (for example, MIT).
