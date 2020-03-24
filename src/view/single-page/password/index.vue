<template>
  <div>
    <Form ref="formItem" :model="formItem"  :rules="ruleInline" :label-width="140">
      <Row type="flex" justify="center">
        <Col span="16">
          <FormItem label="当前密码" prop="oldPassword">
            <Input type="password" :maxlength=40 v-model="formItem.oldPassword" placeholder="请输入当前密码"/>
          </FormItem>
        </Col>
      </Row>
      <Row type="flex" justify="center">
        <Col span="16">
        <FormItem label="新密码" prop="newPassword">
          <Input type="password" :maxlength=40 v-model="formItem.newPassword" placeholder="请输入新密码"/>
        </FormItem>
        </Col>
      </Row>
      <Row type="flex" justify="center">
        <Col span="16">
        <FormItem label="新密码二次确认" prop="checkNewPassword">
          <Input type="password" :maxlength=40 v-model="formItem.checkNewPassword" placeholder="请再次输入上面的密码"/>
        </FormItem>
        </Col>
      </Row>
      <Row>
        <Col offset="16">
        <FormItem>
          <Button type="primary" @click="handleSubmit('formItem')">{{$t('submit')}}</Button>
        </FormItem>
        </Col>
      </Row>
    </Form>
  </div>
</template>

<script>
import {
  updateDate
} from '@/api/data'
export default {
  data () {
    return {
      moduleName: 'employee',
      formItem: {
        oldPassword: '',
        newPassword: '',
        checkNewPassword: ''
      },
      ruleInline: {
        oldPassword: [{
          required: true,
          message: this.$t('input_fill.password')
        }],
        newPassword: [{
          required: true,
          message: this.$t('input_fill.password')
        }],
        checkNewPassword: [{
          validator: this.validatorPassword
        }]
      }
    }
  },
  computed: {

  },
  methods: {
    validatorPassword (rule, value, callback) {
      if (value === '') {
        callback(new Error(this.$t('input_fill.password')))
      } else if (value !== this.formItem.newPassword) {
        callback(new Error(this.$t('input_fill.passwordsEnteredTwiceAreInconsistent')))
      } else {
        callback()
      }
    },
    handleSubmit (form) {
      this.$refs[form].validate((valid) => {
        if (valid) {
          updateDate(this.moduleName, 'password', this.formItem).then(res => {
            if (res.data.success) {
              this.$Message.success(this.$t('success'))
              this.$refs[form].resetFields()
            } else {
              this.$Message.error(res.data.message)
            }
          })
        }
      })
    }
  },
  mounted () {

  }
}
</script>

<style lang="less">

</style>
