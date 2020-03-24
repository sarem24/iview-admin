<template>
  <div>
    <Form ref="formInline" :model="formInline" inline :label-width="70">
      <FormItem :label="$t('name')">
        <Input prefix="md-person" type="text" v-model="formInline.name" clearable/>
      </FormItem>
      <FormItem :label="$t('tag')">
        <Input style="width:450px;" prefix="md-pricetags" type="text" v-model="formInline.tag" clearable/>
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
    <information
      ref="information"
      :is-display="false"
      :modal-width="width"
      :form-title="formTitle"
      :is-show-form="isShowForm"
      @setShowForm="setShowForm">
    </information>
  </div>
</template>

<script>
import {
  insert,
  getDataPage,
  update,
  del
} from '@/api/data'
import _ from 'lodash'
import {
  hasValue,
  hasOneOf
} from '@/libs/tools'
import information from './information.vue'
export default {
  name: 'vendor',
  components: {
    information
  },
  data () {
    return {
      moduleName: 'vendor',
      page: 1,
      size: this.$pageSize,
      total: 0,
      loading: false,
      width: '85%',
      isShowForm: false,
      formTitle: '',
      id: 0,
      formInline: {
        name: '',
        tag: ''
      },
      columns: [
        {
          type: 'index',
          width: 70,
          align: 'center',
          title: this.$t('index')
        },
        {
          title: this.$t('name'),
          key: 'name',
          minWidth: 150
        },
        {
          title: this.$t('score'),
          key: 'score',
          width: 240,
          align: 'left',
          render: (h, params) => {
            return h('Rate', {
              props: {
                value: params.row.score,
                count: 7,
                disabled: true
              }
            })
          }
        },
        {
          title: this.$t('tag'),
          key: 'tag',
          minWidth: 200,
          align: 'left',
          render: (h, params) => {
            let content;
            let row = params.row
            if (hasValue(row.tag)) {
              let arrays = []
              row.tag.split(',').forEach((item, i) => {
                arrays.push(h('Tag',item))
              })
              content = h('div',arrays)
            } else {
              content = h('div','')
            }
            return content
          }
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
  watch: {
    isShowForm () {
      if (!this.isShowForm) {
        this.selectVendor()
      }
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
      this.selectVendor()
    },
    handleSearch () {
      this.selectVendor()
    },
    handleDel (params) {
      let formItem = {}
      formItem.id = params.row.id
      del(this.moduleName, formItem).then(res => {
        if (res.data.success) {
          this.$Message.success(this.$t('success'))
          this.selectVendor()
          this.$Modal.remove()
        } else {
          this.$Message.error(res.data.message)
          this.$Modal.remove()
        }
      })
    },
    handleShowForm (index) {
      this.id = null
      this.isShowForm = true
      if (!hasValue(index)) {
        this.formTitle = this.$t('insert')
      } else {
        this.formTitle = this.$t('edit')
        this.id = this.data[index].id
      }
      this.$refs.information.displayVendorModal(this.id)
    },
    selectVendor () {
      let obj = {}
      obj.page = this.page
      obj.size = this.size
      obj.name = this.formInline.name
      obj.tag = this.formInline.tag
      this.loading = true
      getDataPage(this.moduleName, obj).then(res => {
        this.total = res.data.result.total
        this.data = res.data.result.data
        this.loading = false
      })
    },
    setShowForm (value) {
      this.isShowForm = value
    }
  },
  mounted () {
    this.selectVendor()
  }
}
</script>
<style scoped>

</style>
