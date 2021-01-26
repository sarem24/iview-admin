<template>
  <div>
    <div style="margin: 10px;overflow: hidden">
      <div style="float: right;">
        <Page :total="totalProject" :current="page" show-elevator show-total @on-change="changePage" :page-size="size"></Page>
      </div>
    </div>
    <Table :loading="innerLoadingProject" stripe border :columns="columnsProject" :data="dataProject" ref="table" ></Table>
    <div style="margin: 10px;overflow: hidden">
      <div style="float: right;">
        <Page :total="totalProject" :current="page" show-elevator show-total @on-change="changePage" :page-size="size"></Page>
      </div>
    </div>
    <Modal
      :title="$t('project')+$t('detail')"
      v-model="isShowConfig"
      :mask-closable="false"
      width="99%"
      :footer-hide="true">
      <Collapse v-model="valueColl">
        <Panel name="5">
          {{$t('project') + $t('information')}}
          <p slot="content">
          <Form :model="formItem" ref="formConfig" :rules="ruleInline"  :label-width="85">
            <Row>
              <Col span="12">
                <FormItem :label="$t('project_name')" prop="name">
                  <Input :readonly="viewCashier || (viewBoss && !isMyself)" v-model="formItem.name"/>
                </FormItem>
                <FormItem :label="$t('phone')" prop="phone">
                  <Input v-model="formItem.phone" readonly/>
                </FormItem>
                <FormItem :label="$t('customer')" prop="customer">
                  <Select :disabled="viewCashier || (viewBoss && !isMyself)" v-model="formItem.customerId" @on-change="selectCustomer" filterable>
                    <Option v-for="item in customerList" :value="item.id" :key="item.id">{{ item.name }}</Option>
                  </Select>
                </FormItem>
                <FormItem :label="$t('cycle')" prop="cycle">
                  <DatePicker :readonly="viewCashier || (viewBoss && !isMyself)" style="width: 100%" v-model="formItem.cycle" @on-change="handleChangeCycle" type="daterange" confirm :clearable="false" :editable="false" show-week-numbers :placeholder="$t('input_fill.cycle')"></DatePicker>
                </FormItem>
              </Col>
              <Col span="12">
                <FormItem :label="$t('yHContact')"  >
                  <Input v-model="formItem.employeeName" readonly/>
                  <!--                <Select v-model="formItem.employeeId" prop="employeeId" @on-change="selectEmployee" readonly>-->
                  <!--                  <Option v-for="item in employeeList" :value="item.id" :key="item.id">{{ item.name }}</Option>-->
                  <!--                </Select>-->
                </FormItem>
                <FormItem :label="$t('email')">
                  <Input v-model="formItem.email" readonly/>
                </FormItem>
                <FormItem :label="$t('address')" >
                  <Input :readonly="viewCashier || (viewBoss && !isMyself)" v-model="formItem.address" />
                </FormItem>
                <FormItem v-if="viewCashier">
                  <Checkbox v-model="saleInvoice">{{$t('invoiceOut')}}</Checkbox>
                  <Checkbox v-model="collection">{{$t('moneyIn')}}</Checkbox>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="24">
                <FormItem :label="$t('remark')" prop="remark" >
                  <Input :readonly="viewCashier || (viewBoss && !isMyself)" type="textarea" :autosize="{minRows: 3,maxRows: 10}" v-model="formItem.remark"/>
                </FormItem>
              </Col>
            </Row>
            <Row v-if="viewWithdraw">
              <Col span="24">
                <FormItem :label="$t('project_status.withdraw')" prop="withdraw">
                  <Input type="textarea" :autosize="{minRows: 2,maxRows: 5}" :readonly="readonlyWithdraw" v-model="formItem.withdraw"/>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <FormItem>
                <!-- 管理员可对自己提交的项目进行保存 -->
                <Button v-if="!viewBoss || isMyself" :disabled="moduleType && viewSeller" type="primary" @click="handleSave('formConfig')" style="margin-right: 25px;">{{$t('save')}}</Button>
                <span v-if="!moduleType">
                  <Button v-if="viewSeller" type="primary" @click="handleSubmit('formConfig')" style="margin-right: 25px;">{{$t('submit')}}</Button>

                  <Button v-if="viewBoss && !isMyself" type="primary" @click="handleWithdraw('formConfig')"  style="margin-right: 25px;">{{$t('project_status.withdraw')}}</Button>
                  <Button v-if="viewBoss" type="primary" @click="handlePass('formConfig')"  style="margin-right: 25px;">{{$t('project_status.pass')}}</Button>
                </span>
                <Button type="primary" @click="handleExport()">{{$t('export')}}</Button>
              </FormItem>
            </Row>
          </Form>
          </p>
        </Panel>
        <Panel name="4">
          项目统计
          <p slot="content">
          <Table  border :columns="totalProjectColumns" :data="totalProjectList" ref="table" ></Table>
          </p>
        </Panel>
        <Panel name="2">
          销售清单
          <div slot="content">
            <Button v-if="!moduleType" :disabled="!viewSeller && (viewBoss && !isMyself)" size="large" shape="circle" icon="md-add" @click="handleShowPortionInsert()">{{$t('insert')}}{{$t('portion_name')}}</Button>
            <Row v-for="(p,index) in portionList" :key="p.id">
              <Divider orientation="left">{{p.name}}</Divider>
              <Button v-if="!moduleType" :disabled="!viewSeller && (viewBoss && !isMyself)" size="large" shape="circle" icon="md-clipboard" @click="handleShowPortionUpdate(p)" style="margin-bottom: 5px;margin-left: 10px;">{{$t('edit')}}{{$t('portion_name')}}</Button>
              <Button v-if="!moduleType" :disabled="!viewSeller && (viewBoss && !isMyself)" type="primary" icon="md-add" @click="handleShowDetail(p)" style="margin-bottom: 5px;margin-left: 10px;">{{$t('insert')}}{{$t('detail')}}</Button>
              <Button :disabled="!viewCashier" type="info" icon="md-code-download" @click="handleSaveStatus(p, index)" style="margin-bottom: 5px;margin-left: 10px;">{{$t('save')}}{{$t('status')}}</Button>
              <Table border max-height="800" :columns="detailColumns" :data="detailData[index]" ref="table" ></Table>
            </Row>
          </div>
        </Panel>
        <!--<Panel name="4">-->
        <!--项目运作成本-->
        <!--<p slot="content">-->
        <!--<Button size="large" shape="circle" icon="md-add" @click="isShowForm = true">新增运营成本明细</Button>-->
        <!--&lt;!&ndash;<Table :loading="loading" border :columns="runColumns" :data="runData" ref="table" ></Table>&ndash;&gt;-->
        <!--</p>-->
        <!--</Panel>-->
      </Collapse>
    </Modal>
    <Modal
      :title="detailTitle"
      v-model="isShowDetail"
      :mask-closable="false"
      width="90%"
      @on-cancel="handleCloseDetail()"
      :footer-hide="true">
      <Form :model="formDetail" ref="formDetail" :rules="ruleInline" :label-width="70">
        <Row>
          <Col span="12">
            <Divider>{{$t('sell')}}</Divider>
            <FormItem style="margin-bottom: 58px;">

            </FormItem>
            <FormItem :label="$t('product')" prop="product">
              <Input v-model="formDetail.product" @input="copyProduct"/>
            </FormItem>
            <FormItem :label="$t('model')" prop="model">
              <Input v-model="formDetail.model" @input="copyModel"/>
            </FormItem>
            <FormItem :label="$t('number')" prop="number">
              <Input v-model="formDetail.number" number @input="copyNumber"/>
            </FormItem>
            <FormItem :label="$t('price')" prop="price" >
              <Input v-model="formDetail.price" number/>
            </FormItem>
            <FormItem :label="$t('tax_rate')" >
              <Input :value="formPortion.taxRate" readonly/>
            </FormItem>
            <FormItem :label="$t('remark')" prop="remark">
              <Input type="textarea" :autosize="{minRows: 2,maxRows: 5}" v-model="formDetail.remark"/>
            </FormItem>
          </Col>
          <Col span="12">
            <Divider>{{$t('purchase')}}</Divider>
            <FormItem :label="$t('vendor')" prop="vendorId">
              <Select v-model="formDetail.vendorId" filterable>
                <Option v-for="item in vendorList" :value="item.id" :key="item.id">{{item.score}}&nbsp;|&nbsp;{{ item.name }}</Option>
              </Select>
            </FormItem>
            <FormItem :label="$t('product')" prop="product2" >
              <Input v-model="formDetail.product2"/>
            </FormItem>
            <FormItem :label="$t('model')" prop="model2" >
              <Input v-model="formDetail.model2"/>
            </FormItem>
            <FormItem :label="$t('number')" prop="number2" >
              <Input v-model="formDetail.number2" number/>
            </FormItem>
            <FormItem :label="$t('price')" prop="price2" >
              <Input v-model="formDetail.price2" number/>
            </FormItem>
            <FormItem :label="$t('tax_rate')" prop="taxRate" >
              <Input v-model="formDetail.taxRate" :value="formDetail.taxRate" number/>
            </FormItem>
            <FormItem :label="$t('remark')" prop="remark2">
              <Input type="textarea" :autosize="{minRows: 2,maxRows: 5}" v-model="formDetail.remark2"/>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="24" offset="18">
            <Button type="primary" @click="getVendor" style="margin-right: 50px;">{{$t('refresh')}}{{$t('vendor')}}</Button>
            <Button v-if="isDetailSaveShow" style="margin-right: 5px;" type="primary" @click="handleSubmitDetail('formDetail',false)">{{$t('save')}}</Button>
            <Button type="primary" @click="handleSubmitDetail('formDetail', true)">{{$t('save')}}{{$t('close')}}</Button>
          </Col>
        </Row>
      </Form>
    </Modal>
    <Modal
      :title="$t('insert')"
      v-model="isShowForm"
      :mask-closable="false"
      width="1024"
      :footer-hide="true">
      <Form :model="formItem" ref="formProject" :rules="ruleInline"  :label-width="85">
        <Row>
          <Col span="12">
            <FormItem :label="$t('project_name')" prop="name">
              <Input v-model="formItem.name"/>
            </FormItem>
            <!--            <FormItem :label="$t('phone')" prop="phone" >-->
            <!--              <Input v-model="formItem.phone" readonly/>-->
            <!--            </FormItem>-->
            <FormItem :label="$t('customer')" prop="customerId">
              <Select v-model="formItem.customerId" prop="customerId" @on-change="selectCustomer" filterable>
                <Option v-for="item in customerList" :value="item.id" :key="item.id">{{ item.name }}</Option>
              </Select>
            </FormItem>
          </Col>
          <Col span="12">
            <!--            <FormItem :label="$t('yHContact')" prop="employeeId" >-->
            <!--              &lt;!&ndash;<Input v-model="formItem.contact" style="width:400px;"/>&ndash;&gt;-->
            <!--              <Select v-model="formItem.employeeId" prop="employeeId" @on-change="selectEmployee" filterable>-->
            <!--                <Option v-for="item in employeeList" :value="item.id" :key="item.id">{{ item.name }}</Option>-->
            <!--              </Select>-->
            <!--            </FormItem>-->
            <!--            <FormItem :label="$t('email')" prop="email">-->
            <!--              <Input v-model="formItem.email" readonly/>-->
            <!--            </FormItem>-->
            <FormItem :label="$t('cycle')" prop="cycle">
              <DatePicker v-model="formItem.cycle" :clearable="false" style="width:100%;" type="daterange" :editable="false" @on-change="handleChangeCycle"  show-week-numbers :placeholder="$t('input_fill.cycle')"  split-panels></DatePicker>
            </FormItem>
            <FormItem :label="$t('address')" prop="address">
              <Input v-model="formItem.address"/>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="24">
            <FormItem :label="$t('remark')" prop="remark" >
              <Input type="textarea" :autosize="{minRows: 2,maxRows: 5}" v-model="formItem.remark" style="width:880px;"/>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <FormItem>
            <Button type="primary" :disabled="repeatButton" @click="handleSave('formProject')">{{$t('save')}}</Button>
          </FormItem>
        </Row>
      </Form>
    </Modal>
    <Modal
      :title="titlePortion"
      v-model="isShowPortion"
      :mask-closable="false"
      width="50%"
      @on-cancel="handleClosePortion()"
      :footer-hide="true">
      <Form :model="formPortion" ref="formPortion" :rules="ruleInline" :label-width="70">
        <FormItem :label="$t('portion_name')" prop="name" >
          <Input v-model="formPortion.name" />
        </FormItem>
        <FormItem :label="$t('tax_rate')" prop="taxRate">
          <Input v-model="formPortion.taxRate" number/>
        </FormItem>
        <FormItem :label="$t('preferentialPrice')" prop="preferentialPrice">
          <Input v-model="formPortion.preferentialPrice" number/>
        </FormItem>
        <!--<FormItem :label="$t('remark')" prop="remark" >-->
        <!--<Input type="textarea" :autosize="{minRows: 2,maxRows: 5}" v-model="formItem.remark" style="width:880px;"/>-->
        <!--</FormItem>-->
        <FormItem>
          <Button type="primary" @click="handleSubmitPortion('formPortion')">{{$t('submit')}}</Button>
        </FormItem>
      </Form>
    </Modal>
    <Modal
      title="备注信息"
      v-model="isShowProjectRemarkForm"
      :mask-closable="false"
      width="1024"
      :footer-hide="true">
      <Form :model="formRemark" ref="formRemark" :rules="ruleInline"  :label-width="70">
        <FormItem :label="$t('remark')" prop="content">
          <Input v-model="formRemark.content"/>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handelSubmitProjectRemark('formRemark')">{{$t('submit')}}</Button>
        </FormItem>
      </Form>
    </Modal>
    <Modal
      title="采购凭证"
      v-model="isShowProjectDetailUpload"
      width="90%"
      :mask-closable="false"
      @on-cancel="handleFileModal"
      :footer-hide="true">
      <div style="position: relative;">
        <Upload
          name="projectFile"
          accept="application/pdf"
          :format="['pdf', 'PDF']"
          :headers=token
          :on-format-error="handleFormatError"
          :data=uploadData
          :on-success="handleDetailUploadSuccess"
          :before-upload="handleBeforeUpload"
          :action=uploadProjectDetailUrl>
          <div>
            <Button v-if="viewCashier" icon="ios-cloud-upload-outline">{{$t('clickHereToUploadFiles')}}</Button>
          </div>
        </Upload>
        <Button class="fileAddBtn" type="info" icon="md-add" @click="handleShowDetailRemark" ghost>{{$t('promptRecord')}}</Button>
        <Button v-if="viewCashier" class="deleteBtn" type="error" icon="ios-trash" ghost @click="handleIsDelFile('detail')">{{$t('delete')}}</Button>
        <div style=" display: flex;align-items: flex-start;">
          <Timeline style="width: 300px;display: inline-block;margin-right: 5px;">
            <TimelineItem v-for="(item, index) of remarkList" :key="index">
              <p class="fileTime">{{item.createTime}} - {{item.employee.name}}</p>
              <p class="fileContent">{{item.content}}</p>
            </TimelineItem>
          </Timeline>
          <ul class="pdf-list">
            <li v-for="(item, index) of projectDetailFiles" :key="index" v-if="item.type == 'pdf'">
              <Checkbox class="cbxDel" v-model="delDetailFiles['del_'+item.id + '||' + item.code]">{{$t('delete')}}</Checkbox>
              <span @click="showPDF(item)"><pdf :src="item.url" ></pdf></span>
            </li>
          </ul>
        </div>
      </div>
    </Modal>
    <Modal
      title="显示PDF"
      v-model="isShowPdf"
      :mask-closable="false"
      fullscreen
      :footer-hide="true">
      <iframe :src="showPdfUrl" height="100%" width="100%"></iframe>
    </Modal>
    <Modal
      :title="$t('sell')+$t('voucher')"
      v-model="isShowProjectUpload"
      width="90%"
      :mask-closable="false"
      @on-cancel="handleFileModal"
      :footer-hide="true">
      <div style="position: relative;">
        <Upload
          name="projectFile"
          accept="application/pdf"
          :format="['pdf', 'PDF']"
          :headers=token
          :on-format-error="handleFormatError"
          :data=uploadData
          :on-success="handleUploadSuccess"
          :before-upload="handleBeforeUpload"
          handleBeforeUpload
          :action=uploadProjectUrl>
          <div>
            <Button v-if="viewCashier" icon="ios-cloud-upload-outline">{{$t('clickHereToUploadFiles')}}</Button>
          </div>
        </Upload>
        <Button class="fileAddBtn" type="info" icon="md-add" @click="handleShowProjectRemark" ghost>{{$t('promptRecord')}}</Button>
        <Button v-if="viewCashier" class="deleteBtn" type="error" icon="ios-trash" ghost @click="handleIsDelFile('project')">{{$t('delete')}}</Button>
        <div style=" display: flex;align-items: flex-start;">
          <Timeline style="width: 300px;display: inline-block;margin-right: 5px;">
            <TimelineItem v-for="(item, index) of remarkList" :key="index">
              <p class="fileTime">{{item.createTime}} - {{item.employee.name}}</p>
              <p class="fileContent">{{item.content}}</p>
            </TimelineItem>
          </Timeline>
          <ul class="pdf-list" style="display: inline-block;width:80%;">
            <li v-for="(item, index) of projectFiles" :key="index" v-if="item.type == 'pdf'">
              <Checkbox class="cbxDel" v-model="delFiles['del_'+item.id + '||' + item.code]">{{$t('delete')}}</Checkbox>
              <span @click="showPDF(item)"><pdf :src="item.url" ></pdf></span>
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  insert,
  getData,
  getDataRestful,
  getDataByPrimaryKey,
  getProjectFileById,
  delProjectFileById,
  update,
  del,
  updateUrl
} from '@/api/data'
import {
  hasValue,
  hasOneOf
} from '@/libs/tools'
import {
  getToken
} from '@/libs/util'
import newGif from '@/assets/images/new.gif'
import hotGif from '@/assets/images/hot.gif'
import axios from '@/libs/api.request'
import 'viewerjs/dist/viewer.css'
import _ from 'lodash'
import pdf from 'vue-pdf'
import moment from 'moment'
import calc from 'calculatorjs'

