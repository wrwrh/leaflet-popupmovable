# Leaflet-PopupMovable
Make Leaflet's L.Popup movable(draggable) and draw leadline.

[demo](https://wrwrh.github.io/leaflet-popupmovable/Demo/index.html)
![demo image](./Demo/demo.PNG)

## Usage
1. include the plugin file.
```
<script src="Leaflet.PopupMovable.js"></script>
```
2. Initialize plugin's class.
```
<script>
  new PopupMovable(your-L.Map);
</script>
```
3. (Recommended)Disable autoclode option of L.Popup.
```
var popup = new L.Popup({autoClose:false});
```

## Reference information
This plugin optimized for L.Popup binded L.CircleMarker.(Also support L.Popup that not binded marker.)

L.Marker's popup offset are unsupported.

My recommendation L.Popup that binded L.circleMarker or L.CircleMarker.extend.(etc. Marker using canvas)

## License
This code is provided under the MIT license.
