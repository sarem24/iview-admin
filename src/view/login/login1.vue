<style lang="less">
  @import './login1.less';
</style>

<template>
  <div class="page-account">
    <div class="page-account-container">
      <div class="page-account-top">
        <div class="page-account-top-logo">
          <img src="../../assets/images/yihai.png" alt="logo"></div>
      </div>
      <div class="ivu-login">
        <login-form @on-success-valid="handleSubmit"></login-form>
        <!--<p class="login-tip">输入任意用户名和密码即可</p>-->
      </div>

    </div>
    <footer class="ivu-global-footer i-copyright">
      <div class="ivu-global-footer-copyright">Copyright © 2019-2020 上海益海信息技术有限公司</div>
    </footer>
  </div>
</template>

<script>
import LoginForm from '_c/login-form'
import { mapActions } from 'vuex'

export default {
  components: {
    LoginForm
  },
  methods: {
    ...mapActions([
      'handleLogin',
      'getUserInfo'
    ]),
    handleSubmit ({ userName, password }) {
      this.handleLogin({ userName, password }).then(res => {
        if (res.data.success) {
          this.getUserInfo().then(res => {
            this.$router.push({
              name: this.$config.homeName
            })
          })
        } else {
          this.$Message.error(res.data.result)
        }
      })
    }
  }
}
</script>

<style>

</style>