export default {
  name: 'project-list',
  components: {
    pdf
  },
  props: {
    type: String,
    isSearch: Boolean,
    customerList: Array,
    totalProject: 0,
    dataProject: Array,
    loadingProject: false
  },
  data () {
    return {
      moduleName: 'project',
      moduleDetailName: 'project_detail',
      moduleType: false,
      remarkByProject: 'project',
      remarkByDetail: 'detail',
      repeatButton: false,
      newGif,
      hotGif,
      page: 1,
      valueColl: ['2', '3', '4', '5'],
      showPdfUrl: '',
      size: this.$pageSize,
      // 新增项目
      isShowForm: false,
      // 项目明细
      isShowConfig: false,
      // 项目部分
      isShowPortion: false,
      // 项目明细
      isShowDetail: false,
      // 显示PDF
      isShowPdf: false,
      // 项目凭证上传
      isShowProjectUpload: false,
      // 项目明细凭证上传
      isShowProjectDetailUpload: false,
      // 项目凭证备注
      isShowProjectRemarkForm: false,
      // 项目保存按钮显示
      isDetailSaveShow: false,
      // 用户明细按保存后再关闭不刷新页面的标识符
      isNewDetailSave: false,
      detailTitle: '',
      complete: '#FF0000',
      partlyComplete: '#F9F900',
      notStarted: '#00EC00',
      titlePortion: '',
      employeeList: [],
      vendorList: [],
      totalProjectList: [],
      portionList: [],
      detailData: [],
      remarkList: [],
      delFiles: [],
      delDetailFiles: [],
      projectFile: null,
      projectFiles: [],
      projectDetailFiles: [],
      filesById: [],
      filesByCode: [],
      detailInvoiceList: {},
      detailPaymentList: {},
      detailPrepaymentList: {},
      uploadData: {
        id: ''
      },
      formItem: {
        id: '',
        code: '',
        name: '',
        customerId: '',
        contact: '',
        employeeId: '',
        phone: '',
        address: '',
        startTime: '',
        cycle: [],
        endTime: '',
        remark: '',
        withdraw: ''
      },
      formPortion: {
        id: '',
        name: '',
        projectId: '',
        taxRate: 0,
        preferentialPrice: null
      },
      formDetail: {
        id: '',
        portionId: '',
        product: '',
        model: '',
        number: '',
        price: '',
        remark: '',
        product2: '',
        model2: '',
        number2: '',
        price2: '',
        taxRate: 0,
        vendorId: '',
        remark2: ''
      },
      formRemark: {
        id: '',
        fkId: '',
        type: '',
        content: ''
      },
      columnsProject: [
        {
          type: 'index',
          title: this.$t('index'),
          width: 60,
          align: 'center'
        },
        {
          title: this.$t('code'),
          align: 'center',
          key: 'code',
          width: 150,
          render: (h, params) => {
            let display = ''
            if (params.row.flag === 1) {
              display = h('div', [
                h('img', {
                  attrs: {
                    src: this.newGif
                  }
                }),
                h('span', ' ' + params.row.code)
              ])
            } else if (params.row.flag === 2) {
              display = h('div', [
                h('img', {
                  attrs: {
                    src: this.hotGif
                  }
                }),
                h('span', params.row.code)
              ])
            } else {
              display = h('span', params.row.code)
            }
            return display
          }
        },
        {
          title: this.$t('status'),
          width: 90,
          key: 'status',
          render: (h, params) => {
            return this.assignmentColumnColor(h, params)
          }
        },
        {
          title: this.$t('project_name'),
          align: 'left',
          minWidth: 160,
          key: 'name'
        },
        {
          title: this.$t('customer'),
          width: 150,
          key: 'customerName'
        },
        {
          title: this.$t('yHContact'),
          width: 90,
          key: 'employeeName'
        },
        {
          title: this.$t('projectTotalIncludingTax'),
          width: 125,
          align: 'right',
          key: 'totalPreTaxSubtotal'
        },
        {
          title: this.$t('NetProfitMarginOnSales'),
          width: 125,
          align: 'right',
          key: 'totalPreTaxProfit',
          render: (h, params) => {
            return h('div', params.row.totalPreTaxProfit + '%')
          }
        },
        {
          title: this.$t('startTime'),
          key: 'startTime',
          width: 110,
          render: (h, params) => {
            let row = params.row
            return h('div', moment(row.startTime).format('YYYY-MM-DD'))
          }
        },
        // {
        //   title: this.$t('active'),
        //   key: 'active',
        //   width: 105,
        //   render: (h, params) => {
        //     let row = params.row
        //     let color = row.active === true ? 'success' : 'error'
        //     let text = row.active === true ? this.$t('yes') : this.$t('no')
        //     return h('Tag', {
        //       props: {
        //         type: 'dot',
        //         color: color
        //       }
        //     }, text)
        //   }
        // },
        {
          title: this.$t('action'),
          key: 'action',
          width: 80,
          align: 'center',
          fixed: 'right',
          render: (h, params) => {
            let buttons = [
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                style: {
                  marginTop: '3px'
                },
                on: {
                  click: () => {
                    this.handleShowConfig(params.index)
                  }
                }
              }, this.$t('detail')),
              h('Badge', {
                props: {
                  count: params.row.fileCount
                }
              }, [
                h('Button', {
                  props: {
                    size: 'small'
                  },
                  style: {
                    marginTop: '3px'
                  },
                  on: {
                    click: () => {
                      this.handleUploadFile(params)
                    }
                  } }, this.$t('voucher1'))
              ])
              // h('Button', {
              //   props: {
              //     type: 'error',
              //     size: 'small'
              //   },
              //   on: {
              //     click: () => {
              //       this.remove(params.index)
              //     }
              //   }
              // }, this.$t('delete'))
            ]
            if (!this.moduleType) {
              // buttons.splice(1, 1)
            }
            return h('div', buttons)
          }
        }
      ],
      totalProjectColumns: [
        {
          type: 'index',
          width: 60,
          align: 'center',
          title: this.$t('index')
        },
        {
          title: this.$t('type'),
          align: 'center',
          key: 'type'
        },
        {
          title: this.$t('total'),
          align: 'right',
          key: 'total'
        }
      ],
      detailColumns: [
        {
          title: this.$t('index'),
          type: 'index',
          width: 60,
          align: 'center',
          className: 'table-data-sell-show'
        },
        {
          title: this.$t('product'),
          key: 'product',
          tooltip: true,
          width: 100,
          className: 'table-data-sell-show'
        },
        {
          title: this.$t('model'),
          key: 'model',
          tooltip: true,
          width: 150,
          className: 'table-data-sell-show'
        },
        {
          title: this.$t('number'),
          width: 70,
          align: 'right',
          key: 'number',
          className: 'table-data-sell-show'
        },
        {
          title: this.$t('price'),
          width: 105,
          align: 'right',
          key: 'price',
          className: 'table-data-sell-show'
        },
        {
          title: this.$t('subtotal'),
          width: 115,
          align: 'right',
          key: 'subtotal',
          className: 'table-data-sell-show'
        },
        {
          title: this.$t('tax'),
          width: 105,
          align: 'right',
          key: 'saleTax',
          className: 'table-data-sell-show'
        },
        {
          title: this.$t('preTaxSubtotal'),
          width: 110,
          align: 'right',
          key: 'preTaxSubtotal',
          className: 'table-data-sell-show'
        },
        {
          title: this.$t('remark'),
          key: 'remark',
          tooltip: true,
          minWidth: 50,
          className: 'table-data-sell-show'
        },
        {
          title: this.$t('vendor'),
          ellipsis: true,
          key: 'vendorId',
          width: 100,
          className: 'table-data-purchase-show',
          render: (h, params) => {
            let name = null
            this.vendorList.forEach((vendor, i) => {
              if (vendor.id === params.row.vendorId) {
                name = vendor.name
                return false
              }
            })
            return h('Tooltip', {
              props: {
                placement: 'top'
              }
            }, [
              name,
              h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } }, name)
            ])
          }
        },
        {
          title: this.$t('number'),
          width: 70,
          align: 'right',
          key: 'number2',
          className: 'table-data-purchase-show'
        },
        {
          title: this.$t('price'),
          width: 90,
          align: 'right',
          key: 'price2',
          className: 'table-data-purchase-show'
        },
        {
          title: this.$t('costSubtotal'),
          width: 115,
          align: 'right',
          key: 'costSubtotal',
          className: 'table-data-costSubtotal-show'
        },
        {
          title: this.$t('tax_rate'),
          width: 65,
          align: 'right',
          key: 'taxRate',
          className: 'table-data-purchase-show'
        },
        {
          title: this.$t('tax'),
          width: 110,
          align: 'right',
          key: 'costTax',
          className: 'table-data-purchase-show'
        },
        {
          title: this.$t('costTaxSubtotal'),
          width: 125,
          align: 'right',
          key: 'costTaxSubtotal',
          className: 'table-data-purchase-show'
        },
        {
          title: this.$t('profit'),
          width: 110,
          align: 'right',
          key: 'profit',
          fixed: 'right',
          className: 'table-data-profit-show'
        },
        {
          title: this.$t('status'),
          width: 123,
          key: 'status',
          fixed: 'right',
          className: 'table-data-operation-show',
          render: (h, params) => {
            let row = params.row
            // 以下操作是为创建二维数组的初始化，否则会报错
            if (!hasValue(this.detailInvoiceList[row.portionId])) {
              this.detailInvoiceList[row.portionId] = {}
              if (!hasValue(this.detailInvoiceList[row.portionId][row.id])) {
                this.detailInvoiceList[row.portionId][row.id] = {}
                this.detailInvoiceList[row.portionId][row.id] = row.invoice
              }
            } else {
              if (!hasValue(this.detailInvoiceList[row.portionId][row.id])) {
                this.detailInvoiceList[row.portionId][row.id] = {}
                this.detailInvoiceList[row.portionId][row.id] = row.invoice
              }
            }
            if (!hasValue(this.detailPaymentList[row.portionId])) {
              this.detailPaymentList[row.portionId] = {}
              if (!hasValue(this.detailPaymentList[row.portionId][row.id])) {
                this.detailPaymentList[row.portionId][row.id] = {}
                this.detailPaymentList[row.portionId][row.id] = row.payment
              }
            } else {
              if (!hasValue(this.detailPaymentList[row.portionId][row.id])) {
                this.detailPaymentList[row.portionId][row.id] = {}
                this.detailPaymentList[row.portionId][row.id] = row.payment
              }
            }
            if (!hasValue(this.detailPrepaymentList[row.portionId])) {
              this.detailPrepaymentList[row.portionId] = {}
              if (!hasValue(this.detailPrepaymentList[row.portionId][row.id])) {
                this.detailPrepaymentList[row.portionId][row.id] = {}
                this.detailPrepaymentList[row.portionId][row.id] = row.prepayment
              }
            } else {
              if (!hasValue(this.detailPrepaymentList[row.portionId][row.id])) {
                this.detailPrepaymentList[row.portionId][row.id] = {}
                this.detailPrepaymentList[row.portionId][row.id] = row.prepayment
              }
            }
            let invoice = Boolean(row.invoice)
            let payment = Boolean(row.payment)
            let prepayment = Boolean(row.prepayment)
            if (hasValue(params.row.id)) {
              return h('div', [
                h('Checkbox', {
                  props: {
                    value: invoice
                  },
                  on: {
                    'on-change': (value) => {
                      this.handleChangeInvoiceStatus(value, row)
                    }
                  }
                }, this.$t('invoiceTo')),
                h('Checkbox', {
                  props: {
                    value: payment
                  },
                  on: {
                    'on-change': (value) => {
                      this.handleChangePaymentStatus(value, row)
                    }
                  }
                }, this.$t('moneyOut')),
                h('Checkbox', {
                  props: {
                    value: prepayment
                  },
                  on: {
                    'on-change': (value) => {
                      this.handleChangePrepaymentStatus(value, row)
                    }
                  }
                }, this.$t('prepayment'))
              ])
            } else {
              return h('div', params.row.status)
            }
          }
        },
        {
          title: this.$t('action'),
          key: 'action',
          width: 90,
          align: 'center',
          fixed: 'right',
          className: 'table-data-operation-show',
          render: (h, params) => {
            let row = params.row
            if (hasValue(row.id)) {
              let buttons = [
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small',
                    disabled: this.viewCashier || (this.viewBoss && !this.isMyself)
                  },
                  style: {
                    marginTop: '3px'
                  },
                  on: {
                    click: () => {
                      this.handleShowDetailUpdate(params)
                    }
                  }
                }, this.$t('edit')),
                h('Badge', {
                  props: {
                    count: row.fileCount
                  },
                  style: {
                    margin: '9px 0px'
                  }
                }, [
                  h('Button', {
                    props: {
                      size: 'small'
                    },
                    on: {
                      click: () => {
                        this.handleDetailUploadFile(params)
                      }
                    }
                  }, this.$t('voucher2'))
                ]),
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small',
                    disabled: this.viewCashier || (this.viewBoss && !this.isMyself)
                  },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: this.$t('delete'),
                        content: this.$t('areYouSureWantToDeleteIt'),
                        loading: true,
                        onOk: () => {
                          this.handleDelDetail(params)
                        }
                      })
                    }
                  }
                }, this.$t('delete'))
              ]
              if (this.moduleType) {
                buttons = buttons.slice(1, 2)
              }
              return h('div', buttons)
            }
          }
        }
      ],
      ruleInline: {
        name: [{
          required: true,
          message: this.$t('input_fill.name')
        }],
        employeeId: [{
          required: true,
          message: this.$t('input_fill.employeeId')
        }],
        contactWay: [{
          required: true,
          message: this.$t('input_fill.contact_way')
        }],
        address: [{
          required: true,
          message: this.$t('input_fill.address')
        }],
        content: [{
          required: true,
          message: this.$t('input_fill.content')
        }],
        cycle: [{
          required: true,
          message: this.$t('input_fill.cycle'),
          trigger: 'blur',
          pattern: /.+/
        }],
        product: [{
          required: true,
          message: this.$t('input_fill.product')
        }],
        model: [{
          required: true,
          message: this.$t('input_fill.model')
        }],
        number: [{
          required: true,
          type: 'number',
          message: this.$t('input_fill.number')
        }],
        vendorId: [{
          required: true,
          message: this.$t('input_fill.vendor')
        }],
        price: [{
          required: true,
          type: 'number',
          message: this.$t('input_fill.price')
        }],
        product2: [{
          required: true,
          message: this.$t('input_fill.product')
        }],
        model2: [{
          required: true,
          message: this.$t('input_fill.model')
        }],
        number2: [{
          required: true,
          type: 'number',
          message: this.$t('input_fill.number')
        }],
        price2: [{
          required: true,
          type: 'number',
          message: this.$t('input_fill.price')
        }],
        taxRate: [{
          required: true,
          type: 'number',
          message: this.$t('input_fill.taxRate')
        }],
        preferentialPrice: [{
          type: 'number'
        }],
        remark: [],
        remark2: [],
        withdraw: [{
          required: true,
          message: this.$t('input_fill.withdraw')
        }]
      }
    }
  },
  computed: {
    access () {
      return this.$store.state.user.access
    },
    userId () {
      return this.$store.state.user.userId
    },
    isMyself () {
      return this.formItem.employeeId === this.userId
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
    viewWithdraw () {
      if (hasValue(this.formItem.withdraw)) {
        return true
      } else {
        // return this.viewBoss ? true : false
        return this.viewBoss
      }
    },
    readonlyWithdraw () {
      if (hasValue(this.formItem.withdraw)) {
        // return this.viewBoss ? false : true
        return !this.viewBoss
      } else {
        return false
      }
    },
    uploadProjectUrl () {
      return axios.baseUrl + 'project_file' + '/uploadFile'
    },
    uploadProjectDetailUrl: function () {
      return axios.baseUrl + 'project_detail_file' + '/uploadFile'
    },
    token () {
      return { 'Authorization': getToken() }
    },
    saleInvoice: {
      get () {
        return this.formItem.saleInvoice
      },
      set (newValue) {
        if (newValue === 1 || newValue === true) {
          this.formItem.saleInvoice = true
        } else {
          this.formItem.saleInvoice = false
        }
      }
    },
    collection: {
      get () {
        return this.formItem.collection
      },
      set (newValue) {
        if (newValue === 1 || newValue === true) {
          this.formItem.collection = true
        } else {
          this.formItem.collection = false
        }
      }
    },
    innerLoadingProject: {
      get () {
        return this.loadingProject
      },
      set (value) {
        this.$emit('handleLoadingProject', value)
      }
    }
  },
  methods: {
    initFormPortion () {
      this.formPortion = {
        id: '',
        name: '',
        projectId: '',
        taxRate: 0,
        preferentialPrice: null
      }
    },
    initFormDetail () {
      this.formDetail = {
        id: '',
        portionId: '',
        product: '',
        model: '',
        number: '',
        price: '',
        remark: '',
        product2: '',
        model2: '',
        number2: '',
        price2: '',
        taxRate: 0,
        vendorId: '',
        remark2: ''
      }
    },
    displayType () {
      switch (this.type) {
        case 'project':
          this.columnProjectType()
          break
        case 'execute':
          this.moduleType = true
          this.moduleDetailName = 'execute_project_detail'
          this.columnsProject.splice(2, 1, {
            title: this.$t('status'),
            width: 130,
            key: 'status',
            render: (h, params) => {
              return this.assignmentColumnColor(h, params)
            }
          })
          break
        default:
          this.columnProjectType()
      }
    },
    columnProjectType () {
      this.moduleType = false
      this.columnsProject.splice(2, 1, {
        title: this.$t('status'),
        width: 90,
        align: 'center',
        key: 'status',
        render: (h, params) => {
          let color = 'none'
          if (params.row.status === 'withdraw') {
            color = '#b9aa85'
          }
          return h('div', {
            style: {
              background: color
            }
          }, this.$t('project_status.' + params.row.status))
        }
      })
    },
    changePage (pageNumber) {
      this.page = pageNumber
      this.innerLoadingProject = true
      this.selectProject()
    },
    copyProduct () {
      let me = this
      me.formDetail.product2 = me.formDetail.product
    },
    copyModel () {
      let me = this
      me.formDetail.model2 = me.formDetail.model
    },
    copyNumber () {
      let me = this
      me.formDetail.number2 = me.formDetail.number
    },
    selectProject () {
      let params = null
      if (hasValue(this.searchItem)) {
        params = this.searchItem
      }
      this.selectProjectByRecords(params)
    },
    selectProjectByRecords (params) {
      let obj = {}
      if (hasValue(params)) {
        obj = params
        this.searchItem = params
      }
      obj.page = this.page
      obj.size = this.size
      this.$emit('handleGetDataPage', obj)
      // getDataPage(this.moduleName, obj).then(res => {
      //   this.totalProject = res.data.result.total
      //   this.dataProject = res.data.result.data
      //   this.innerLoadingProject = false
      //   this.$emit('handleUpdateSearchButton', false)
      // })
    },
    selectEmployee (value) {
      for (let entity of this.employeeList) {
        if (entity.id === value) {
          this.formItem.phone = entity.mobile
          this.formItem.email = entity.email
          break
        }
      }
    },
    selectPointerByProject () {
      let obj = {}
      obj.projectId = this.formItem.id
      getData('project_portion', obj).then(res => {
        let totals = [0, 0, 0, 0]
        this.portionList = res.data.result.data
        if (this.portionList.length > 0) {
          this.portionList.forEach((portion, i) => {
            this.getDetailByPortionId(i, portion, totals)
          })
        } else {
          this.projectTotalStatistics(totals)
        }
      })
    },
    selectCustomer (value) {
      for (let entity of this.customerList) {
        if (entity.id === value) {
          this.formItem.address = entity.address
          break
        }
      }
    },
    selectProjectRemarkByProject (type) {
      getDataRestful('project_remark', this.uploadData.id + ',' + type).then(res => {
        let tempArrays = []
        let tempItem = ''
        let results = res.data.result.data
        if (results.length > 0) {
          results.forEach(item => {
            tempItem = {}
            tempItem = _.cloneDeep(item)
            tempItem.createTime = moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')
            tempArrays.push(tempItem)
          })
        }
        this.remarkList = tempArrays
      })
    },
    selectProjectFileById () {
      let obj = {}
      obj.projectId = this.uploadData.id
      getProjectFileById('project_file', obj).then(res => {
        this.projectFiles = res.data.result.data
      })
    },
    selectProjectDetailFileById () {
      let obj = {}
      obj.detailId = this.uploadData.id
      getProjectFileById('project_detail_file', obj).then(res => {
        this.projectDetailFiles = res.data.result.data
      })
    },
    assignmentColumnColor (h, params) {
      let row = params.row
      let saleInvoice = this.getStatusLevel(row.saleInvoice)
      let invoice = this.getStatusLevel(row.invoice)
      let collection = this.getStatusLevel(row.collection)
      let payment = this.getStatusLevel(row.payment)
      return h('div', [
        h('div', saleInvoice, this.$t('invoiceOut')),
        h('div', collection, this.$t('moneyIn')),
        h('div', invoice, this.$t('invoiceTo')),
        h('div', payment, this.$t('moneyOut'))
      ])
    },
    getStatusLevel (level) {
      let flag = null
      if (level === 0) {
        flag = this.getStatusClass(this.notStarted)
      } else if (level === 1) {
        flag = this.getStatusClass(this.complete)
      } else if (level === 2) {
        flag = this.getStatusClass(this.partlyComplete)
      }
      return flag
    },
    getStatusClass (color) {
      return {
        class: 'statusShape',
        style: {
          background: color
        }
      }
    },
    getDetailByPortionId (p_index, params, totals) {
      this.detailData = []
      let obj = {}
      obj.portionId = params.id
      getData(this.moduleDetailName, obj).then(res => {
        let resData = res.data.result.data
        // 统计数据容器
        let tempData = []
        // 合计销售税前小计
        let totalPreTaxSubtotal = 0
        // 合计成本税前小计
        let totalCostTaxSubtotal = 0
        // 合计销售税额
        let totalSaleTax = 0
        // 合计成本税额
        let totalCostTax = 0
        // 合计小计
        let totalSubtotal = 0
        // 合计成本小计
        let totalCostSubtotal = 0
        // 合计税前利润
        let totalPreTaxProfit = 0
        resData.forEach((data, i) => {
          // 此处符合现有财务计算方式，先算出单个税费，然后再乘以数量
          // 销售税前小计
          data.preTaxSubtotal = calc.mul(this.amountCalculation(data.price, params.taxRate), data.number)
          // 成本税前小计
          data.costTaxSubtotal = calc.mul(this.amountCalculation(data.price2, data.taxRate), data.number2)
          // 销售单项小计
          data.subtotal = calc.mul(data.price, data.number)
          // 采购单项小计
          data.costSubtotal = calc.mul(data.price2, data.number2)
          // 销售税额
          data.saleTax = calc.sub(data.subtotal, data.preTaxSubtotal)
          // 成本税额
          data.costTax = calc.sub(data.costSubtotal, data.costTaxSubtotal)
          // 税前利润
          data.profit = calc.sub(data.preTaxSubtotal, data.costTaxSubtotal)
          // 样式名
          data.cellClassName = {}
          totalSaleTax = calc.add(totalSaleTax, data.saleTax)
          totalCostTax = calc.add(totalCostTax, data.costTax)
          totalPreTaxSubtotal = calc.add(totalPreTaxSubtotal, data.preTaxSubtotal)
          totalCostTaxSubtotal = calc.add(totalCostTaxSubtotal, data.costTaxSubtotal)
          totalSubtotal = calc.add(totalSubtotal, data.subtotal)
          totalCostSubtotal = calc.add(totalCostSubtotal, data.costSubtotal)
          totalPreTaxProfit = calc.add(totalPreTaxProfit, data.profit)
          // 保存部分下标的索引号
          data.portionIndex = p_index
          tempData.push(data)
        })
        // 优惠价样式
        let preferential = {
          'cellClassName': {
            price: 'table-data-total',
            subtotal: 'table-data-total'
          },
          'price': this.$t('preferentialPrice'),
          'subtotal': params.preferentialPrice
        }
        // 如果有优惠价增加行内容
        if (hasValue(params.preferentialPrice)) {
          // 优惠价的税额替换合计销售税额
          totalSaleTax = this.taxCalculation(params.preferentialPrice, params.taxRate)
          // 优惠价的税前金额替换销售税前小计
          totalPreTaxSubtotal = this.amountCalculation(params.preferentialPrice, params.taxRate)
          // 优惠价替换合计小计
          totalSubtotal = params.preferentialPrice
          // 税前利润替换
          totalPreTaxProfit = calc.sub(totalPreTaxSubtotal, totalCostTaxSubtotal)
          tempData.push(preferential)
        }

        let preTotalObj = {
          'cellClassName': {
            model: 'table-data-total',
            preTaxSubtotal: 'table-data-total',
            costTaxSubtotal: 'table-data-total',
            profit: 'table-data-total',
            status: 'table-data-total'
          },
          'model': this.$t('preTaxTotal'),
          'preTaxSubtotal': totalPreTaxSubtotal,
          'costTaxSubtotal': totalCostTaxSubtotal,
          'profit': totalPreTaxProfit,
          'status': (totalPreTaxSubtotal === 0 ? '-' : calc.mul(calc.div(totalPreTaxProfit, totalPreTaxSubtotal), 100).toFixed(0)) + '%'
        }
        // 合计项目数据
        totals[0] = calc.add(totals[0], totalPreTaxSubtotal)
        totals[1] = calc.add(totals[1], totalSaleTax)
        totals[2] = calc.add(totals[2], totalSubtotal)
        totals[3] = calc.add(totals[3], totalPreTaxProfit)

        let taxPriceObj = {
          'cellClassName': {
            model: 'table-data-total',
            saleTax: 'table-data-total',
            costTax: 'table-data-total'
          },
          'model': this.$t('tax_rate') + '|' + params.taxRate + '%',
          'saleTax': totalSaleTax,
          'costTax': totalCostTax
        }
        tempData.push(preTotalObj)

        let totalObj = {
          'cellClassName': {
            model: 'table-data-total',
            subtotal: 'table-data-total',
            price2: 'table-data-total',
            costSubtotal: 'table-data-total'
          },
          'model': this.$t('afterTaxTotal'),
          'subtotal': totalSubtotal,
          'price2': this.$t('totalCostIncludingTax'),
          'costSubtotal': totalCostSubtotal
        }
        tempData.push(taxPriceObj)
        tempData.push(totalObj)
        // 此处ajax异步访问秩序不一，需要用外层的部分ID作为索引下标
        // this.detailData.push(tempData)
        this.detailData[p_index] = tempData
        this.projectTotalStatistics(totals)
      })
    },
    amountCalculation (price, taxRate) {
      return calc.div(price, calc.add(1, calc.div(taxRate, 100))).toFixed(2)
    },
    taxCalculation (price, taxRate) {
      return calc.sub(price, this.amountCalculation(price, taxRate))
    },
    getEmployee () {
      getData('employee').then(res => {
        this.employeeList = res.data.result.data
        this.$emit('handleLoadEmployee', this.employeeList)
      })
    },
    getVendor () {
      getData('vendor').then(res => {
        this.vendorList = res.data.result.data
      })
    },
    showPDF (item) {
      let host = window.location.host
      let protocol = document.location.protocol
      // window.open(protocol + '//' + host + '/web/viewer.html?file=' + item.url)
      this.isShowPdf = true
      this.showPdfUrl = protocol + '//' + host + '/web/viewer.html?file=' + item.url
    },
    handleFileModal () {
      this.delFiles = []
      this.projectFiles = []
      this.delDetailFiles = []
      this.projectDetailFiles = []
    },
    handleBeforeUpload () {
      this.$Loading.start()
    },
    handleUploadFile (params) {
      this.isShowProjectUpload = true
      this.uploadData.id = params.row.id
      this.selectProjectFileById()
      this.selectProjectRemarkByProject(this.remarkByProject)
    },
    handleShowDetailUpdate (params) {
      let obj = {}
      obj.id = params.row.id
      getDataByPrimaryKey(this.moduleDetailName, obj).then(res => {
        this.formDetail = res.data.result.data
      })
      this.isShowDetail = true
      this.isDetailSaveShow = false
      this.formPortion.taxRate = this.portionList[params.row.portionIndex].taxRate
      this.detailTitle = this.$t('edit') + this.$t('project') + this.$t('detail') + ' [' + this.portionList[params.row.portionIndex].name + ']'
    },
    handleDetailUploadFile (params) {
      this.isShowProjectDetailUpload = true
      this.uploadData.id = params.row.id
      this.selectProjectDetailFileById()
      this.selectProjectRemarkByProject(this.remarkByDetail)
    },
    handleChangeInvoiceStatus (value, row) {
      this.detailInvoiceList[row.portionId][row.id] = value * 1
    },
    handleChangePaymentStatus (value, row) {
      this.detailPaymentList[row.portionId][row.id] = value * 1
    },
    handleChangePrepaymentStatus (value, row) {
      this.detailPrepaymentList[row.portionId][row.id] = value * 1
    },
    handleShowPortionInsert () {
      this.initFormPortion()
      this.isShowPortion = true
      this.titlePortion = this.$t('insert') + this.$t('project') + this.$t('portion_name')
    },
    handleShowProjectInsert () {
      this.isShowForm = true
      this.$refs['formProject'].resetFields()
      this.formItem.id = ''
      this.formItem.cycle = []
    },
    handleSave (form) {
      this.repeatButton = true
      this.formItem.status = 'update'
      this.executeFormProject(form)
    },
    handleSubmit (form) {
      this.formItem.status = 'review'
      this.executeFormProject(form)
    },
    handleWithdraw (form) {
      this.formItem.status = 'withdraw'
      this.ruleInline = this.tempRuleInline
      setTimeout(() => {
        this.executeFormProject(form)
      })
    },
    handlePass (form) {
      this.formItem.status = 'pass'
      this.executeFormProject(form)
    },
    executeFormProject (form, rule) {
      this.$refs[form].validate((valid) => {
        if (valid) {
          let url = this.moduleName
          if (this.moduleType) {
            url = 'execute_project'
          }
          if (!hasValue(this.formItem.id)) {
            insert(url, this.formItem).then(res => {
              if (res.data.success) {
                this.$Message.success(this.$t('success'))
                this.$refs[form].resetFields()
                this.isShowForm = false
                this.selectProject()
                if (hasValue(this.tempRuleInline)) {
                  this.ruleInline = this.tempRuleInline
                }
                this.repeatButton = false
              } else {
                this.$Message.error(res.data.result.message)
              }
            })
          } else {
            update(url, this.formItem).then(res => {
              if (res.data.success) {
                this.$Message.success(this.$t('success'))
                this.$refs[form].resetFields()
                this.isShowConfig = false
                this.selectProject()
                this.ruleInline = this.tempRuleInline
                this.repeatButton = false
              } else {
                this.$Message.error(res.data.result.message)
              }
            })
          }
        }
      })
    },
    handleSubmitPortion (form) {
      this.$refs[form].validate((valid) => {
        if (valid) {
          if (hasValue(this.formPortion.preferentialPrice)) {
            this.$Modal.confirm({
              title: this.$t('remind'),
              content: this.$t('pleaseNoteThatTheDiscountAmountCannotBeGreaterThanTheTotalPrice'),
              onOk: () => {
                if (!hasValue(this.formPortion.id)) {
                  this.formPortion.projectId = this.formItem.id
                  insert('project_portion', this.formPortion).then(res => {
                    if (res.data.success) {
                      this.$Message.success(this.$t('success'))
                      this.$refs[form].resetFields()
                      this.isShowPortion = false
                      this.initFormPortion()
                      this.selectPointerByProject()
                    } else {
                      this.$Message.error(res.data.message)
                    }
                  })
                } else {
                  update('project_portion', this.formPortion).then(res => {
                    if (res.data.success) {
                      this.$Message.success(this.$t('success'))
                      this.$refs[form].resetFields()
                      this.isShowPortion = false
                      this.initFormPortion()
                      this.selectPointerByProject()
                    } else {
                      this.$Message.error(res.data.message)
                    }
                  })
                }
              }
            })
          } else {
            if (!hasValue(this.formPortion.id)) {
              this.formPortion.projectId = this.formItem.id
              insert('project_portion', this.formPortion).then(res => {
                if (res.data.success) {
                  this.$Message.success(this.$t('success'))
                  this.$refs[form].resetFields()
                  this.isShowPortion = false
                  this.initFormPortion()
                  this.selectPointerByProject()
                } else {
                  this.$Message.error(res.data.message)
                }
              })
            } else {
              update('project_portion', this.formPortion).then(res => {
                if (res.data.success) {
                  this.$Message.success(this.$t('success'))
                  this.$refs[form].resetFields()
                  this.isShowPortion = false
                  this.initFormPortion()
                  this.selectPointerByProject()
                } else {
                  this.$Message.error(res.data.message)
                }
              })
            }
          }
        } else {
          this.$Message.error('Fail!')
        }
      })
    },
    handleSubmitDetail (form, flag) {
      this.$refs[form].validate((valid) => {
        if (valid) {
          this.formDetail.projectId = this.formItem.id
          if (!hasValue(this.formDetail.id)) {
            this.formDetail.portionId = this.formPortion.id
            insert(this.moduleDetailName, this.formDetail).then(res => {
              if (res.data.success) {
                this.isNewDetailSave = true
                this.$Message.success(this.$t('success'))
                this.$refs[form].resetFields()
                if (flag) {
                  this.isNewDetailSave = false
                  this.isShowDetail = false
                  this.selectPointerByProject()
                  this.initFormDetail()
                }
              } else {
                this.$Message.error(res.data.message)
              }
            })
          } else {
            update(this.moduleDetailName, this.formDetail).then(res => {
              if (res.data.success) {
                this.$Message.success(this.$t('success'))
                this.$refs[form].resetFields()
                this.isShowDetail = false
                this.initFormDetail()
                this.selectPointerByProject()
              } else {
                this.$Message.error(res.data.message)
              }
            })
          }
        }
      })
    },
    handleDelDetail (params) {
      let data = {
        projectDetailId: params.row.id,
        projectId: this.formItem.id
      }
      del(this.moduleDetailName, data).then(res => {
        if (res.data.success) {
          this.$Message.success(this.$t('success'))
          this.selectProject()
          this.selectPointerByProject()
          this.$Modal.remove()
        } else {
          this.$Message.error(res.data.message)
          this.$Modal.remove()
        }
      })
    },
    handleDeleteFile () {
      let flag = this.projectDelFlag
      let obj = {}
      if (this.filesById.length !== 0) {
        obj.ids = this.filesById.join(',')
        obj.codes = this.filesByCode.join(',')
        obj.projectId = this.uploadData.id
        if (flag === 'project') {
          delProjectFileById('project_file', obj).then(res => {
            if (res.data.success) {
              this.projectFiles = []
              this.selectProjectFileById()
              this.selectProject()
              this.$Modal.remove()
            } else {
              this.$Message.warning(res.data.message)
            }
          })
        } else if (flag === 'detail') {
          delProjectFileById('project_detail_file', obj).then(res => {
            if (res.data.success) {
              this.projectFiles = []
              this.selectProjectDetailFileById()
              this.$Modal.remove()
            } else {
              this.$Message.warning(res.data.message)
            }
          })
        }
      } else {
        // 再次验证，其实意义不大
        this.$Message.warning(this.$t('message.pleaseSelectTheFileYourWantToDelete'))
      }
    },
    handleShowProjectRemark () {
      this.isShowProjectRemarkForm = true
      this.formRemark.type = this.remarkByProject
    },
    handleShowDetailRemark () {
      this.isShowProjectRemarkForm = true
      this.formRemark.type = this.remarkByDetail
    },
    handleIsDelFile (flag) {
      this.filesById = []
      this.filesByCode = []
      this.projectDelFlag = flag
      let objectSet = null
      if (flag === 'project') {
        objectSet = this.delFiles
      } else {
        objectSet = this.delDetailFiles
      }
      for (let del in objectSet) {
        if (objectSet[del]) {
          // 目前把 id 和 code 作为了JSON的KEY
          this.filesById.push(Number(del.substr(4).split('||')[0]))
          this.filesByCode.push(del.substr(4).split('||')[1])
        }
      }
      if (this.filesById.length === 0) {
        this.$Message.warning(this.$t('message.pleaseSelectTheFileYourWantToDelete'))
      } else {
        this.$Modal.confirm({
          title: this.$t('delete'),
          content: this.$t('areYouSureWantToDeleteIt'),
          loading: true,
          onOk: () => {
            this.handleDeleteFile()
          }
        })
      }
    },
    handleUploadSuccess (response, file, fileList) {
      if (response.success) {
        this.$Loading.finish()
        this.selectProjectFileById()
        this.selectProject()
      } else {
        this.$Loading.error()
        this.$Message.warning(response.message)
      }
    },
    handleDetailUploadSuccess (response, file, fileList) {
      if (response.success) {
        this.$Loading.finish()
        this.selectProjectDetailFileById()
      } else {
        this.$Loading.error()
        this.$Message.warning(response.message)
      }
    },
    handleChangeCycle (value, type) {
      this.formItem.cycle = value
      this.formItem.startTime = value[0]
      this.formItem.endTime = value[1]
    },
    handleExport () {
      let url = this.moduleName
      if (this.moduleType) {
        url = 'execute_project'
      }
      window.open(axios.baseUrl + url + '/exportExcel?id=' + this.formItem.id + '&_id=' + new Date().getTime())
    },
    handleFormatError () {
      this.$Message.warning(this.$t('pdfFileUploadingOnlyIsSupported'))
    },
    // handlePortionCopy () {
    //   this.formDetail.product2 = this.formDetail.product
    //   this.formDetail.model2 = this.formDetail.model
    //   this.formDetail.number2 = this.formDetail.number
    // },
    handleShowConfig (index) {
      this.tempRuleInline = _.cloneDeep(this.ruleInline)
      delete this.ruleInline.withdraw
      let formDate = _.cloneDeep(this.dataProject[index])
      this.formItem = formDate
      this.formItem.cycle = []
      this.formItem.cycle.push(moment(formDate.startTime).format('YYYY-MM-DD'))
      this.formItem.cycle.push(moment(formDate.endTime).format('YYYY-MM-DD'))
      this.saleInvoice = this.formItem.saleInvoice
      this.collection = this.formItem.collection
      this.isShowConfig = true
      this.selectEmployee(formDate.employeeId)
      // this.selectCustomer(this.formItem.customerId)
      this.selectPointerByProject()
      // 判断项目提醒是否存在，有则后端清除标志，页面同步置空标志
      if (hasValue(this.dataProject[index].flag) && this.dataProject[index].flag !== 0) {
        this.handleDelProjectRemind(this.dataProject[index])
      }
    },
    handleDelProjectRemind (params) {
      let data = {
        projectId: params.id
      }
      del('execute_project_remind', data).then(res => {
        if (res.data.success) {
          params.flag = 0
        } else {
          this.$Message.error(res.data.message)
        }
      })
    },
    handleShowPortionUpdate (params) {
      this.isShowPortion = true
      this.titlePortion = this.$t('edit') + this.$t('project') + this.$t('portion_name')
      this.formPortion = _.cloneDeep(params)
    },
    handleShowDetail (params) {
      this.isShowDetail = true
      this.isNewDetailSave = false
      this.$refs['formDetail'].resetFields()
      this.formPortion = _.cloneDeep(params)
      this.initFormDetail()
      this.isDetailSaveShow = true
      this.detailTitle = this.$t('insert') + this.$t('project') + this.$t('detail') + ' [' + this.formPortion.name + ']'
    },
    handleSaveStatus (params, index) {
      let data = {
        invoice: this.detailInvoiceList[params.id],
        payment: this.detailPaymentList[params.id],
        prepayment: this.detailPrepaymentList[params.id],
        projectId: this.formItem.id
      }
      if (hasValue(this.detailInvoiceList[params.id]) && hasValue(this.detailPaymentList[params.id]) && this.detailPrepaymentList[params.id]) {
        let url = '/updateState'
        updateUrl(this.moduleDetailName, data, url).then(res => {
          if (res.data.success) {
            this.$Message.success(this.$t('success'))
            this.selectProject()
          } else {
            this.$Message.error(res.data.message)
          }
        })
      } else {
        this.$Message.error('No data')
      }
    },
    handleClosePortion () {
      this.$refs['formPortion'].resetFields()
      this.initFormPortion()
    },
    handleCloseDetail () {
      if (this.isNewDetailSave) {
        this.selectPointerByProject()
        this.initFormDetail()
      }
      this.handleClosePortion()
    },
    handelSubmitProjectRemark (form, type) {
      this.$refs[form].validate((valid) => {
        if (valid) {
          if (!hasValue(this.formRemark.id)) {
            this.formRemark.fkId = this.uploadData.id
            insert('project_remark', this.formRemark).then(res => {
              if (res.data.success) {
                this.$Message.success(this.$t('success'))
                this.isShowProjectRemarkForm = false
                this.$refs[form].resetFields()
                this.selectProjectRemarkByProject(this.formRemark.type)
              } else {
                this.$Message.error(res.data.message)
              }
            })
          }
        }
      })
    },
    projectTotalStatistics (totals) {
      let tempObj1 = {
        'cellClassName': this.totalStyle(),
        type: this.$t('totalBeforeTheProject'),
        total: this.keepTwoDecimalFull(totals[0])
      }
      let tempObj2 = {
        'cellClassName': this.totalStyle(),
        type: this.$t('projectTax'),
        total: this.keepTwoDecimalFull(totals[1])
      }
      let tempObj3 = {
        'cellClassName': this.totalStyle(),
        type: this.$t('projectTotalIncludingTax'),
        total: this.keepTwoDecimalFull(totals[2])
      }
      let tempObj4 = {
        'cellClassName': this.totalStyle(),
        type: this.$t('project') + this.$t('profit'),
        total: this.keepTwoDecimalFull(totals[3])
      }
      // let tempObj5 = {
      //   type: this.$t('project') + this.$t('bonus'),
      //   total: Number(calc.mul(totals[3], 0.2).toFixed(2))
      // }
      this.totalProjectList = []
      this.totalProjectList.push(tempObj1)
      this.totalProjectList.push(tempObj2)
      this.totalProjectList.push(tempObj3)
      this.totalProjectList.push(tempObj4)
      // this.totalProjectList.push(tempObj5)
    },
    totalStyle () {
      return {
        type: 'table-data-total',
        total: 'table-data-total'
      }
    },
    keepTwoDecimalFull (num) {
      let result = parseFloat(num)
      if (isNaN(result)) {
        alert('传递参数错误，请检查！')
        return false
      }
      result = Math.round(num * 100) / 100
      let s_x = result.toString() // 将数字转换为字符串
      let pos_decimal = s_x.indexOf('.') // 小数点的索引值
      // 当整数时，pos_decimal=-1 自动补0
      if (pos_decimal < 0) {
        pos_decimal = s_x.length
        s_x += '.'
      }
      // 当数字的长度< 小数点索引+2时，补0
      while (s_x.length <= pos_decimal + 2) {
        s_x += '0'
      }
      return s_x
    }
  },
  created () {
    this.selectProject()
    this.getEmployee()
  },
  mounted () {
    this.displayType()
    this.getVendor()
  }
}
</script>

