<template>
  <div>
    <Form ref="formInline" :model="formInline" inline :label-width="70">
      <FormItem :label="$t('name')">
        <Input type="text" v-model="formInline.name">
        <Icon type="ios-person-outline"></Icon>
        </Input>
      </FormItem>
      <FormItem :label="$t('contact')">
        <Input type="text" v-model="formInline.contact">
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
    <Table :loading="loading" stripe border :columns="columns" :data="data" ref="table" ></Table>
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
        <FormItem :label="$t('name')" prop="name">
          <Input v-model="formItem.name"/>
        </FormItem>
        <FormItem :label="$t('contact')" >
          <Input v-model="formItem.contact"/>
        </FormItem>
        <FormItem :label="$t('contact_way')" >
          <Input v-model="formItem.contactWay"/>
        </FormItem>
        <FormItem :label="$t('address')" >
          <Input v-model="formItem.address"/>
        </FormItem>
        <FormItem :label="$t('remark')" prop="remark" >
          <Input type="textarea" :autosize="{minRows: 2,maxRows: 5}" v-model="formItem.remark"/>
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
  update,
  del
} from '@/api/data'
import {
  deepCopy,
  hasValue,
  hasOneOf
} from '@/libs/tools'
import moment from 'moment'
export default {
  name: 'customer_management',
  data () {
    return {
      moduleName: 'customer',
      page: 1,
      size: this.$pageSize,
      total: 0,
      loading: false,
      formTitle: '',
      ruleInline: {
        name: [{
          required: true,
          message: this.$t('input_fill.name')
        }],
        contactWay: [{
          required: true,
          message: this.$t('input_fill.contact_way')
        }],
        address: [{
          required: true,
          message: this.$t('input_fill.birthday')
        }],
        remark: []
      },
      modal: {
        title: ''
      },
      formInline: {
        name: '',
        contact: ''
      },
      formItem: {
        id: '',
        name: '',
        contact: '',
        contactWay: '',
        address: '',
        remark: ''
      },
      isShowForm: false,
      columns: [
        {
          type: 'index',
          width: 60,
          align: 'center',
          title: this.$t('index')
        },
        {
          title: this.$t('name'),
          key: 'name'
        },
        {
          title: this.$t('contact'),
          key: 'contact'
        },
        {
          title: this.$t('contact_way'),
          key: 'contactWay'
        },
        {
          title: this.$t('address'),
          key: 'address'
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
                    this.$Modal.confirm({
                      title: this.$t('delete'),
                      content: this.$t('areYouSureWantToDeleteIt'),
                      loading: true,
                      onOk: () => {
                        this.handleDel(params)
                      }
                    })
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
  computed: {
    access () {
      return this.$store.state.user.access
    },
    viewBoss () {
      return hasOneOf(['boss'], this.access)
    },
    viewSeller () {
      return hasOneOf(['seller'], this.access)
    },
    viewCashier () {
      return hasOneOf(['cashier'], this.access)
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
              console.info(res)
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
    handleDel (params) {
      this.formItem.id = params.row.id
      del(this.moduleName, this.formItem).then(res => {
        if (res.data.success) {
          this.$Message.success(this.$t('success'))
          this.selectEmployee()
          this.$Modal.remove()
        } else {
          this.$Message.error(res.data.message)
          this.$Modal.remove()
        }
      })
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
      obj.name = this.formInline.name
      obj.contact = this.formInline.contact
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
