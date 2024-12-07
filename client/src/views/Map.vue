<template>
  <div>
  <div id="map" class="map-container"></div>
</div>


</template>

<script>


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
        try{
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
    } catch (error) {
    console.error("Error initializing the Leaflet map:", error);
  }
}
}
}




</script>


<style>
/* Add your styles here */

/* Ensure the map container has a height, or the map will not be visible */
.map-container {
  width: 180px;
  height: 180px;
}
#map {
  width: 380px;
  height: 340px;
}
</style>