<style>
  .pdf-list{
    list-style:none;
  }
  .pdf-list>li {
    display: inline-block;
    list-style: none;
    padding: 30px 5px 5px;
    border: 3px solid #a7b0b9;
    margin: 2px;
    border-radius: 15px;
    position: relative;
  }
  .pdf-list>li .cbxDel{
    position: absolute;
    top: 2px;
    left: 9px;
  }
  .pdf-list>li>span{
    cursor: pointer
  }
  .fileAddBtn{
    position: absolute;
    top: 0px;
    left: 250px;
  }
  .deleteBtn {
    position: absolute;
    top: 0px;
    left: 150px;
  }
  .statusShape {
    border: 1px #a7b0b9 solid;
    text-align: center;
    margin-right: 2px;
    float: left;
    width: 20px;
    height: 20px;
    font-weight: 600;
    border-radius: 7px;
  }
  .fileTime {
    font-size: 14px;
    font-weight: bold;
  }
  .fileContent {
    padding-left: 5px;
  }
  .ivu-table .table-data-only-show {
    background-color: #f6fffd;
  }
  .ivu-table td.table-data-sell-show{
    border-top:2px solid #4e66ff;
  }
  .ivu-table td.table-data-purchase-show{
    border-top:2px solid #ffdf5c;
  }
  .ivu-table td.table-data-costSubtotal-show{
    border-top:2px solid #ffdf5c;
    background-color: #f8f8f9;
    font-style: italic;
  }
  .ivu-table td.table-data-profit-show{
    border-top:2px solid #FF898C;
  }
  .ivu-table td.table-data-operation-show{
    border-top:2px solid #7FC2FF;
  }
  .ivu-table .table-data-total {
    background-color: #f8f8f9;
    font: 14px/1.5 'Microsoft YaHei',arial,tahoma,\5b8b\4f53,sans-serif;
    color: purple;
  }
  .ivu-table .table-content-right {
    text-align: right;
  }
  .ivu-table .demo-table-info-cell-nei2 {
    background-color: #ff5074;
    color: #fff;
  }
  .api table {
    font-family: Consolas,Menlo,Courier,monospace;
    font-size: 12px;
    border-collapse: collapse;
    border-spacing: 0;
    empty-cells: show;
    border: 1px solid #e9e9e9;
    width: 100%;
    margin-bottom: 24px
  }
  .api table th {
    background: #f7f7f7;
    white-space: nowrap;
    color: #5c6b77;
    font-weight: 600
  }
  .api table td,.api table th {
    border: 1px solid #e9e9e9;
    padding: 8px 16px;
    text-align: left;
  }
</style>
