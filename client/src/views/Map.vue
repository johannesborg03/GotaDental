<template>
  

<b-card class="map-card">
  <b-container class="map-container">   
    <b-row class="justify-content-center">
  <div id="map"></div>
    </b-row>
</b-container>
</b-card>


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
        this.map = L.map("map").setView([57.707, 11.966], 13); // [lat, lng], zoom level

        // Add a tile layer to the map (e.g., OpenStreetMap tiles)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);

      // Add a marker to the map
      L.marker([57.707, 11.966])
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

.map-card{
  padding: 0%;
  margin-top: 5%;
  margin-left: 20%;
  margin-right: 20%;
}

/* Ensure the map container has a height, or the map will not be visible */
.map-container {
 /* margin-top: 100px; */
  width: 500px;
  height: 400px;
}
#map {
  width: 750px;
  height: 400px;
}

.title {
  font-family: Tahoma;
  
}

@media (max-width: 768px) {
  .map-card {
    margin-left: 0%;
    margin-right: 0%;
  }
}
</style>
