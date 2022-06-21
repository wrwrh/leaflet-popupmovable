L.Control.EasyPrint = L.Control.extend({
    options: {
        position: 'topleft',
        filename: 'map',
        hidden: false
    },

    onAdd: function(){
        this.mapContainer = this._map.getContainer();
        const container = L.DomUtil.create('div', 'leaflet-control-easyPrint leaflet-bar leaflet-control');
        if (!this.options.hidden) {
            this._addCss();
            L.DomEvent.addListener(container, 'click', this.printMap, this);
            const btnClass = 'leaflet-control-easyPrint-button-export';
            this.link = L.DomUtil.create('a', btnClass, container);
            this.link.id = "leafletEasyPrint";
            L.DomEvent.disableClickPropagation(container);
        }
        return container;
    },

    printMap: function(event, filename) {
        if (filename) this.options.filename = filename;
        this.originalState = {
            mapWidth: this.mapContainer.style.width,
            widthWasAuto: false,
            widthWasPercentage: false,
            mapHeight: this.mapContainer.style.height,
            zoom: this._map.getZoom(),
            center: this._map.getCenter()
        }
        if (this.originalState.mapWidth === 'auto') {
            this.originalState.mapWidth = this._map.getSize().x + 'px';
            this.originalState.widthWasAuto = true;
        } else if (this.originalState.mapWidth.includes('%')) {
            this.originalState.percentageWidth = this.originalState.mapWidth;
            this.originalState.widthWasPercentage = true;
            this.originalState.mapWidth = this._map.getSize().x + 'px';
        }
        this._map.fire("easyPrint-start", { event: event });
        this.outerContainer = this._createOuterContainer(this.mapContainer);
        if (this.originalState.widthWasAuto) {
            this.outerContainer.style.width = this.originalState.mapWidth;
        }
        const dataUrl = domtoimage.toPng(this.mapContainer, {
            width: parseInt(this.originalState.mapWidth.replace('px')),
            height: parseInt(this.originalState.mapHeight.replace('px'))
        });
        this.blankDiv = document.createElement("div");
        const blankDiv = this.blankDiv;
        this.outerContainer.parentElement.insertBefore(blankDiv, this.outerContainer);
        blankDiv.className = 'epHolder';
        blankDiv.style.backgroundImage = 'url("' + dataUrl + '")';
        blankDiv.style.position = 'absolute';
        blankDiv.style.zIndex = 1011;
        blankDiv.style.display = 'initial';
        blankDiv.style.width = this.originalState.mapWidth;
        blankDiv.style.height = this.originalState.mapHeight;
        this.outerContainer.style.opacity = 0;
        const pageSize = this._map.getSize();
        this.mapContainer.style.width = pageSize.x + 'px';
        this.mapContainer.style.height = pageSize.y + 'px';
        this._map.setView(this.originalState.center);
        this._map.setZoom(this.originalState.zoom);
        this._map.invalidateSize();
        this._printOpertion(this.mapContainer);
    },

    _printOpertion: async function(container) {
        const dataUrl = await domtoimage.toPng(container, {
            width: parseInt(container.style.width),
            height: parseInt(container.style.height.replace('px'))
        });
        const a = document.createElement('a');
        a.download = this.options.filename + '.png';
        a.target = '_blank';
        //a.href = dataUrl;
        a.href = window.webkitURL.createObjectURL(this._dataURItoBlob(dataUrl));
        a.click();

        if (this.outerContainer) {
            if (this.originalState.widthWasAuto) {
                this.mapContainer.style.width = 'auto';
            } else if (this.originalState.widthWasPercentage) {
                this.mapContainer.style.width = this.originalState.percentageWidth;
            } else {
                this.mapContainer.style.width = this.originalState.mapWidth;
            }
            this.mapContainer.style.height = this.originalState.mapHeight;
            this._removeOuterContainer(this.mapContainer, this.outerContainer, this.blankDiv);
            this._map.invalidateSize();
            this._map.setView(this.originalState.center);
            this._map.setZoom(this.originalState.zoom);
        }
    },

    _createOuterContainer: function(mapDiv) {
        const outerContainer = document.createElement('div');
        mapDiv.parentNode.insertBefore(outerContainer, mapDiv);
        mapDiv.parentNode.removeChild(mapDiv);
        outerContainer.appendChild(mapDiv);
        outerContainer.style.width = mapDiv.style.width;
        outerContainer.style.height = mapDiv.style.height;
        outerContainer.style.display = 'inline-block';
        outerContainer.style.overflow = 'hidden';
        return outerContainer;
    },

    _removeOuterContainer: function(mapDiv, outerContainer, blankDiv) {
        if (outerContainer.parentNode) {
            outerContainer.parentNode.insertBefore(mapDiv, outerContainer);
            outerContainer.parentNode.removeChild(blankDiv);
            outerContainer.parentNode.removeChild(outerContainer);
        }
    },

    _addCss: function() {
        const css = document.createElement("style");
        css.innerHTML = `.leaflet-control-easyPrint-button-export { 
            background-image: url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDQzMy41IDQzMy41IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0MzMuNSA0MzMuNTsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8Zz4KCTxnIGlkPSJmaWxlLWRvd25sb2FkIj4KCQk8cGF0aCBkPSJNMzk1LjI1LDE1M2gtMTAyVjBoLTE1M3YxNTNoLTEwMmwxNzguNSwxNzguNUwzOTUuMjUsMTUzeiBNMzguMjUsMzgyLjV2NTFoMzU3di01MUgzOC4yNXoiIGZpbGw9IiMwMDAwMDAiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K);
            background-size: 16px 16px; 
            cursor: pointer; 
        }`;
        document.body.appendChild(css);
    },

    _dataURItoBlob: function(dataURI) {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const dw = new DataView(ab);
        for (let i = 0; i < byteString.length; i++) {
            dw.setUint8(i, byteString.charCodeAt(i));
        }
        return new Blob([ab], { type: mimeString });
    }
});

L.easyPrint = function (options) {
    return new L.Control.EasyPrint(options);
};