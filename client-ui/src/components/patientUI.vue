<template>
    <div class="patient-interface">
        <h1>Your account</h1>

        <div class="booking-appointment">
            <h2>Book a appointment</h2>
            <label for="date">Select Date:</label>
            <input type="date" v-model="bookingDate" />

            <label for="time">Select Time:</label>
            <input type="time" v-model="bookingTime" />

            <button @click="bookSlot">Book Dentist Slot</button>

            <p v-if="bookingNotification" class="bookingNotification">{{ bookingNotification }}</p>
        </div>

        <div class="notifications">
            <h2>Notification</h2>
            <ul>
                <li v-for="(notification, index) in notifications" :key="index">
                    {{ notification.message }} - {{ notification.date }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            bookingDate: "",
            bookingTime: "",
            bookingNotification: "",

            notification: [
                { message: "Your booking for 12:00 PM is booked.", date: "2003-11-16" }
            ],
        }
    },
    methods: {
        bookSlot() {
            if (this.bookingDate && this.bookingTime) {
                this.bookingMessage = `Slot booked for ${this.bookingDate} at ${this.bookingTime}`;

                this.bookingDate = "";
                this.bookingTime = "";
            } else {
                this.bookingMessage = "Please select the available slot!";
            }
        },
    }
}
</script>