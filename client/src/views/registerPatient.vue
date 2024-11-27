<template>
    <div class="container py-4">
        <h1 class="text-primary mb-4 text-center">Register Patient</h1>
        <form @submit.prevent="register" >
            <div class="mb-3">
                <input type="text" id="ssn" v-model="ssn" placeholder="Enter your SSN" class="form-control"
                    required />
                     <!-- Show error message if validation fails -->
                <small v-if="errorMessage" class="text-danger">{{ errorMessage }}</small>
           
            </div>
            <div class="mb-3">
                <input type="email" id="email" v-model="email" placeholder="Enter email" class="form-control" required />
            </div>
            <div class="mb-3">
                <input type="name" id="name" v-model="name" placeholder="Enter name"
                    class="form-control" required />
            </div>
            <div class="mb-3">
                <input type="password" id="password" v-model="password" placeholder="Enter password"
                    class="form-control" required />
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
    name: 'Create account',
    data() {
        return {
            input: {
            ssn: '',
            email: '',
            name: '',
            password: '',
            terms: false,
        },
        message: "",  // To store any error message
        showToast: false,  // Toast visibility flag
        toastMessage: "",   // Toast message
        errorMessage: ""
    };
    },
    methods: {
        async register() {
        
              // Validate SSN
              if (!/^\d{12}$/.test(this.ssn)) {
                this.errorMessage = 'SSN needs to be exactly 12 digits!';
                return;
            }

            this.errorMessage = ''; // Clear error message if validation passes

            try {
                const response = await axios.post('http://localhost:4000/api/patients', {
                    ssn: this.ssn,
                    email: this.email,
                    name: this.name,
                    password: this.password,
                });
                

                alert(response.data.message);
                this.$router.push('/login');
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