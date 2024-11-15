<template>
    <div>
        <h1 class="title">Login</h1>
        <div class="account-container">
            <form @submit.prevent="onSubmit">
                <div>
                    <input type="text" v-model="username" placeholder="Username" class="user-input" required />
                </div>
                <div>
                    <input type="password" v-model="password" placeholder="Password" class="user-input" required />
                </div>
                <button type="submit" class="login-button">Login</button>
                <div class="register-container">
                    <p>Don't have an account? </p>
                </div>
            </form>
        </div>
    </div>

</template>

<script>
export default {
    data() {
        return {
            username: '',
            password: '',

        }
    }
}



</script>

<style>

</style>