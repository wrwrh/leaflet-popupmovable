# Leaflet-PopupMovable
Leafletのポップアップ(L.popup)をドラッグ可能にし、ドラッグ時に自動で引出線を描画するプラグインです。

[demo](https://wrwrh.github.io/leaflet-popupmovable/Demo/index.html)

![demo image](./Demo/demo.jpg)

## 使用方法
1. このプラグインファイルを対象HTMLファイルに組み込みます。
```
<script src="Leaflet.PopupMovable.js"></script>
```
2. L.mapオブジェクト作成時のオプションで、'popupMovable'を'true'にします。
```
<script>
  var map = new L.map('MapContainer', {
    //このプラグインを有効にするため、trueをセットします。
    popupMovable: true,
    //ズーム時のポップアップの位置を算出する方法を指定します。
    popupMovableZoomMode: 'relative', // デフォルト値は'relative'です。
    //このオプションには以下の値を指定できます。
    //'relative' マーカーとポップアップの位置関係を保持します。
    //'absolute' マップ上におけるポップアップの座標を保持します。
    //'none' ズーム時にポップアップの位置をデフォルトに戻します、

    //(推奨) プラグイン使用時、このオプションはfalseにすることを推奨します。
    closePopupOnClick: false,
  });
</script>
```
3. (推奨)L.Popupのautocloseオプションはfalseにすることを推奨します。
```
var popup = new L.Popup({autoClose:false});
```

## ライセンス
このコードは、MITライセンスによって提供されています。
