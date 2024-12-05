<template>
 <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
     integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
     crossorigin=""/>




</template>

<script>
import L from "leaflet"; // Import Leaflet
import "leaflet/dist/leaflet.css";

export default {
    name: "Map",
    data() {
        return {
            
            map: null, //Reference to leaflet map instance
        };
    },
    async mounted() {
        


        this.initMap();
},
methods: {
    initMap(){
        // Create a Leaflet map instance and attach it to the #map div
        this.map = L.map("map").setView([51.505, -0.09], 13); // [lat, lng], zoom level

        // Add a tile layer to the map (e.g., OpenStreetMap tiles)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);

      // Add a marker to the map
      L.marker([51.505, -0.09])
        .addTo(this.map)
        .bindPopup("A sample marker.")
        .openPopup();
    }
}

}


</script>


<style>
/* Add your styles here */

/* Ensure the map container has a height, or the map will not be visible */
.map-container {
  width: 100%;
  height: 100%;
}
#map {
  width: 100%;
  height: 100%;
}
</style>
