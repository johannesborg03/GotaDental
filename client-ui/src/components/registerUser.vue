<template>
    <div>
        <h1>Sign up</h1>
        <div>
            <form @submit.prevent="submitForm">
                <div>
                    <input type="text" required v-model="username" placeholder="Enter username" class="user-input">
                </div>
                <div>
                    <input type="email" required v-model="email" placeholder="Enter email" class="user-input">
                </div>
                <div>
                    <input type="password" required v-model="password" placeholder="Enter password" class="user-input">
                </div>
                <div>
                    <input type="password" required v-model="ConfirmPassword" placeholder="Confirm password" class="user-input">
                </div>
                <div class="terms">
                    <label>Accept terms and conditions</label>
                    <input type="checkbox" required v-model="terms">
                </div>
                <button type="submit" class="sign-up-button">Sign Up</button>
            </form>
        </div>
    </div>
</template>

<script>
export default{
        data() {
        return {
            username: '',
            email: '',
            password: '',
            ConfirmPassword: '',
            terms: false
        }
    },
}
</script>