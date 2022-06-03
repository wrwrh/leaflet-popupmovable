# Leaflet-PopupMovable
Make Leaflet's L.Popup movable(draggable) and draw leadline.

[demo](https://wrwrh.github.io/leaflet-popupmovable/Demo/index.html)

![demo image](./Demo/demo.jpg)

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
    //for detect position of popup when zoomlevel changed.
    popupMovableZoomMode: 'relative',// or 'absolute', default value is 'relative'
    //(Recommended) this option make set false.
    closePopupOnClick: false,
  });
</script>
```
3. (Recommended)Disable autoclose option of L.Popup.
```
var popup = new L.Popup({autoClose:false});
```

## License
This code is provided under the MIT license.
