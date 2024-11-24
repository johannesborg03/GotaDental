<template>
    <div class="container py-4">
        <h1 class="text-primary mb-4 text-center">Login</h1>
        <form @submit.prevent="onSubmit" class="login-form">
            <div class="mb-3">
                <input type="text" id="username" v-model="username" placeholder="Enter username" class="username-input"
                    required />
            </div>
            <div class="mb-3">
                <input type="password" id="password" v-model="password" placeholder="Enter password"
                    class="password-input" required />
            </div>
            <button type="submit" class="btn btn-primary w-100">Login</button>
            <div class="mt-3 text-center">
                <p>Don't have an account? <a href="/registerDentist">Register as Dentist</a> or <a href="/registerPatient">Register as
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
            username: '',
            password: '',
        };
    },
    methods: {
        async onSubmit() {
            try {
                const response = await axios.post('http://localhost:3000/api/login', {
                    username: this.username,
                    password: this.password,
                });

                localStorage.setItem('token', response.data.token);
                if (this.username.endsWith('.dentist')) {
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
