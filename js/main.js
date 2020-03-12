//Initialize map
let nmap = new naver.maps.Map('nmap', {
    center: new naver.maps.LatLng(37.2900533, 127.1036797),
    zoom: 15,
    mapTypeControl: true,
    mapDataControl: false
});

//Get store data from public API
function getStoreData(lat, lng){
    let xhr = new XMLHttpRequest();

    xhr.onload = function() {
        if(xhr.status >= 200 && xhr.status < 300){
            let jsonResponse = JSON.parse(xhr.response);
            if(stores != jsonResponse.stores){
                pointMarker(jsonResponse.stores);
            }
        }else{
            console.log('Request failed');
        }
    }

    xhr.open('GET', `https://8oi9s0nnth.apigw.ntruss.com/corona19-masks/v1/storesByGeo/json?lat=${lat}&lng=${lng}&m=3000`);
    xhr.send();
}

//Place marker on map
function pointMarker(storeObj){
    if(stores.length > 0){
        for(index in stores){
            storesMarker[index].setMap(null);
        }
        storesMarker = [];
        stores = [];
    }
    stores = storeObj;
    for(index in storeObj){
        let lat = storeObj[index].lat;
        let lng = storeObj[index].lng;
        let icon = getMarkerColor(storeObj[index].remain_stat);
        storesMarker.push(new naver.maps.Marker({
            position: new naver.maps.LatLng(lat, lng),
            map: nmap,
            icon: {
                content: icon
            }
        }));
        naver.maps.Event.addListener(storesMarker[index], 'click', markerClickHandler(index));
    }
}

//maker click handler
function markerClickHandler(index){
    return function(e){
        toggleSidebar();
        let maskNum = getMaskNum(stores[index].remain_stat)
        storeInfoName.innerText = stores[index].name;
        storeInfoContent.innerHTML = `
            <ul>
                <li>최종 업데이트 : ${stores[index].created_at}</li>
                <li>입고시간 : ${stores[index].stock_at}</li>
                <li>재고 수량 : ${maskNum}
            </ul>`;
    }
}

//toggle store info sidebar
function toggleSidebar(){
    storeOverlay.classList.toggle("transparentBcg");
    storeSidebar.classList.toggle("showStore");
}

function getMarkerColor(stock){
    if(stock == "plenty"){
        return '<i class="fas fa-map-marker" style="color: green; font-size: 1.7rem;"></i>';
    }else if(stock == "some"){
        return '<i class="fas fa-map-marker" style="color: yellow; font-size: 1.7rem;"></i>';
    }else if(stock == "few"){
        return '<i class="fas fa-map-marker" style="color: red; font-size: 1.7rem;"></i>';
    }else{
        return '<i class="fas fa-map-marker" style="color: grey; font-size: 1.7rem;"></i>';
    }
}

function getMaskNum(stock){
    if(stock == "plenty"){
        return '100개 이상';
    }else if(stock == "some"){
        return '30 ~ 99개';
    }else if(stock == "few"){
        return '2 ~ 29개';
    }else{
        return '1개 이하';
    }
}

function searchAddressToCoordinate(address) {
    naver.maps.Service.geocode({
        query: address
    }, function(status, response) {
        if (status === naver.maps.Service.Status.ERROR) {
            return alert('Something Wrong!');
        }

        if (response.v2.meta.totalCount === 0) {
            return alert('totalCount' + response.v2.meta.totalCount);
        }

        var htmlAddresses = [],
            item = response.v2.addresses[0],
            point = new naver.maps.Point(item.x, item.y);

        if (item.roadAddress) {
            htmlAddresses.push('[도로명 주소] ' + item.roadAddress);
        }

        if (item.jibunAddress) {
            htmlAddresses.push('[지번 주소] ' + item.jibunAddress);
        }

        if (item.englishAddress) {
            htmlAddresses.push('[영문명 주소] ' + item.englishAddress);
        }

        nmap.setCenter(point);
        getStoreData(point.y, point.x);
        displayLocation(item.jibunAddress);
    });
}

function searchCoordinateToAddress(lat, lng){
    naver.maps.Service.reverseGeocode({
        location: new naver.maps.LatLng(lat, lng),
    }, function(status, response) {
        if (status !== naver.maps.Service.Status.OK) {
            return alert('Something wrong!');
        }

        var result = response.result,
            items = result.items;

        displayLocation(items[0].address)
    });
}

function displayLocation(addr){
    document.querySelector(".current-location h3").innerText = addr;
}

var stores = [];
var storesMarker = [];
var storeOverlay = document.querySelector(".store-overlay");
var storeSidebar = document.querySelector(".store");
var storeInfoName = document.querySelector(".store-name");
var storeInfoContent = document.querySelector(".store-content");

document.querySelector("#nmap").addEventListener("mouseup", function(){
    getStoreData(nmap.center._lat, nmap.center._lng);
    searchCoordinateToAddress(nmap.center._lat, nmap.center._lng);
})

document.querySelector(".close-store").addEventListener("click", function(){
    toggleSidebar();
})

document.querySelector(".searchBtn").addEventListener("click", e => {
    e.preventDefault();
    queryOrigin = document.querySelector(".location-finder input");
    searchAddressToCoordinate(queryOrigin.value);
    queryOrigin.value = "";
})


//Initial map setting

getStoreData(nmap.center._lat, nmap.center._lng);
searchCoordinateToAddress(nmap.center._lat, nmap.center._lng);