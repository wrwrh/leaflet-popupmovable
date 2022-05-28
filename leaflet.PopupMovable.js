'use strict';
/*
It makes L.Popup movable.
*/

class PopupMovable{
    constructor(map){
        this.map = map;
        //When Popup open, make it doraggable.
        map.on('popupopen', (e) => {
            this.popupMovable(e);
            this.restorePopup(e);
        }); 

        //When Popup close, restore Popup's css.
        map.on('popupclose', (e)=> { 
            this.restorePopup(e);
            //Marker, which has not been moved, shall be excluded,
            L.DomUtil.removeClass(e.popup.getElement(),'popup-moved');
        });

        //When ZoomLevel changing, First, save the Popup's position before zoomlevel change.
        map.on('zoomstart', (e)=> {
            const popupPositions = {};
            document.querySelectorAll('.leaflet-popup').forEach((p) => {
                const pos = L.DomUtil.getPosition(p);
                popupPositions[p._leaflet_id] = pos;
            });
            //While ZoomLebel changing, restore Popup's css temporary.
            this.restorePopup(e);
            
            if(Object.keys(popupPositions).length > 0){
                //After zoom processing, redraw Popup's leader.
                map.once('zoomend', () => this.zoomCollect(popupPositions));
            }
        });
    }
    
    //Restore Popup's css(drawing popup's leader).
    restorePopup(e){
        const div = [],tip = [],css = {};
        //When ZoomLeve change, all Popups's css are restore default css.
        if(e.type === "zoomstart"){
            document.querySelectorAll('.leaflet-popup-tip-container').forEach((c) => div.push(c));
            document.querySelectorAll('.leaflet-popup-tip').forEach((c) => tip.push(c));
        }else if(e.type === "popupclose"){
            div.push(e.popup._tipContainer);
            tip.push(e.popup._tipContainer.children[0]);
        }else if(e instanceof L.Popup){
            div.push(e._tipContainer);
            tip.push(e._tipContainer.children[0]);
        }
        const dic = ['z-index','width','height','position','left','top','margin-left','margin-top','margin-bottom','background-image','filter',];
        for(const s of dic)css[s] = '';
        for(const i of div) for(const name in css) i.style[this.camelize(name)] = css[name];
        for(const i of tip) i.style.visibility = 'visible';//標準のツールチップを再表示
    }

    //translate '-'+lower chara to '-'+uppper chara
    camelize(str){
        return str.replace(/-([a-z])/g, (a,b) => b.toUpperCase());
    } 

