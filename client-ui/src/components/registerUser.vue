<template>
    <div class="container py-4">
        <h1 class="text-primary mb-4 text-center">Register Patient</h1>
        <form @submit.prevent="submitForm" class="registration-form">
            <div class="mb-3">
                <input type="text" id="username" v-model="username" placeholder="Enter username" class="username-input"
                    required />
            </div>
            <div class="mb-3">
                <input type="email" id="email" v-model="email" placeholder="Enter email" class="email-input" required />
            </div>
            <div class="mb-3">
                <input type="password" id="password" v-model="password" placeholder="Enter password"
                    class="password_input" required />
            </div>
            <div class="mb-3">
                <input type="password" id="confirmPassword" v-model="confirmPassword" placeholder="Confirm password"
                    class="confirm-password-input" required />
            </div>
            <div class="form-check mb-3">
                <input type="checkbox" id="terms" class="checkbox-input" v-model="terms" required />
                <label class="checkbox-label" for="terms">Accept terms and conditions</label>
            </div>
            <button type="submit" class="btn btn-primary w-100">Create account</button>
        </form>
    </div>
</template>

<script>
import axios from 'axios';


export default {
    data() {
        return {
            username: '',
            email: '',
            password: '',
            ConfirmPassword: '',
            terms: false,
        };
    },
    methods: {
        async submitForm() {
            if (this.password !== this.ConfirmPassword) {
                alert('Password do not match');
                this.password = ''
                this.confirmPassword = ''
                return;
            }

            try {
                const response = await axios.post('http://localhost:3000/api/patients', {
                    patient_username: this.username,
                    email: this.email,
                    password: this.password,
                });

                alert(response.data.message);
                this.$router.push('/login');
            } catch (err) {
                console.error('Error registering user:', err);
                if (err.response && err.response.data) {
                    alert(err.response.data.message || 'Registration failed');
                } else {
                    alert('An error occurred. Please try again.');
                }
            }
        },
    },
};
</script>