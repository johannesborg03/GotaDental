<template>
    <div class="container py-4">
        <div class="mb-4 text-center">
            <h1 class="text-primary">Available Slots</h1>
        </div>

        <!-- Available Slots Section -->
        <div class="card shadow-sm">
            <div class="card-body">
                <h2 class="card-title text-secondary">Book a Slot</h2>
                <ul class="list-group">
                    <li v-for="(slot, index) in availableSlots" :key="index"
                        class="list-group-item d-flex justify-content-between align-items-center">
                        <span>
                            <i class="bi bi-calendar-event text-primary"></i>
                            {{ new Date(slot.date_and_time).toLocaleDateString() }} at
                            {{ new Date(slot.date_and_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                        </span>
                    </li>
                </ul>
                <div v-if="availableSlots.length === 0 && !errorMessage" class="text-center mt-3 text-muted">
                    <i>No slots available</i>
                </div>
            </div>
        </div>

        <!-- Error Message Section -->
        <div v-if="errorMessage" class="alert alert-danger text-center">
            {{ errorMessage }}
        </div>

        <!-- Refresh Button -->
        <div class="text-center mt-4">
            <button class="btn btn-primary" @click="fetchAvailableSlots">
                Refresh Slots
            </button>
        </div>
    </div>
</template>


<script>
export default {
    data() {
        return {
            availableSlots: [],
            errorMessage: null,
        };
    },
    async mounted() {
    await this.fetchAvailableSlots();
    },
    methods: {
        async fetchAvailableSlots() {
            this.errorMessage = null; 
            try{

            } catch(error){
                console.log('Error: Can not fetch any available slots', error);
                this.errorMessage = 'Failed to load available slots. Please try again later.';
            }
        },
    },
};
</script>
