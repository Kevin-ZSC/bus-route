
(function(){

    //create map in leaflet and tie it to the div called 'theMap'
    const map = L.map('theMap').setView([44.650627, -63.597140], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

    // L.marker([44.650690, -63.596537]).addTo(map)
    //     .bindPopup('This is a sample popup. You can put any html structure in this including extra bus data. You can also swap this icon out for a custom icon. A png file has been provided for you to use if you wish.')
    //     .openPopup();
    let geojsonLayer;
    function fetchBusData() {
        fetch("https://prog2700.onrender.com/hrmbuses")
        .then(res=> res.json())
        .then(json => {
            console.log(json);
            //filter the 1-10 bus routes
            const regex = new RegExp('^(?:[1-9]|10[1-9][A-Z])$');
            const buses = json.entity;
            const busesRoute = buses.filter((e)=>regex.test(e.vehicle.trip.routeId));
            console.log(busesRoute);
            //transform to geojson
            const busesRouteInGeo = busesRoute.map((e)=> {
                return {
                    "type": "Feature",
                    "properties": {
                            "id": e.vehicle.vehicle.id,
                            "routeId":e.vehicle.trip.routeId,
                            "bearing":e.vehicle.position.bearing,
                            "speed":e.vehicle.position.speed
                            },
                    "geometry": {
                                "type": "Point",
                                "coordinates": [e.vehicle.position.longitude, e.vehicle.position.latitude]
                            }
                        }
                    
                })
            console.log(busesRouteInGeo);
            
            //apply those on the map;
           
            if(geojsonLayer) {
                console.log('Removing previous GeoJSON layer');
                map.removeLayer(geojsonLayer);
            }
            const busImg = L.icon({
                iconUrl:'./bus.png',
                iconSize: [38, 38],
            })

            geojsonLayer = L.geoJSON(busesRouteInGeo, {
                pointToLayer: (feature,latLng) => {
                    const bearing = feature.properties.bearing;
                    return  L.marker(latLng,{
                        "icon":busImg,
                        "speed":feature.properties.speed,
                        "bearing":feature.properties.bearing,
                        "rotationAngle":bearing,
                        "rotationOrigin": 'center',
                    })
                },
                onEachFeature: (feature,layer) => layer.bindPopup(`bus Id: ${feature.properties.id} <br> route: ${feature.properties.routeId} <br> speed: ${feature.properties.speed} <br> bearing:${feature.properties.bearing}`)
            }).addTo(map);
            
        })
        setTimeout(() => {
            fetchBusData()
        }, 15000);
    } 
    
    setTimeout(() => {
        fetchBusData()
    }, 15000);
        
        
})()