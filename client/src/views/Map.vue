<template>





</template>

<script>
import L from "leaflet"; // Import Leaflet


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
