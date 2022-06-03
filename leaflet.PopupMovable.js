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
    _MOVED : 'popup-moved',

    //Restore Popup's css(drawing popup's leader).
    _restorePopup(e){
        const div = [],tip = [],css = {};
        //When ZoomLeve change, all Popups's css are restore default css.
        if(e.type === "zoomstart"){
            document.querySelectorAll('.leaflet-popup-tip-container').forEach((c) => div.push(c));
            document.querySelectorAll('.leaflet-popup-tip').forEach((c) => tip.push(c));
        }else if(e.type === "popupclose"){
            div.push(e.popup._tipContainer);
            tip.push(e.popup._tipContainer.children[0]);
            L.DomUtil.removeClass(e.popup.getElement(),this._MOVED);
        }else if(e instanceof L.Popup){
            div.push(e._tipContainer);
            tip.push(e._tipContainer.children[0]);
            L.DomUtil.removeClass(e.getElement(),this._MOVED);
        }
        const dic = ['z-index','width','height','position','left','top','margin-left','margin-top','margin-bottom','background-image','filter',];
        for(const s of dic)css[s] = '';
        for(const i of div) for(const name in css) i.style[this._camelize(name)] = css[name];
        //redraw default tooltip
        for(const i of tip) i.style.visibility = 'visible';
        //Marker, which has not been moved, shall be excluded,
        
    },

    //Return css for Popup's leader
    _createPopupCss(x,y,w,h){
        //Drawing a rectangle using SVG and Triangulate part of it.
        const svgicon = (s)=>{
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
            'filter': 'drop-shadow(0px 0px 2px gray)',
            /*For debbuging.(draw rectangle)
            'border-width': '1px',
            'border-color': 'black',
            'border-style': 'solid',
            */
        };
        //Width when Marker and Popup are parallel.
        const para = 18;
        //Tweak leadline point.
        const offset = 20;
        const tweakH = 4;
        const tweakW = 3;
        
        //Depending on The width of the balloon and distance, change the width of the base of the leader.
        const ww = (width,minus=false)=>{
            const calc = 20 / width * 100
            //allways return 20px. this size can't over popup harf of width and heigth.
            if(minus) return String(100 - calc);
            else  return String(calc);
        }
        //z-index ,When parallel position
        c['z-index'] = -1;
        //Change Processing depending on the position of Marker and Popup.
        if(Math.abs(y)+offset/2 <= h/2){
            //parallel
            c['height'] = para;
            c['top'] = h/2 - para/2 + y - tweakH;
            if(x >= 0){
                //left
                c['width'] = Math.abs(x) - w/2 - offset + tweakW; 
                c['left'] = w + offset;
                c['background-image'] = svgicon("0,0 100,50 0,100");
            }else{
                //right
                c['width'] = Math.abs(x) - w/2 + offset - tweakW;
                c['left'] = -(Math.abs(x) - w/2) + tweakW;
                c['background-image'] = svgicon("0,50 100,0 100,100");
            }
        }else if(Math.abs(x-offset)+offset <= w/2){
            //vertical
            c['width'] = para;
            c['left'] = w/2 + x - para/2 + tweakW;
            if(y >= 0){
                //top
                c['height'] = Math.abs(y) - h/2;
                c['top'] = h - tweakH;
                c['background-image'] = svgicon("0,0 50,100 100,0");
            }else{
                //bottom
                c['height'] = Math.abs(y) + tweakH;
                c['top'] = h/2 - Math.abs(y) - tweakH;
                c['background-image'] = svgicon("0,100 50,0 100,100");
            }
        }else if(x >= 0 && y >= 0){
            //left-upper
            c['width'] = Math.abs(x);
            c['left'] = w/2 + tweakW;
            c['height'] = Math.abs(y);
            c['top'] = h/2 - tweakH;
            c['background-image'] = svgicon(String(ww(c['width'])) + ",0 " + "100,100 " + "0,"+ ww(c['height']));
        }else if(x <= 0 && y >= 0){
            //right-upper
            c['width'] = Math.abs(x)+offset*2;
            c['left'] = w/2 - Math.abs(x) + tweakW;
            c['height'] = Math.abs(y);
            c['top'] = h/2 -tweakH;
            c['background-image'] = svgicon("0 100," + ww(c['width'],true) +",0 100," + ww(c['height']));
        }else if(x <= 0 && y <= 0){
            //right-lower
            c['width'] = Math.abs(x)+offset*2;
            c['left'] = w/2 - Math.abs(x) +tweakW;
            c['height'] = Math.abs(y)+offset;
            c['top'] = h/2 - Math.abs(y) -tweakH;
            c['background-image'] = svgicon("0,0 100,"+ ww(c['height'],true) + " " + ww(c['width'],true) + " 100");
        }else if(x >= 0 && y <= 0){
            //left-lower
            c['width'] = Math.abs(x);
            c['left'] = w/2 + tweakW;
            c['height'] = Math.abs(y)+offset;
            c['top'] = h/2 - Math.abs(y) -tweakH;
            c['background-image'] = svgicon("0," + ww(c['height'],true)+ " " + ww(c['width'])+",100 100,0");
        }
        //Apply the retrieved css's values.
        Object.keys(c).forEach(key => {
            if(['width','left','height','top'].includes(key)){
                c[key] = String(c[key]) + 'px';
            }
        });
        return c;
    },

    //drawing css as Popup's leader.
    _drawCss(el,newPosition){
        //Position of Popup before movging.
        const originalPos = this._map.latLngToLayerPoint(el.latlng);
        //Size of Popup.
        const h = el.clientHeight;
        const w = el.clientWidth;
        //Drawing rectangle with before and after as vertices.
        const tip = 17;//Size of tip(=leader).
        const x = Math.round(originalPos.x - newPosition.x + tip) + el.popupAnchor[0];
        const y = Math.round(originalPos.y - (newPosition.y - h/2 - tip)) + el.popupAnchor[1];
        //Leader's CSS of moved Popup.
        const css = this._createPopupCss(x,y,w,h);
        const div = el.children[1];
        for(const name in css) div.style[this._camelize(name)] = css[name]; 
        //Undisplay default tip.
        div.children[0].style.visibility = 'hidden';
    },

    //When ZoomLevel change, restore Popup's Position and redraw Popup's leader.
    _zoomCollect(previous,marker){
        document.querySelectorAll('.leaflet-popup').forEach((popup)=>{
            if(!L.DomUtil.hasClass(popup,this._MOVED)) return;
            const position = (()=>{
                switch(this._map.options.popupMovableZoomMode){
                    case 'absolute':
                        return previousPosition[popup._leaflet_id];
                    case 'relative':
                    default:
                        const x = previous[popup._leaflet_id].x - marker[popup._leaflet_id].x;
                        const y = previous[popup._leaflet_id].y - marker[popup._leaflet_id].y;
                        const point = this._map.latLngToLayerPoint(popup.latlng);
                        return L.point(point.x + x, point.y + y);
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

        //Make Popup elements movable.
        new L.Draggable(p._container,p._wrapper)
            .on('drag',(e)=>{
                this._drawCss(e.target._element,e.target._newPos);
                //For ZoomLevel change Event,moved or not, it shall be possible to determine.
                L.DomUtil.addClass(e.target._element, this._MOVED);
            }).enable();
        //When binded Marker clicked, restore leadline.
        if(p._source !== undefined){
            L.featureGroup([p._source]).on('click', ()=>{
                this._restorePopup(p);
            });
        }
    },

    _zoomEvent(e){
        //First, save the Popup's position before zoomlevel change.
        const popupPositions = {};
        const popupAnchorPositions = {};
        document.querySelectorAll('.leaflet-popup').forEach((p) => {
            popupPositions[p._leaflet_id] = L.DomUtil.getPosition(p);
            popupAnchorPositions[p._leaflet_id] = this._map.latLngToLayerPoint(p.latlng);
        });
        //While ZoomLebel changing, restore Popup's css temporary.
        this._restorePopup(e);

        if(Object.keys(popupPositions).length > 0){
            //After zoom processing, redraw Popup's leader.
            this._map.once('zoomend', () => this._zoomCollect(popupPositions,popupAnchorPositions));
        }
    },

    addHooks: function () {
        //make it doraggable.
        this._map.on('popupopen', (e) => this._popupMovable(e),this);
    
        //restore Popup's css(tip).
        this._map.on('popupclose', (e) => this._restorePopup(e),this);
    
        //When ZoomLevel changing, save and restore Popup's potision.
        this._map.on('zoomstart', (e) => this._zoomEvent(e),this);
    },

    removeHooks: function () {
        this._map.off('popupopen', (e) => this._popupMovable(e),this);
        this._map.off('popupclose', (e) => this._restorePopup(e),this);
        this._map.off('zoomstart', (e) => this._zoomEvent(e),this);
    },
});

L.Map.mergeOptions({
    popupMovable: false,
    popupMovableZoomMode : 'relative',
});

L.Map.addInitHook('addHandler', 'popupMovable', L.Map.PopupMovable);
