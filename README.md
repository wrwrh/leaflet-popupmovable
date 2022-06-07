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
    //for detect position of popup when zoomlevel changed.
    popupMovableZoomMode: 'relative', // or 'absolute','none', default value is 'relative'.
    //This option detect method for move popup when zoom changed ,according to
    //'relative' is Popup and Marker.
    //'absolute' is on Map position.
    //'none' is resotre Popup position when zoom chenge.

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
