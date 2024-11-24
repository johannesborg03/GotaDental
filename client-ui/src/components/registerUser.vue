<template>
    <div class="container py-4">
        <h1 class="text-primary mb-4 text-center">Register Patient</h1>
        <form @submit.prevent="submitForm" class="registration-form">
            <div class="mb-3">
                <input type="text" id="username" v-model="username" placeholder="Enter username" class="username-input"
                    required />
            </div>
            <div class="mb-3">
                <input type="email" id="email" v-model="email" placeholder="Enter email" class="email-input"
                    required />
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
        submitForm() {
            if (this.password !== this.ConfirmPassword) {
                alert('Password do not match');
                this.password = ''
                this.confirmPassword = ''
                return;
            }

            const topic = 'users/registration';
            const message = JSON.stringify({
                username: this.username,
                email: this.email,
            });

            // Publish the registration details
            publishMessage(topic, message);

            alert('User registered successfully!');

            // Reset form fields
            this.username = '';
            this.email = '';
            this.password = '';
            this.confirmPassword = '';
            this.terms = false;
        }
    }
}
</script>