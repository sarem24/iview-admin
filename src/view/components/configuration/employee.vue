<template>
  <!--<Input v-model="value" placeholder="Enter something..." style="width: 300px" />-->
  <div>
    <Form ref="formInline" :model="formInline" inline :label-width="70">
      <FormItem :label="$t('name')">
        <Input type="text" v-model="formInline.name">
        <Icon type="ios-person-outline"></Icon>
        </Input>
      </FormItem>
      <FormItem :label="$t('mobile')">
        <Input type="text" v-model="formInline.mobile">
        <Icon type="ios-person-outline"></Icon>
        </Input>
      </FormItem>
      <FormItem>
        <Button type="primary"  icon="md-search" @click="handleSearch()">{{$t('search')}}</Button>
      </FormItem>
    </Form>
    <Button size="large" shape="circle" icon="md-add" @click="handleShowForm()">{{$t('insert')}}</Button>
    <div style="margin: 10px;overflow: hidden">
      <div style="float: right;">
        <Page :total="total" :current="page" show-elevator show-total @on-change="changePage" :page-size="size"></Page>
      </div>
    </div>
    <Table :loading="loading" stripe border :columns="columns1" :data="data" ref="table" ></Table>
    <div style="margin: 10px;overflow: hidden">
      <div style="float: right;">
        <Page :total="total" :current="page" show-elevator show-total @on-change="changePage" :page-size="size"></Page>
      </div>
    </div>
    <Modal
      :title="formTitle"
      v-model="isShowForm"
      :mask-closable="false"
      :footer-hide="true">
      <Form :model="formItem" ref="formItem" :rules="ruleInline" :label-width="70">
        <FormItem :label="$t('account')" prop="account">
          <Input v-model="formItem.account"/>
        </FormItem>
        <FormItem :label="$t('name')" prop="name">
          <Input v-model="formItem.name"/>
        </FormItem>
        <FormItem :label="$t('gender')">
          <Select v-model="formItem.gender" prop="gender">
            <Option value="1">{{$t('man')}}</Option>
            <Option value="0">{{$t('woman')}}</Option>
          </Select>
        </FormItem>
        <FormItem :label="$t('telephone')" prop="telephone">
          <Input v-model="formItem.telephone"/>
        </FormItem>
        <FormItem :label="$t('mobile')" prop="mobile">
          <Input v-model="formItem.mobile"/>
        </FormItem>
        <FormItem :label="$t('email')" prop="email">
          <Input v-model="formItem.email"/>
        </FormItem>
        <FormItem :label="$t('birthday')" prop="birthday">
          <Col span="24">
          <DatePicker :editable="false" type="date" v-model="formItem.birthday"></DatePicker>
          </Col>
        </FormItem>
        <FormItem :label="$t('active')">
          <i-switch v-model="formItem.active" size="large">
            <span slot="open">生效</span>
            <span slot="close">失效</span>
          </i-switch>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleSubmit('formItem')">{{$t('submit')}}</Button>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import {
  insert,
  getDataPage,
  update
} from '@/api/data'
import {
  deepCopy,
  hasValue
} from '@/libs/tools'
import moment from 'moment'
export default {
  data () {
    return {
      moduleName: 'employee',
      page: 1,
      size: this.$pageSize,
      total: 0,
      loading: false,
      formTitle: '',
      ruleInline: {
        account: [{
          required: true,
          message: this.$t('input_fill.account')
        }],
        name: [{
          required: true,
          message: this.$t('input_fill.name')
        }],
        gender: [{
          required: true,
          message: this.$t('input_fill.gender')
        }],
        mobile: [{
          required: true,
          message: this.$t('input_fill.mobile')
        }],
        birthday: [{
          required: true,
          message: this.$t('input_fill.birthday')
        }],
        email: [],
        telephone: []
      },
      modal: {
        title: ''
      },
      formInline: {
        name: '',
        mobile: ''
      },
      formItem: {
        id: '',
        name: '',
        gender: '1',
        telephone: '',
        mobile: '',
        email: '',
        birthday: '',
        active: true
      },
      isShowForm: false,
      columns1: [
        {
          type: 'index',
          width: 60,
          align: 'center',
          title: this.$t('index')
        },
        {
          title: this.$t('account'),
          key: 'account',
          align: 'center'
        },
        {
          title: this.$t('name'),
          key: 'name'
        },
        {
          title: this.$t('gender'),
          key: 'gender',
          render: (h, params) => {
            let content = params.row.gender ? '男' : '女'
            return h('div', [
              h('div', {}, content)
            ])
          }
        },
        {
          title: this.$t('telephone'),
          key: 'telephone'
        },
        {
          title: this.$t('mobile'),
          key: 'mobile'
        },
        {
          title: this.$t('email'),
          key: 'email'
        },
        {
          title: this.$t('birthday'),
          key: 'birthday',
          render: (h, params) => {
            let content = moment(params.row.birthday).format('YYYY-MM-DD')
            return h('div', [
              h('div', {}, content)
            ])
          }
        },
        {
          title: this.$t('active'),
          key: 'active'
        },
        {
          title: this.$t('action'),
          key: 'action',
          width: 150,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.handleShowForm(params.index)
                  }
                }
              }, this.$t('edit')),
              h('Button', {
                props: {
                  type: 'error',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.remove(params.index)
                  }
                }
              }, this.$t('delete'))
            ])
          }
        }
      ],
      data: []
    }
  },
  methods: {
    changePage (pageNumber) {
      this.page = pageNumber
      this.selectEmployee()
    },
    handleSubmit (form) {
      this.$refs[form].validate((valid) => {
        if (valid) {
          this.formItem.birthday = moment(this.formItem.birthday).format('YYYY-MM-DD')
          if (!hasValue(this.formItem.id)) {
            insert(this.moduleName, this.formItem).then(res => {
              if (res.data.success) {
                this.$Message.success(this.$t('success'))
                this.$refs[form].resetFields()
                this.isShowForm = false
                this.selectEmployee()
              } else {
                this.$Message.error(res.data.message)
              }
            })
          } else {
            update(this.moduleName, this.formItem).then(res => {
              if (res.data.success) {
                this.$Message.success(this.$t('success'))
                this.$refs[form].resetFields()
                this.isShowForm = false
                this.selectEmployee()
              } else {
                this.$Message.error(res.data.message)
              }
            })
          }
        } else {
          this.$Message.error('Fail!')
        }
      })
    },
    handleSearch () {
      this.selectEmployee()
    },
    handleShowForm (index) {
      this.formItem.id = ''
      this.isShowForm = true
      if (!hasValue(index)) {
        this.formTitle = this.$t('insert')
      } else {
        this.formTitle = this.$t('edit')
        let formDate = deepCopy(this.data[index])
        formDate.gender = formDate.gender ? '1' : '0'
        formDate.birthday = new Date(formDate.birthday)
        this.formItem = formDate
      }
    },
    selectEmployee () {
      let obj = {}
      obj.page = this.page
      obj.size = this.size
      this.loading = true
      getDataPage(this.moduleName, obj).then(res => {
        this.total = res.data.result.total
        this.data = res.data.result.data
        this.loading = false
      })
    }
  },
  mounted () {
    this.selectEmployee()
  }
}
</script>

<style scoped>

</style>