    //Return css for Popup's leader
    createPopupCss(x,y,w,h){
        //Drawing a rectangle using SVG and Triangulate part of it.
        const svgicon = (s)=>{
            const base = `<?xml version="1.0" encoding="utf-8"?>
            <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
            <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"  viewBox="0 0 100 100">
            <polygon points="@@@" stroke-width="0.2" stroke="gray" fill="white" />
            </svg>`;
            const uri = encodeURI("data:image/svg+xml," + base.replace('@@@',s));
            return 'url(' + uri + ')';  
        }
        const c = {
            'z-index' : -1,//Placement on the back of Popup.
            'position': 'absolute',
            //If you want to emphasize the leader.
            'filter': 'drop-shadow(0px 0px 5px rgba(0,0,0,20))',
            //For debbuging.(draw rectangle)
            /*
            'border-width': '2px',
            'border-color': 'black',
            'border-style': 'solid',
            */
        };
        //Width when Marker and Popup are parallel.
        const para = 18;
        //Tweak leadline point(these parameters for L.circleMarker.Not preferred for L.marker).
        const offset = 20;
        const tweakH = 4;
        const tweakW = 3;
        const iconOffset = 0;
        //Depending on The width of the balloon and distance, change the width of the base of the leader.
        const ww = (width)=>{
            //Usually the bottom width is 20%.
            if(width * 0.2 < w/2) return 20;
            //If the width exceeds half of Popup width.
            else return w/2 * 100/width;
        }
        //z-index ,When parallel position
        const zin = -1;
        //Change Processing depending on the position of Marker and Popup.
        if(Math.abs(y)+offset/2 <= h/2){
            //parallel
            c['z-index'] = zin;
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
            c['z-index'] = zin;
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
                c['top'] = h/2 - Math.abs(y)-tweakH; //adding overlapping part.
                c['background-image'] = svgicon("0,100 50,0 100,100");
            }
        }else if(x >= 0 && y >= 0){
            //left-upper
            c['width'] = Math.abs(x);
            c['left'] = w/2 + tweakW;
            c['height'] = Math.abs(y);
            c['top'] = h/2 - tweakH;
            c['background-image'] = svgicon("0,0 100,100 "+String(ww(c['width']))+",0");
        }else if(x <= 0 && y >= 0){
            //right-upper
            c['width'] = Math.abs(x)+offset*2;
            c['left'] = w/2 - Math.abs(x) + tweakW;
            c['height'] = Math.abs(y);
            c['top'] = h/2 -tweakH;
            c['background-image'] = svgicon("0 100,100 0,"+String(100-ww(c['width']))+" 0");
        }else if(x <= 0 && y <= 0){
            //right-lower
            c['width'] = Math.abs(x)+offset*2;
            c['left'] = w/2 - Math.abs(x) +tweakW;
            c['height'] = Math.abs(y);
            c['top'] = h/2 - Math.abs(y) -tweakH;
            c['background-image'] = svgicon("0,0 "+String(100-ww(c['width']))+",100 100,100");
        }else if(x >= 0 && y <= 0){
            //left-lower
            c['width'] = Math.abs(x);
            c['left'] = w/2 + tweakW;
            c['height'] = Math.abs(y);
            c['top'] = h/2 - Math.abs(y) -tweakH;
            c['background-image'] = svgicon("0 100,"+String(ww(c['width']))+",100 100,0");
        }
        //Apply the retrieved css's values.
        Object.keys(c).forEach(key => {
            if(['width','left','height','top'].includes(key)){
                c[key] = String(c[key]) + 'px';
            }
        });
        return c;
    }

    //drawing css as Popup's leader.
    drawCss(el,newPosition){
        //Position of Popup before movging.
        const originalPosition = this.map.latLngToLayerPoint(el.latlng);
        //Size of Popup.
        const h = el.clientHeight;
        const w = el.clientWidth;
        //Drawing rectangle with before and after as vertices.
        const tip = 17;//Size of tip(=leader).
        const x = Math.round(originalPosition.x - newPosition.x + tip);
        const y = Math.round(originalPosition.y - (newPosition.y - h/2 - tip));
        //Leader's CSS of moved Popup.
        const css = this.createPopupCss(x,y,w,h);
        const div = el.children[1];
        for(const name in css) div.style[this.camelize(name)] = css[name];
        //Undisplay default tip.
        div.children[0].style.visibility = 'hidden';
    }

    //When ZoomLevel change, restore Popup's Position and redraw Popup's leader.
    zoomCollect(previousPosition){
        document.querySelectorAll('.leaflet-popup').forEach((popup)=>{
            const position = previousPosition[popup._leaflet_id];
            if(position !== undefined && L.DomUtil.hasClass(popup,'popup-moved')){
                L.DomUtil.setPosition(popup,position);
                this.drawCss(popup,position);
            }
        });
    }

    /*
    Main Function
    */
    popupMovable(mk){
        const p = mk.popup;
        //First, Embed the original position in Popup's Object.(to be used later.)
        p._wrapper.parentNode.latlng = p.getLatLng();
        //Make Popup elements movable.
        new L.Draggable(p._container,p._wrapper)
            .on('drag',(e)=>{
                this.drawCss(e.target._element,e.target._newPos);
                //For ZoomLevel change Event,moved or not, it shall be possible to determine.
                L.DomUtil.addClass(e.target._element,'popup-moved');
            }).enable();
    }
}
