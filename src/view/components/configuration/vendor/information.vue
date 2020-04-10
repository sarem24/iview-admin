<template>
  <div>
    <Modal
      :title="formTitle"
      v-model="innerShowForm"
      :width="modalWidth"
      :mask-closable="false"
      @on-cancel="clearForm()"
      :footer-hide="true">
      <Form :model="formItem" ref="formItem" :rules="ruleInline" :label-width="70">
        <FormItem :label="$t('name')" prop="name">
          <Input v-model="formItem.name"/>
        </FormItem>
        <FormItem :label="$t('score')">
          <Rate clearable v-model="formItem.score" :count="7" :disabled="isDisplay" />
        </FormItem>
        <FormItem :label="$t('tag')">
          <Tag v-for="(item,index) in tags" :key="item" :name="item" :closable="!isDisplay" @on-close="handleCloseTag(index)">{{ item }}</Tag>
          <Button v-if="!isDisplay" icon="ios-add" type="dashed" size="small" @click="addTag">添加标签</Button>
        </FormItem>
        <FormItem :label="$t('remark')" prop="remark" >
          <Input type="textarea" :autosize="{minRows: 2,maxRows: 5}" v-model="formItem.remark"/>
        </FormItem>
        <FormItem>
          <Button v-if="!isDisplay" style="margin-right: 30px;" type="primary" @click="handleSubmit('formItem')">{{$t('save')}}</Button>
          <Button type="primary" @click="clearForm">{{$t('close')}}</Button>
        </FormItem>
      </Form>
      <Row v-if="isEdit && !isDisplay">
        <Col span="12">
          <Button size="large" @click="isShowPerson = true">
            <Icon type="md-person-add"></Icon>
            {{$t('insert')}}
          </Button>
        </Col>
        <Col span="12">
          <Button size="large" @click="isShowAddress = true">
            <Icon type="ios-car"></Icon>
            {{$t('insert')}}
          </Button>
        </Col>
      </Row>
      <Row v-if="isEdit">
        <Col span="12">
          <List item-layout="vertical" border size="small">
            <ListItem v-for="item in personData" :key="item.id">
              <ListItemMeta  :title="item.name" />
              <div>
                <Icon type="md-call" /> {{item.mobile}}
                <br/>
                <Icon type="md-mail" /> {{item.email}}
              </div>
              <template slot="extra" v-if="!isDisplay">
                <li class="operationButtonPosition">
                  <ButtonGroup shape="circle">
                    <Button type="primary" @click="handleEditPerson(item)">
                      <Icon type="ios-document-outline"></Icon>
                      {{$t('edit')}}
                    </Button>
                    <Button type="error" @click="handleConfirmDelete(personModule, item.id)">
                      {{$t('delete')}}
                      <Icon type="md-trash"></Icon>
                    </Button>
                  </ButtonGroup>
                </li>
              </template>
            </ListItem>
          </List>
        </Col>
        <Col span="12">
          <List item-layout="vertical" border size="small">
            <ListItem v-for="(item, index) in addressData" :key="item.id">
              <ListItemMeta :title="($t('address')) + ' ' + (index+1)" :description="item.address" />
              <template slot="extra" v-if="!isDisplay">
                <li class="operationButtonPosition">
                  <ButtonGroup shape="circle">
                    <Button type="primary" @click="handleEditAddress(item)">
                      <Icon type="ios-document-outline"></Icon>
                      {{$t('edit')}}
                    </Button>
                    <Button type="error" @click="handleConfirmDelete(addressModule, item.id)">
                      {{$t('delete')}}
                      <Icon type="md-trash"></Icon>
                    </Button>
                  </ButtonGroup>
                </li>
              </template>
            </ListItem>
          </List>
        </Col>
      </Row>
    </Modal>
<!--标签表单-->
    <Modal
      :title="formItem.name"
      :footer-hide="true"
      @on-cancel="clearTagForm()"
      v-model="isShowTag" >
      <Form :model="formTagItem" ref="formTagItem" :rules="ruleInline" :label-width="70" >
        <FormItem :label="$t('tag')" prop="tag">
          <Input v-model="formTagItem.tag"/>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleSaveTag('formTagItem')">{{$t('save')}}</Button>
        </FormItem>
      </Form>
    </Modal>
