<template>
  

<b-card class="map-card">
  <b-row class="justify-content-center text-center title">
  <b-col>MAP</b-col>
</b-row>
  <b-container class="map-container">   
    <b-row class="justify-content-center">
  <div id="map"></div>
    </b-row>
</b-container>
</b-card>


</template>

<script>
import axios from "axios";


export default {
    name: "Map",
    data() {
        return {
            offices: [], // Array to store office data
            map: null, //Reference to leaflet map instance
        };
    },
    async mounted() {
   //   this.initMap();
      try {
      // Fetch office data
      const response = await axios.get("http://localhost:4000/api/offices");
      this.offices = response.data.offices; // Save the office data

      // Initialize the map
      this.initMap();

      // Add markers for each office
      this.addMarkers();
    } catch (error) {
      console.error("Error fetching offices:", error);
    }
},

methods: {
    
  initMap() {
      // Create a Leaflet map instance and attach it to the #map div
      this.map = L.map("map").setView([57.707, 11.966], 13); // [lat, lng], zoom level

      // Add a tile layer to the map (e.g., OpenStreetMap tiles)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);
    },
    addMarkers() {
      // Loop through all the offices and place a marker for each one
      this.offices.forEach((office) => {
        const { latitude, longitude, office_name, office_address } = office;

        // Add a marker to the map
        const marker = L.marker([latitude, longitude])
          .addTo(this.map)
          .bindPopup(`
            <strong>${office_name}</strong><br>
            ${office_address}
          `)
          .openPopup();
      });
    },
  },
};




</script>


<style>

.map-card{
  background-color: #003C47 !important;
  color: #003C47;
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
  margin-bottom: 1%;
  color: #E0E0E0;
  
}

@media (max-width: 768px) {
  .map-card {
    margin-left: 0%;
    margin-right: 0%;
  }
}
</style>
