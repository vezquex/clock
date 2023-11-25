# [Clock](https://vezquex.github.io/clock)
- Toggle seconds display by clicking on the time.
- Color-coded to the day of the week
- Kanji day of the week
- 24-hour time with leading zero
- Standard date format
- Day of the week and month spelled out in full

# [Pebble Time watch face](https://vezquex.github.io/clock/watch-canvas.html)

The Pebble Time was the 2nd and final iteration of a smart-watch from a startup that was later acquired by Fitbit, which was later acquired by Google.

The Pebble Time had an always-on LCD display with a similar resolution to a Game Boy, but in portrait and with 64 colors. My demo does not take advantage of the full resolution, opting for pixel doubling to ensure legibility, and resulting in a blockier aesthetic.

A 5x5 pixel font is sometimes referred to as _Bagua_, Chinese for "trigrams", as 5 rows and columns is just enough resolution to display a trigram. The font was chosen for this watch face because it can act much like a 7-segment display, with the added benefit of a saner approach to rendering the Roman alphabet and other symbols, typically in the ASCII character set.

The Pebble SDK isn't very useful unless you have the corresponding hardware, so this watch face demonstration uses HTML canvas. The web platform is more useful to the general public. Since it simply uses arrays of numbers associated with palette colors, it could theoretically be ported to a smart-watch.

# [Pixel Font Demo](https://vezquex.github.io/clock/demo.html)

Supplementary content designed for the Pebble Time watch face page.

- Favicon clock
- Time offset slider
- Theme switcher
- Pixel font printouts
- Text colors
- Weather, color-coded
- Grid background (helps developer line up text visually)

# [Minimal Demo](https://vezquex.github.io/clock/minimal.html)
Similar to other pages, sans many features.

# [More Pixel Fonts](https://vezquex.github.io/clock/mip.html)
Modified to support more than one size of pixel font. Fonts comparable to some Japanese fitness watches, with desired adjustments.

# [Segmented Display](https://vezquex.github.io/clock/segment.html)
7-segment display.

# [Retro Watch](https://vezquex.github.io/clock/retro-168.html)
Example of SVG decorations and finer adjustments.

# [World Time](https://vezquex.github.io/clock/world.html)
Scroll through time zones.