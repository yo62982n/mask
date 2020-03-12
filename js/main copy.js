//Initialize map
let nmap = new naver.maps.Map('nmap', {
    center: new naver.maps.LatLng(37.2900533, 127.1036797),
    zoom: 13,
    mapTypeControl: true,
    mapDataControl: false
});

//Get store data from public API
function getStoreData(lat, lng){
    let xhr = new XMLHttpRequest();

    xhr.onload = function() {
        if(xhr.status >= 200 && xhr.status < 300){
            let jsonResponse = JSON.parse(xhr.response);
            pointMarker(jsonResponse.stores);
        }else{
            console.log('Request failed');
        }
    }

    xhr.open('GET', `https://8oi9s0nnth.apigw.ntruss.com/corona19-masks/v1/storesByGeo/json?lat=${lat}&lng=${lng}&m=5000`);
    xhr.send();
}

//Place marker on map
function pointMarker(storeObj){
    if(stores.length > 0){
        for(index in stores){
            stores[index].marker.setMap(null);
        }
        stores = [];
    }
    for(index in storeObj){
        let lat = storeObj[index].lat;
        let lng = storeObj[index].lng;
        storeObj[index].marker = new naver.maps.Marker({
            position: new naver.maps.LatLng(lat, lng),
            map: nmap
        });
        naver.maps.Event.addListener(storeObj[index].marker, 'click', markerClickHandler(index));
        stores.push(storeObj[index]);
    }
}

//maker click handler
function markerClickHandler(index){
    return function(e){
        toggleSidebar();
        console.log(stores[index]);
    }
}

//toggle store info sidebar
function toggleSidebar(){
    storeOverlay.classList.toggle("transparentBcg");
    storeSidebar.classList.toggle("showStore");
}

var stores = [];
var storesMarker = [];
var storeOverlay = document.querySelector(".store-overlay");
var storeSidebar = document.querySelector(".store");
// var storeInfoName = document.querySelector("");

document.querySelector("#nmap").addEventListener("mouseup", function(){
    getStoreData(nmap.center._lat, nmap.center._lng);
})

document.querySelector(".close-store").addEventListener("click", function(){
    toggleSidebar();
})

getStoreData(nmap.center._lat, nmap.center._lng);

//test marker
var marker = new naver.maps.Marker({
    position: new naver.maps.LatLng(37.2900533, 127.1036797),
    map: nmap
});