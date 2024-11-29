<template>
    <div class="container mt-5">
        <div class="card shadow-lg p-4">
            <h2 class="text-center mb-4">Register as a Dentist</h2>
            <form @submit.prevent="registerDentist">
                <div class="form-group mb-3">

                    <input type="text" id="name" v-model="input.name" class="form-control"
                        placeholder="Enter your full name" required />
                </div>

                <div class="form-group mb-3">

                    <input type="text" id="username" v-model="input.username" class="form-control"
                        placeholder="Enter your username (e.g., myname.dentist)" required />
                </div>

                <div class="form-group mb-3">

                    <input type="text" id="email" v-model="input.email" class="form-control"
                        placeholder="Enter your email" required />
                </div>
                <div class="form-group mb-3">

                    <input type="text" id="date_of_birth" v-model="input.date_of_birth" class="form-control"
                        placeholder="Enter your date of birth (YYYY-MM-DD)" required />
                </div>

                <div class="form-group mb-3">

                    <input type="password" id="password" v-model="input.password" class="form-control"
                        placeholder="Enter a password" required />
                </div>
                <div class="form-group mb-3">
                    <input type="password" id="confirmPassword" v-model="input.confirmPassword" class="form-control" 
                    placeholder="Confirm password"
                     required />
                </div>
                <div class="form-check mb-3">
                    <input type="checkbox" id="terms" class="checkbox-input" v-model="terms" required />
                    <label class="checkbox-label" for="terms">Accept terms and conditions</label>
                </div>

                <div class="d-grid gap-2">
                    <button type="submit" class="btn btn-primary">Register</button>
                </div>

                <div v-if="errorMessage" class="alert alert-danger mt-3">
                    {{ errorMessage }}
                </div>
                <div v-if="successMessage" class="alert alert-success mt-3">
                    {{ successMessage }}
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: "registrationDentist",
    data() {
        return {
            input: {
            name: '',
            username: '', // Added username
            email: '',
            date_of_birth: '',
            password: '',
            confirmPassword: '',
            },
            errorMessage: "",
            successMessage: "",
        };
    },
    methods: {

        async registerDentist() {


            // Validate date_of_birth format (YYYY-MM-DD)
            const dateOfBirthRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
            if (!dateOfBirthRegex.test(this.input.date_of_birth)) {
                this.errorMessage = 'Date of Birth must be in the format YYYY-MM-DD.';
                return;
            }

            // Check if the date is valid
            const date = new Date(this.input.date_of_birth);
            if (isNaN(date.getTime())) {
                this.errorMessage = 'Invalid Date of Birth. Please enter a valid date.';
                return;
            }

            // Validate username format
            if (/^\d{12}$/.test(this.input.username)) {
                this.errorMessage = 'username cant be a SSN!';
                return;
            }

            //Validate password 
            if (this.input.password != this.input.confirmPassword) {
                console.log(this.password, this.confirmPassword);
                alert('Password do not match');
                this.password = ''
                this.confirmPassword = ''
                return;
            }

            this.errorMessage = ''; // Clear error message if validation passes

            try {
                // this.successMessage = "";

                const response = await axios.post('http://localhost:4000/api/dentists', {
                    name: this.input.name,
                    username: this.input.username,
                    email: this.input.email, 
                    date_of_birth: this.input.date_of_birth,
                    password: this.input.password,
                });
              

                alert(response.data.message);
                this.$router.push('/login');
                this.successMessage = response.data.message || 'Registration successful!';
            
            } catch (err) {
             //   console.error('Error registering patient:', err);
             if (err.response && err.response.data) {
                    alert(err.response.data.message || 'Failed to register');
                } else {
                    alert('An error has occurred. Please try again.');
                }
            }
        },
    },
};
</script>

<style>
/* Add your styles here */
</style>
