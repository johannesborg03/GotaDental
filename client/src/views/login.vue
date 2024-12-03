<template>
    <div class="container py-4">
        <h1 class="text-primary mb-4 text-center">Login</h1>
        <form @submit.prevent="onSubmit" class="login-form">
            <div class="mb-3">
                <input type="text" id="username_ssn" v-model="username_ssn" placeholder="Enter username or ssn"
                    class="form-control" required />
            </div>
            <div class="mb-3">
                <input type="password" id="password" v-model="password" placeholder="Enter password"
                    class="form-control" required />
            </div>
            <button type="submit" class="btn btn-primary w-100">Login</button>
            <div class="mt-3 text-center">
                <p>Don't have an account? <a href="/registerDentist">Register as Dentist</a> or <a
                        href="/registerPatient">Register as
                        Patient</a></p>
            </div>
        </form>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            username_ssn: '',
            password: '',
        };
    },
    methods: {
        async onSubmit() {
            console.log("Submitting login form...");
            console.log("Data being sent:", {
                username_ssn: this.username_ssn,
                password: this.password,
            });
            try {

                const response = await axios.post('http://localhost:4000/api/login', {
                    username_ssn: this.username_ssn,
                    password: this.password,
                });

                console.log("Received response:", response.data);
                
                localStorage.setItem('userIdentifier', this.username_ssn);

                if (this.username_ssn.endsWith('DT')) {
                    // Redirect to dentist homepage if user is a dentist 
                    this.$router.push('/dentist');
                } else {
                    // Redirect to patient homepage if user is a patient
                    this.$router.push('/patient');
                }
            } catch (err) {
                console.error('Error during login:', err);
                if (err.response && err.response.data) {
                    alert(err.response.data.message || 'Login failed');
                } else {
                    alert('An error has occurred. Please try again.');
                }
            }
        },
    },
};



</script>
