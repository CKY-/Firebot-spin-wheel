# Firebot Spin Wheel Custom Script in Typescript

### Setup
1. Create a new repo based off this template (Click "Use this Template" above) or simply fork it
2. `npm install`

### Building
Dev:
1. `npm run build:dev`
- Automatically copies the compiled .js to Firebot's scripts folder.

Release:
1. `npm run build`
- Copy .js from `/dist`

### Note
- Keep the script definition object (that contains the `run`, `getScriptManifest`, and `getDefaultParameters` funcs) in the `index.ts` file as it's important those function names don't get minimized.
- Edit the `"scriptOutputName"` property in `package.json` to change the filename of the outputted script.


## Properties for `Wheel`


Name                            | Default Value     | Description
------------------------------- | ------------------| ---------------------------
`borderColor`                   | `#000`            | The color of the line around the circumference of the wheel.
`borderWidth`                   | `0`               | The width (in pixels) of the line around the circumference of the wheel.
`debug`                         | `false`           | Show debugging info.</p><p>This is particularly helpful when fine-tuning labels.
`image`                         | `''`              | The url of an image that will be drawn over the center of the wheel which will rotate with the wheel.</p><p>It will be automatically scaled to fit `radius`.
`isInteractive`                 | `true`            | Allow the user to spin the wheel using click-drag/touch-flick. </p><p>User interaction will only be detected within the bounds of `Wheel.radius`.
`itemBackgroundColors`          | `['#fff']`        | The repeating pattern of background colors for all items.</p><p>Overridden by `Item.backgroundColor`.</p><p>Example: `['#fff','#000']`.
`itemLabelAlign`                | `'right'`         | The alignment of all item labels.</p><p>Accepted values: `'left'`,`'center'`,`'right'`.
`itemLabelBaselineOffset`       | `0`               | The offset of the baseline (or line height) of all item labels (as a percent of the label's height).
`itemLabelColors`               | `['#000']`        | The repeating pattern of colors for all item labels.</p><p>Overridden by `Item.labelColor`.</p><p>Example: `['#fff','#000']`.
`itemLabelFont`                 | `'sans-serif'`    | The font family for all item labels.</p><p>Example: `'sans-serif'`.
`itemLabelFontSizeMax`          | `100`             | The maximum font size (in pixels) for all item labels.
`itemLabelRadius`               | `0.85`            | The point along the radius (as a percent, starting from the center of the wheel) to start drawing all item labels.
`itemLabelRadiusMax`            | `0.2`             | The point along the radius (as a percent, starting from the center of the wheel) to calculate the maximum font size for all item labels.
`itemLabelRotation`             | `0`               | The rotation of all item labels.<p></p>Use this in combination with `itemLabelAlign` to flip the labels `180°`.
`itemLabelStrokeColor`          | `#fff`            | The color of the stroke applied to the outside of the label text.
`itemLabelStrokeWidth`          | `0`               | The width of the stroke applied to the outside of the label text.
`items`                         | `[]`              | The items to show on the wheel.
`lineColor`                     | `'#000'`          | The color of the lines between the items.
`lineWidth`                     | `1`               | The width (in pixels) of the lines between the items.
`pixelRatio`                    | `0`               | The pixel ratio used to render the wheel.</p><p>Values above 0 will produce a sharper image at the cost of performance.</p><p>A value of `0` will cause the pixel ratio to be automatically determined using `devicePixelRatio`.
`radius`                        | `0.95`            | The radius of the wheel (as a percent of the container's smallest dimension).
`rotation`                      | `0`               | The rotation (angle in degrees) of the wheel.</p><p>The first item will be drawn clockwise from this point.
`rotationResistance`            | `-35`             | The amount that `rotationSpeed` will be reduced by every second. Only in effect when `rotationSpeed !== 0`.</p><p>Set to `0` to spin the wheel infinitely.
`rotationSpeed`                 | `0`               | (Readonly) How far (angle in degrees) the wheel will spin every 1 second.</p><p>A positive number means the wheel is spinning clockwise, a negative number means anticlockwise, and `0` means the wheel is not spinning.
`rotationSpeedMax`              | `250`             | The maximum value for `rotationSpeed` (ignoring the wheel's spin direction).</p><p>The wheel will not spin faster than this value in any direction.
`offset`                        | `{w: 0, h: 0}`    | The offset of the wheel relative to it's center (as a percent of the wheel's diameter).
`overlayImage`                  | `''`              | The url of an image that will be drawn over the center of the wheel which will not rotate with the wheel.</p><p>It will be automatically scaled to fit the container's smallest dimension.</p><p>Use this to draw decorations around the wheel, such as a stand or pointer.
`pointerAngle`                  | `0`               | The angle of the Pointer which is used to determine the `currentIndex` (or the "winning" item).

## Properties for `Item`

samples: 

[items-1.txt](https://github.com/CKY-/Firebot-spin-wheel/blob/main/items-1.txt)

[items.txt](https://github.com/CKY-/Firebot-spin-wheel/blob/main/items.txt)


Name                            | Default Value     | Description
------------------------------- | ----------------- | ---------------------------
`backgroundColor`               | `null`            | The background color of the item.</p><p>When `null`, the actual color rendered will fall back to `itemBackgroundColors`.</p><p>Example: `'#fff'`.
`image`                         | `null`            | The url of an image that will be drawn on the item. Any part of the image that extends outside the item will be clipped. The image will be drawn over the top of `backgroundColor`.
`imageOpacity`                  | `1`               | The opacity (as a percent) of `Item.image`. Useful if you want to fade the image to make the item's label stand out.
`imageRadius`                   | `0.5`             | The point along the radius (as a percent, starting from the center of the wheel) to draw the center of `Item.image`.
`imageRotation`                 | `0`               | The rotation (angle in degrees) of `Item.image`.
`imageScale`                    | `1`               | The scale (as a percent) to resize `Item.image`.
`label`                         | `''`              | The text that will be drawn on the item.
`labelColor`                    | `null`            | The color of the label.</p><p>When `null`, the actual color rendered will fall back to `itemLabelColors`.</p><p>Example: `'#000'`.
`value`                         | `null`            | Some value that has meaning to your application. For example, a reference to the object representing the item on the wheel, or a database id.
`weight`                        | `1`               | The proportional size of the item relative to other items on the wheel.</p><p>For example, if you have 2 items where `item[0]` has a weight of `1` and `item[1]` has a weight of `2`, then `item[0]` will take up 1/3 of the space on the wheel.

## Acknowledgements

Uses [spin-wheel](https://github.com/CrazyTim/spin-wheel) module.