<!--    人员表单-->
    <Modal
      :title="formItem.name"
      :footer-hide="true"
      @on-cancel="clearPersonForm()"
      v-model="isShowPerson" >
      <Form :model="formPersonItem" ref="formPersonItem" :rules="ruleInline" :label-width="70" >
        <FormItem v-show="false"  prop="id">
          <Input v-model="formPersonItem.id"/>
        </FormItem>
        <FormItem :label="$t('name')" prop="name">
          <Input v-model="formPersonItem.name"/>
        </FormItem>
        <FormItem :label="$t('mobile')" prop="mobile">
          <Input v-model="formPersonItem.mobile"/>
        </FormItem>
        <FormItem :label="$t('email')" prop="email">
          <Input v-model="formPersonItem.email"/>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleSavePerson('formPersonItem')">{{$t('save')}}</Button>
        </FormItem>
      </Form>
    </Modal>
<!--    地址表单-->
    <Modal
      :title="formItem.name"
      :footer-hide="true"
      @on-cancel="clearAddressForm()"
      v-model="isShowAddress" >
      <Form :model="formAddressItem" ref="formAddressItem" :rules="ruleInline" :label-width="70" >
        <FormItem v-show="false"  prop="id">
          <Input v-model="formAddressItem.id"/>
        </FormItem>
        <FormItem :label="$t('address')" prop="address">
          <Input type="textarea" :autosize="{minRows: 3,maxRows: 10}" v-model="formAddressItem.address"/>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleSaveAddress('formAddressItem')">{{$t('save')}}</Button>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import {
  insert,
  getData,
  update,
  del
} from '@/api/data'
import {
  hasValue,
  hasOneOf
} from '@/libs/tools'
import _ from 'lodash'
export default {
  name: 'information',
  props: {
    isDisplay: Boolean,
    modalWidth: String,
    formTitle: String,
    isShowForm: Boolean
  },
  data () {
    return {
      vendorModule: 'vendor',
      personModule: 'vendor_person',
      addressModule: 'vendor_address',
      isShowPerson: false,
      isShowAddress: false,
      isShowTag: false,
      modal: {
        title: ''
      },
      tag: '',
      tags: [],
      formItem: {
        id: '',
        name: '',
        score: 0,
        tag: '',
        remark: ''
      },
      formTagItem: {
        tag: ''
      },
      formPersonItem: {
        id: '',
        vendorId: '',
        name: '',
        mobile: '',
        email: ''
      },
      formAddressItem: {
        id: '',
        vendorId: '',
        address: ''
      },
      ruleInline: {
        id: [],
        name: [{
          required: true,
          message: this.$t('input_fill.name')
        }],
        tag: [{
          required: true,
          message: this.$t('input_fill.tag')
        }],
        mobile: [{
          max: 50,
          required: true,
          message: this.$t('input_fill.mobile')
        }],
        email: [{
          max: 60
        }],
        remark: [{
          max: 255
        }],
        address: [{
          required: true,
          max: 150,
          message: this.$t('input_fill.address')
        }]
      },
      personData: [],
      addressData: []
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
    },
    formItemTag () {
      return this.formItem.tag
    },
    innerShowForm: {
      get () {
        return this.isShowForm
      },
      set (value) {
        this.$emit('setShowForm', value)
      }
    },
    isEdit () {
      return hasValue(this.formItem.id)
    }
  },
  methods: {
    initFormItem () {
      this.formItem = {
        id: '',
        name: '',
        score: 0,
        tag: '',
        remark: ''
      }
    },
    initTagFormItem () {
      this.formTagItem = {
        tag: ''
      }
    },
    displayVendorModal (id) {
      this.formItem.id = id
      if (hasValue(id)) {
        this.getVendorData(id)
      }
    },
    clearForm () {
      this.initFormItem()
      this.$refs['formItem'].resetFields()
      this.innerShowForm = false
      this.tags = []
      this.personData = []
      this.addressData = []
    },
    clearTagForm () {
      this.$refs['formTagItem'].resetFields()
      this.initTagFormItem()
      this.isShowTag = false
    },
    clearPersonForm () {
      this.$refs['formPersonItem'].resetFields()
      this.isShowPerson = false
    },
    clearAddressForm () {
      this.$refs['formAddressItem'].resetFields()
      this.isShowAddress = false
    },
    addTag () {
      if (!hasValue(this.formItem.name)) {
        this.$Message.warning(this.$t('input_fill.name'))
      } else {
        this.isShowTag = true
      }
    },
    getVendorData (value) {
      let form = {}
      form.id = value
      getData(this.vendorModule, form).then(res => {
        this.handleAssignment(res.data.result.data[0])
        this.getVendorPersonData(this.formItem.id)
        this.getVendorAddressData(this.formItem.id)
      })
    },
    getVendorPersonData (value) {
      let form = {}
      form.vendorId = value
      getData(this.personModule, form).then(res => {
        this.personData = res.data.result.data
      })
    },
    getVendorAddressData (value) {
      let form = {}
      form.vendorId = value
      getData(this.addressModule, form).then(res => {
        this.addressData = res.data.result.data
      })
    },
    handleCloseTag (index) {
      this.tags.splice(index, 1)
    },
    handleAssignment (obj) {
      this.formItem = obj
      if (hasValue(this.formItem.tag)) {
        this.tags = this.formItem.tag.split(',')
      }
      this.formPersonItem.vendorId = this.formItem.id
      this.formAddressItem.vendorId = this.formItem.id
    },
    handleEditPerson (param) {
      this.formPersonItem = _.cloneDeep(param)
      this.isShowPerson = true
    },
    handleEditAddress (param) {
      this.formAddressItem = _.cloneDeep(param)
      this.isShowAddress = true
    },
    handleSaveTag (form) {
      this.$refs[form].validate((valid) => {
        if (valid) {
          this.tags.push(this.formTagItem.tag)
          this.clearTagForm()
        }
      })
    },
    handleSavePerson (form) {
      this.$refs[form].validate((valid) => {
        if (valid) {
          if (!hasValue(this.formPersonItem.id)) {
            insert(this.personModule, this.formPersonItem).then(res => {
              if (res.data.success) {
                this.$Message.success(this.$t('success'))
                this.getVendorPersonData(this.formItem.id)
                this.clearPersonForm()
              } else {
                this.$Message.error(res.data.message)
              }
            })
          } else {
            update(this.personModule, this.formPersonItem).then(res => {
              if (res.data.success) {
                this.$Message.success(this.$t('success'))
                this.getVendorPersonData(this.formItem.id)
                this.clearPersonForm()
              } else {
                this.$Message.error(res.data.message)
              }
            })
          }
        }
      })
    },
    handleSaveAddress (form) {
      this.$refs[form].validate((valid) => {
        if (valid) {
          if (!hasValue(this.formAddressItem.id)) {
            insert(this.addressModule, this.formAddressItem).then(res => {
              if (res.data.success) {
                this.$Message.success(this.$t('success'))
                this.getVendorAddressData(this.formItem.id)
                this.clearAddressForm()
              } else {
                this.$Message.error(res.data.message)
              }
            })
          } else {
            update(this.addressModule, this.formAddressItem).then(res => {
              if (res.data.success) {
                this.$Message.success(this.$t('success'))
                this.getVendorAddressData(this.formItem.id)
                this.clearAddressForm()
              } else {
                this.$Message.error(res.data.message)
              }
            })
          }
        }
      })
    },
    handleSubmit (form) {
      this.$refs[form].validate((valid) => {
        if (valid) {
          if (this.tags.length > 0) {
            this.formItem.tag = this.tags.join(',')
          } else {
            this.formItem.tag = ''
          }
          if (!hasValue(this.formItem.id)) {
            insert(this.vendorModule, this.formItem).then(res => {
              if (res.data.success) {
                this.$Message.success(this.$t('success'))
                this.handleAssignment(res.data.result.data.data)
              } else {
                this.$Message.error(res.data.message)
              }
            })
          } else {
            update(this.vendorModule, this.formItem).then(res => {
              if (res.data.success) {
                this.$Message.success(this.$t('success'))
              } else {
                this.$Message.error(res.data.message)
              }
            })
          }
        } else {
          this.$Message.error(this.$t('fail'))
        }
      })
    },
    handleConfirmDelete (module, id) {
      this.$Modal.confirm({
        title: this.$t('delete'),
        content: this.$t('areYouSureWantToDeleteIt'),
        loading: true,
        onOk: () => {
          if (module === this.personModule) {
            this.handlePersonDel(id)
          } else if (module === this.addressModule) {
            this.handleAddressDel(id)
          }
        }
      })
    },
    handlePersonDel (id) {
      let form = {}
      form.id = id
      del(this.personModule, form).then(res => {
        if (res.data.success) {
          this.$Message.success(this.$t('success'))
          this.getVendorPersonData(this.formItem.id)
          this.$Modal.remove()
        } else {
          this.$Message.error(res.data.message)
          this.$Modal.remove()
        }
      })
    },
    handleAddressDel (id) {
      let form = {}
      form.id = id
      del(this.addressModule, form).then(res => {
        if (res.data.success) {
          this.$Message.success(this.$t('success'))
          this.getVendorAddressData(this.formItem.id)
          this.$Modal.remove()
        } else {
          this.$Message.error(res.data.message)
          this.$Modal.remove()
        }
      })
    }
  }
}
</script>

<style scoped>
  .operationButtonPosition {
    position: relative;
    top: 5px;
  }
</style>
