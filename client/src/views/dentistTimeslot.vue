<template>
    <div class="container py-4">
        <div class="mb-4 text-center">
            <h1 class="text-primary">Dentist Interface</h1>
        </div>

        <div class="card shadow-sm">
            <div class="card-body">
                <h2 class="card-title text-secondary">Register a Slot</h2>
                <form @submit.prevent="registerSlot" class="needs-validation" novalidate>

                    <div class="mb-3">
                        <label for="slotDate" class="form-label">Select Date:</label>
                        <input type="date" id="slotDate" class="form-control" v-model="slotDate" required />
                        <div class="invalid-feedback">Please select a valid date.</div>
                    </div>

                    <div class="mb-3">
                        <label for="slotTime" class="form-label">Select Time: (Timeslot is for 1 hour)</label>
                        <input type="time" id="slotTime" class="form-control" v-model="slotTime" step="1800" required />
                        <div class="invalid-feedback">Please select a valid time.</div>
                    </div>

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
        }
    }
};
</script>
