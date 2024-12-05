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
    
}

}
</script>


<style>
/* Add your styles here */
</style>
