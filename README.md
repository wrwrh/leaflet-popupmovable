# Leaflet-PopupMovable
Make Leaflet's L.Popup movable(draggable) and draw leadline.

[demo](https://wrwrh.github.io/leaflet-popupmovable/Demo/index.html)

![demo image](./Demo/demo.jpg)

https://user-images.githubusercontent.com/94453454/172375328-9da8eea3-a30a-45a2-9703-b30ab993de9d.mov


## Usage
1. include the plugin file.
```
<script src="Leaflet.PopupMovable.js"></script>
```
2. When create L.map object, add 'popupMovable' option and set true.
```
<script>
  const map = new L.map('MapContainer', {
    //set 'popupMovable' option true for enable this plugin.
    popupMovable: true,
    //(Recommended) this option make set false.
    closePopupOnClick: false,
  });
</script>
```
3. (Required for Printing)
```
Add below CSSes for body or etc.
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;

if not add, leads will draw for square.
```
4. (Recommended)Disable autoclose option of L.Popup.
```
var popup = L.popup({
    autoClose:false
  });
```
5. (Optional)Disable this plugin per popup.
```
var popup = L.popup({
    popupmovable:false
  });
```
6. Method
Disperses popups that are being displayed(only Marker binded Popup).
```
const pm = new L.Map.PopupMovable(Lmap);
pm.popupDispersion();
```

## License
This code is provided under the MIT license.

## Appendix
This code uses "const declaration", "arrow function", "template literals" and "SVG".
This Plugin dose not work in IE.