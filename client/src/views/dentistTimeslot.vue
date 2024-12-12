<template>
    <div class="container py-4">
        <div class="mb-4 text-center">
            <h1 class="text-primary">Dentist Interface</h1>
        </div>

        <div class="card shadow-sm">
            <div class="card-body">
                <h2 class="card-title text-secondary">Register a Slot</h2>
                <form @submit.prevent="registerSlot" class="needs-validation" novalidate>

                    <!-- Input for selecting the date -->
                    <div class="mb-3">
                        <label for="slotDate" class="form-label">Select Date:</label>
                        <input type="date" id="slotDate" class="form-control" v-model="slotDate" required />
                        <div class="invalid-feedback">Please select a valid date.</div>
                    </div>

                    <!-- Input for selecting the time -->
                    <div class="mb-3">
                        <label for="slotTime" class="form-label">Select Time: (Timeslot is for 1 hour)</label>
                        <input type="time" id="slotTime" class="form-control" v-model="slotTime" step="1800" required />
                        <div class="invalid-feedback">Please select a valid time.</div>
                    </div>

                    <!-- List of offices -->
                    <div class="mb-3">
                        <label class="form-label">Select Office:</label>
                        <div v-if="offices.length > 0">
                            <div v-for="office in offices" :key="office.office_id" class="card my-2 p-2"
                                :class="{ 'bg-primary text-white': selectedOffice === office.office_id }"
                                @click="selectOffice(office.office_id)" style="cursor: pointer;">
                                <h5>{{ office.office_name }}</h5>
                                <p>Address: {{ office.office_address }}</p>
                                <p>Latitude: {{ office.latitude }}, Longitude: {{ office.longitude }}</p>
                            </div>
                        </div>
                        <div v-else>
                            <p class="text-danger">No offices available.</p>
                        </div>
                    </div>

                    <!-- Submission Button -->
                    <div>
                        <button class="btn btn-primary w-100" type="submit">
                            <i class="bi bi-calendar-check"></i> Register Slot
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            slotDate: '',
            slotTime: '',
            username: '', // should be change to ssn 
            selectedOffice: null,
            offices: [],
        };
    },

    mounted() {
        this.username = this.$route.params.username || sessionStorage.getItem('userIdentifier'); // Prefer route, fallback to storage
        this.fetchUserData();
    },

    methods: {
        async fetchUserData() {
            try {


                const response = await fetch(`http://localhost:3005/api/dentist/${this.username}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch user data: ${response.status}`);
                }

                const userData = await response.json();
                console.log('Fetched user data:', userData);

            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        },

        isValidTime(slotTime) {
            const [hours, minutes] = slotTime.split(':').map(Number);
            return minutes % 30 === 0;
        },
        // Register a time slot for the specified username
        async registerSlot() {
            //if (!this.slotDate || !this.slotTime || !this.selectedOffice) {
            // Validate required fields
            if (!this.slotDate || !this.slotTime) {
                alert('Please select a valid date and time!');
                return;
            }

            // Validate time is in 30-minute intervals
            if (!this.isValidTime(this.slotTime)) {
                alert('Time must be in 30-minute intervals (e.g., 09:00, 09:30).');
                return;
            }

            try {
                // Construct the slot details
                const slotDetails = {
                    date_and_time: `${this.slotDate}T${this.slotTime}`,
                    timeslot_state: 1, // Example state; can be dynamic (1 is for available, 0 is for unavailable)
                    dentist_username: this.username
                };

                // Make the POST request to register the time slot
                const response = await fetch(`http://localhost:4000/api/timeslot/${this.username}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(slotDetails),
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Slot registered successfully:', data);
                    alert('Time slot registered successfully!');

                    // Reset form fields
                    this.slotDate = '';
                    this.slotTime = '';
                } else {
                    const errorData = await response.json();
                    alert(`Failed to register slot: ${errorData.message}`);
                }

            } catch (error) {
                console.error('Error registering slot:', error);
                alert('An error occurred while registering the time slot. Please try again later.');
            }
        },
        async fetchOffices() {
            try {
                console.log('Fetching offices from API...');
                const response = await axios.get('http://localhost:4000/api/offices');
                console.log('Response from API:', response.data);

                if (response.data.offices && response.data.offices.length > 0) {
                    this.offices = response.data.offices;
                } else {
                    this.offices = [];
                    alert('No offices available.');
                }
            } catch (error) {
                console.error('Error fetching offices:', error.response ? error.response.data : error.message);
                alert('Failed to load offices. Please try again.');
            }
        },

        async selectOffice(officeId) {
            this.selectedOffice = officeId;
            console.log("Selected Office:", officeId);
        },
    }
};
</script>
