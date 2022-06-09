'use strict';
/*
* Leaflet.PopupMovable
* Description: A plugin that make L.Popup movable by user dragging and auto draw leadline.
* Example: new L.map('MapContainer', {popupMovable: true})
* Author: SUZUKI Yasuhiro
*/
L.Map.PopupMovable = L.Handler.extend({
    //translate '-'+lower chara to '-'+uppper chara
    _camelize(str){
        return str.replace(/-([a-z])/g, (a,b) => b.toUpperCase());
    },
    //This is class name of popup element for judging whether popup moved or not.
    _movedLabel : 'popup-moved',

    //Restore Popup's css(drawing popup's leader).
    _restorePopup(e){
        const div = [],tip = [],css = {},
            dic = ['z-index','width','height','position','left','top','margin-left','margin-top','margin-bottom','background-image','filter'];
        //When ZoomLeve change, all Popups's css are restore default css.
        if(e.type === "zoomstart"){
            document.querySelectorAll('.leaflet-popup-tip-container').forEach(c => div.push(c));
            document.querySelectorAll('.leaflet-popup-tip').forEach(c => tip.push(c));
        }else if(e.type === "popupclose"){
            div.push(e.popup._tipContainer);
            tip.push(e.popup._tipContainer.children[0]);
            L.DomUtil.removeClass(e.popup.getElement(),this._movedLabel);
        }else if(e instanceof L.Popup){
            div.push(e._tipContainer);
            tip.push(e._tipContainer.children[0]);
            L.DomUtil.removeClass(e.getElement(),this._movedLabel);
        }
        
        for(const s in dic) css[dic[s]] = '';
        for(const d in div) for(const name in css) div[d].style[this._camelize(name)] = css[name];
        //redraw default tooltip
        for(const t in tip) tip[t].style.visibility = 'visible';
        //Marker, which has not been moved, shall be excluded,
        
    },

    //Return css for Popup's leader
    _createPopupCss(x,y,w,h){
        //Drawing a rectangle using SVG and Triangulate part of it.
        function svgicon(s){
            const uri = encodeURI(`data:image/svg+xml,<?xml version="1.0" encoding="utf-8"?>
                <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
                <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"  viewBox="0 0 100 100">
                <polygon points="${s}" stroke-width="0.2" stroke="gray" fill="white" /></svg>`);
            return `url(${uri})`;
        }
        const c = {
                //'z-index' : 900,
                'z-index' : -1,//Placement on the back of Popup.
                'position': 'absolute',
                //If you want to emphasize the leader.
                'filter': 'drop-shadow(0px 0px 2px gray)'
                /*For debbuging.(draw rectangle)
                'border-width': '1px',
                'border-color': 'black',
                'border-style': 'solid',
                */
            },
            //Width when Marker and Popup are parallel.
            para = 18,
            //Tweak leadline point.
            offset = 20,
            tweakH = 4,
            tweakW = 3
    
        //Depending on The width of the balloon and distance, change the width of the base of the leader.
        function ww(width,minus=false){
            const calc = 20 / width * 100;
            //allways return 20px. this size can't over popup harf of width and heigth.
            if(minus) return String(100 - calc);
            else  return String(calc);
        };
        //z-index ,When parallel position
        c['z-index'] = -1;
        //Change Processing depending on the position of Marker and Popup.
        if(Math.abs(y) + offset/2 <= h/2){
            //parallel
            c['height'] = para;
            c['top'] = h/2 - para/2 + y - tweakH;
            if(x >= 0){
                //left
                c['width'] = x - w/2 - offset + tweakW; 
                c['left'] = w + offset;
                c['background-image'] = svgicon("0,0 100,50 0,100");
            }else{
                //right
                c['width'] = offset - tweakW - w/2 - x;
                c['left'] = tweakW + x + w/2;
                c['background-image'] = svgicon("0,50 100,0 100,100");
            }
        }else if(Math.abs(x - offset) + offset <= w/2){
            //vertical
            c['width'] = para;
            c['left'] = w/2 + x - para/2 + tweakW;
            if(y >= 0){
                //top
                c['height'] = y - h/2;
                c['top'] = h - tweakH;
                c['background-image'] = svgicon("0,0 50,100 100,0");
            }else{
                //bottom
                c['height'] = tweakH - y;
                c['top'] = h/2 + y - tweakH;
                c['background-image'] = svgicon("0,100 50,0 100,100");
            }
        }else if(x >= 0 && y >= 0){
            //left-upper
            c['width'] = x;
            c['left'] = w/2 + tweakW;
            c['height'] = y;
            c['top'] = h/2 - tweakH;
            const width = ww(c['width']), height = ww(c['height']);
            c['background-image'] = svgicon(`${width},0 100,100 0,${height}`);
        }else if(x < 0 && y >= 0){
            //right-upper
            c['width'] = offset*2 - x;
            c['left'] = w/2 + x + tweakW;
            c['height'] = y;
            c['top'] = h/2 -tweakH;
            const width = ww(c['width'],true), height = ww(c['height']);
            c['background-image'] = svgicon(`0 100,${width},0 100,${height}`);
        }else if(x < 0 && y < 0){
            //right-lower
            c['width'] = offset*2 - x;
            c['left'] = w/2 + x + tweakW;
            c['height'] = offset - y;
            c['top'] = h/2 + y - tweakH;
            const width = ww(c['width'],true), height = ww(c['height'],true);
            c['background-image'] = svgicon(`0,0 100,${width} ${height} 100`);
        }else if(x >= 0 && y < 0){
            //left-lower
            c['width'] = x;
            c['left'] = w/2 + tweakW;
            c['height'] = offset - y;
            c['top'] = h/2 + y -tweakH;
            const width = ww(c['width']), height = ww(c['height'],true);
            c['background-image'] = svgicon(`0,${height} ${width},100 100,0`);
        }
        //Apply the retrieved css's values.
        Object.keys(c).forEach(function(key){
            const lst = ['width','left','height','top'];
            for(const i in lst){
                if(lst[i] === key) c[key] = String(c[key]) + 'px';
            }
        });
        return c;
    },

    //drawing css as Popup's leader.
    _drawCss(el,newPosition){
        //Position of Popup before movging.
        const originalPos = this._map.latLngToLayerPoint(el.latlng),
        //Size of Popup.
            h = el.clientHeight,
            w = el.clientWidth,
        //Drawing rectangle with before and after as vertices.
            tip = 17,//Size of tip(=leader).
            x = Math.round(originalPos.x - newPosition.x + tip) + el.popupAnchor[0],
            y = Math.round(originalPos.y - (newPosition.y - h/2 - tip)) + el.popupAnchor[1],
        //Leader's CSS of moved Popup.
            css = this._createPopupCss(x,y,w,h),
            div = el.children[1];
        for(const name in css) div.style[this._camelize(name)] = css[name];
        //Undisplay default tip.
        div.children[0].style.visibility = 'hidden';
    },

    //When ZoomLevel change, restore Popup's Position and redraw Popup's leader.
    _zoomCollect(popups,previous,marker){
        popups.forEach( popup => {
            if(!L.DomUtil.hasClass(popup,this._movedLabel)) return;
            const position = ( () => {
                switch(this._map.options.popupMovableZoomMode){
                    case 'absolute':
                        return previous[popup._leaflet_id];
                    case 'relative':
                    default:
                        const point = this._map.latLngToLayerPoint(popup.latlng),
                            x = previous[popup._leaflet_id].x - marker[popup._leaflet_id].x,
                            y = previous[popup._leaflet_id].y - marker[popup._leaflet_id].y;
                            
                        return point.add([x,y]);//L.point(point.x + x, point.y + y);
                }
            });
            L.DomUtil.setPosition(popup,position());
            this._drawCss(popup,position());
        });
    },

    /*
    Main Function
    */
    _popupMovable(mk){
        const p = mk.popup;
        //First, Embed the original position in Popup's Object.(to be used later.)
        p._wrapper.parentNode.latlng = p.getLatLng();
        //Enbed the marker option(popupAnchor) that bindding this popup.
        try{
            p._wrapper.parentNode.popupAnchor = p._source.options.icon.options.popupAnchor;
        }catch{
            p._wrapper.parentNode.popupAnchor = [0,0];
        }
        if(p.options.popupmovable === false) return;

        //Make Popup elements movable.
        new L.Draggable(p._container,p._wrapper)
            .on('drag', e => {
                this._drawCss(e.target._element,e.target._newPos);
                //For ZoomLevel change Event,moved or not, it shall be possible to determine.
                L.DomUtil.addClass(e.target._element, this._movedLabel);
            }).enable();
        //When binded Marker clicked, restore leadline.
        if(p._source !== undefined){
            L.featureGroup([p._source]).on('click', () => this._restorePopup(p));
        }
    },

    _zoomEvent(e){
        if(this._map.options.popupMovableZoomMode === 'none'){
            this._restorePopup(e);
            return;    
        }
        //First, save the Popup's position before zoomlevel change.
        const popups = [],
            popupPositions = {},
            popupAnchorPositions = {};

        document.querySelectorAll('.leaflet-popup').forEach(p => {
            popupPositions[p._leaflet_id] = L.DomUtil.getPosition(p);
            popupAnchorPositions[p._leaflet_id] = this._map.latLngToLayerPoint(p.latlng);
            popups.push(p);
        });
        //While ZoomLebel changing, restore Popup's css temporary.
        this._restorePopup(e);

        if(Object.keys(popupPositions).length > 0){
            //After zoom processing, redraw Popup's leader.
            this._map.once('zoomend', () => this._zoomCollect(popups,popupPositions,popupAnchorPositions));
        }
    },

    addHooks: function () {
        //make it doraggable.
        this._map.on('popupopen', e => this._popupMovable(e),this);
    
        //restore Popup's css(tip).
        this._map.on('popupclose', e => this._restorePopup(e),this);
    
        //When ZoomLevel changing, save and restore Popup's potision.
        this._map.on('zoomstart', e => this._zoomEvent(e),this);

        //when zoomlevelChange, don't restore popup position.(only popup that binded marker)
        L.Popup = L.Popup.extend({
            popupmovable: true,
            _movedLabelLabel: this._movedLabel,
            _popupMovableZoomMode: this._map.options.popupMovableZoomMode,
            _animateZoom: function (e) {
                if(!L.DomUtil.hasClass(this._container,this._movedLabelLabel) || this._popupMovableZoomMode === 'none'){
                    const pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center),
                    anchor = this._getAnchor();
                    L.DomUtil.setPosition(this._container, pos.add(anchor));
                }
            },
        });
        L.popup = function (options, source) {
            return new L.Popup(options, source);
        };
      
    },

    removeHooks: function () {
        this._map.off('popupopen', e => this._popupMovable(e),this);
        this._map.off('popupclose', e => this._restorePopup(e),this);
        this._map.off('zoomstart', e => this._zoomEvent(e),this);
    },
});

L.Map.mergeOptions({
    popupMovable: false,
    popupMovableZoomMode : 'relative',
});

L.Map.addInitHook('addHandler', 'popupMovable', L.Map.PopupMovable);
