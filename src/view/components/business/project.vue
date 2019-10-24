<template>
  <div>
    <Form>
      <Row>
        <Col span="6">
          <FormItem>
            <Input v-model="searchItem.name" clearable style="width:250px" :placeholder="$t('search_hint.project')">
              <Icon type="ios-photos" slot="prepend"></Icon>
            </Input>
          </FormItem>
        </Col>
        <Col span="6">
        <FormItem>
          <Select v-model="searchItem.customerId" prop="customerId"  prefix="md-home" :placeholder="$t('search_hint.customer')" clearable filterable>
            <Option v-for="item in customerList" :value="item.id" :key="item.id">{{ item.name }}</Option>
          </Select>
        </FormItem>
        </Col>
        <Col span="6">
        <FormItem label="    ">
          <DatePicker type="date" :editable="false" @on-change="handleChangeStartDate" split-panels :placeholder="$t('search_hint.startDate')" :on-change="searchChange" ></DatePicker>
        </FormItem>
        </Col>
        <Col span="3">
          <FormItem>
            <Button type="info" icon="ios-search" @click="handleProjectFilter">{{$t('search')}}</Button>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="6">
          <FormItem :label="$t('invoiceOut')">
            <Select v-model="searchItem.saleInvoice" clearable  style="width:200px">
              <Option v-for="item in sellStatusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span="6">
        <FormItem :label="$t('moneyIn')">
          <Select v-model="searchItem.collection" clearable  style="width:200px">
            <Option v-for="item in sellStatusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>
        </Col>
        <Col span="6">
        <FormItem :label="$t('invoiceTo')">
          <Select v-model="searchItem.invoice" clearable  style="width:200px">
            <Option v-for="item in purchaseStatusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>
        </Col>
        <Col span="6">
        <FormItem :label="$t('moneyOut')">
          <Select v-model="searchItem.payment" clearable  style="width:200px">
            <Option v-for="item in purchaseStatusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>
        </Col>
      </Row>
    </Form>
    <Button size="large" shape="circle" icon="md-add" @click="handleShowProjectInsert">{{$t('insert')}}</Button>
    <Poptip placement="right" width="600" word-wrap>
      <Button style="margin-left: 25px;" type="primary" icon="ios-book-outline" ghost>{{$t('statusDescription')}}</Button>
      <div class="api" slot="content">
        <table>
          <thead>
          <tr>
            <th>类别</th>
            <th>说明</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>图标</td>
            <td>
              <div class="statusShape" style="background: #00EC00"/>
              <div class="statusShape" style="background: #F9F900"/>
              <div class="statusShape" style="background: #FF0000"/>
              <div style="float:left">依次为【全部完成|部分完成|未开始】</div>
            </td>
          </tr>
          <tr>
            <td>状态位置说明↓</td>
            <td>依次为【销售发票出|销售收款|采购发票到|采购付款】</td>
          </tr>
          </tbody>
        </table>
      </div>
    </Poptip>
    <div style="margin: 10px;overflow: hidden">
      <div style="float: right;">
        <Page :total="totalProject" :current="page" show-elevator show-total @on-change="changePage" :page-size="size"></Page>
      </div>
    </div>
    <Table :loading="loadingProject" stripe border :columns="columnsProject" :data="dataProject" ref="table" ></Table>
    <div style="margin: 10px;overflow: hidden">
      <div style="float: right;">
        <Page :total="totalProject" :current="page" show-elevator show-total @on-change="changePage" :page-size="size"></Page>
      </div>
    </div>
    <Modal
      v-model="isDelFile"
      :title="$t('delete')"
      @on-ok="handleDeleteFile">
      <p>{{$t('areYouSureToDeleteTheseFiles')}}</p>
    </Modal>
    <Modal
      title="项目部分内容"
      v-model="isShowDetail"
      :mask-closable="false"
      width="90%"
      :footer-hide="true">
      <Form :model="formDetail" ref="formDetail" :rules="ruleInline" :label-width="50">
        <Row>
          <Col span="12">
          <Divider>销售</Divider>
          <FormItem :label="$t('product')" prop="product">
            <Input v-model="formDetail.product" @input="copyProduct"/>
          </FormItem>
          <FormItem :label="$t('model')" prop="model">
            <Input v-model="formDetail.model" @input="copyModel"/>
          </FormItem>
          <FormItem :label="$t('number')" prop="number">
            <Input v-model="formDetail.number"/>
          </FormItem>
          <FormItem :label="$t('price')" prop="price">
            <Input v-model="formDetail.price"/>
          </FormItem>
          <FormItem :label="$t('remark')" prop="remark">
            <Input type="textarea" :autosize="{minRows: 2,maxRows: 5}" v-model="formDetail.remark"/>
          </FormItem>
          </Col>
          <Col span="12">
          <Divider>采购</Divider>
          <FormItem :label="$t('product')" prop="product" >
            <Input v-model="formDetail.product2"/>
          </FormItem>
          <FormItem :label="$t('model')" prop="model" >
            <Input v-model="formDetail.model2"/>
          </FormItem>
          <FormItem :label="$t('number')" prop="number" >
            <Input v-model="formDetail.number2"/>
          </FormItem>
          <FormItem :label="$t('price')" prop="price" >
            <Input v-model="formDetail.price2"/>
          </FormItem>
          <FormItem :label="$t('tax_rate')" prop="taxRate" >
            <Input v-model="formDetail.taxRate" :value="formDetail.taxRate"/>
          </FormItem>
          <FormItem :label="$t('remark')" prop="remark">
            <Input type="textarea" :autosize="{minRows: 2,maxRows: 5}" v-model="formDetail.remark2"/>
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <Button type="primary" @click="handleSubmitDetail('formDetail')">{{$t('submit')}}</Button>
          </Col>
        </Row>
      </Form>
    </Modal>
    <Modal
      :title="$t('project')+$t('detail')"
      v-model="isShowConfig"
      :mask-closable="false"
      width="97%"
      :footer-hide="true">
      <Collapse v-model="valueColl">
        <Panel name="5">
          {{$t('project') + $t('information')}}
          <p slot="content">
          <Form :model="formItem" ref="formConfig" :rules="ruleInline"  :label-width="85">
          <Row>
            <Col span="12">
              <FormItem :label="$t('project_name')" prop="name">
                <Input v-model="formItem.name"/>
              </FormItem>
              <FormItem :label="$t('phone')" prop="phone">
                <Input v-model="formItem.phone" readonly/>
              </FormItem>
              <FormItem :label="$t('customer')" prop="customer">
                <Select v-model="formItem.customerId" @on-change="selectCustomer" filterable>
                  <Option v-for="item in customerList" :value="item.id" :key="item.id">{{ item.name }}</Option>
                </Select>
              </FormItem>
              <FormItem :label="$t('cycle')" prop="cycle">
                <DatePicker style="width: 100%" v-model="formItem.cycle" @on-change="handleChangeCycle" type="daterange" confirm :clearable="false" :editable="false" show-week-numbers :placeholder="$t('input_fill.cycle')"></DatePicker>
              </FormItem>
              </Col>
              <Col span="12">
              <FormItem :label="$t('yHContact')" prop="employeeId" >
                <!--<Input v-model="formItem.contact"/>-->
                <Select v-model="formItem.employeeId" prop="employeeId" @on-change="selectEmployee" filterable>
                  <Option v-for="item in employeeList" :value="item.id" :key="item.id">{{ item.name }}</Option>
                </Select>
              </FormItem>
              <FormItem :label="$t('email')">
                <Input v-model="formItem.email" readonly/>
              </FormItem>
              <FormItem :label="$t('address')" >
                <Input v-model="formItem.address" readonly/>
              </FormItem>
              <FormItem >
                <Checkbox v-model="formItem.saleInvoice">{{$t('invoiceOut')}}</Checkbox>
                <Checkbox v-model="formItem.collection">{{$t('moneyIn')}}</Checkbox>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="24">
            <FormItem :label="$t('remark')" prop="remark" >
              <Input type="textarea" :autosize="{minRows: 3,maxRows: 10}" v-model="formItem.remark"/>
            </FormItem>
            </Col>
          </Row>
          <Row>
            <FormItem>
              <Button type="primary" @click="handleSubmit('formConfig')" style="margin-right: 25px;">{{$t('submit')}}</Button>
              <Button type="primary" @click="isShowConfig = false" style="margin-right: 25px;">{{$t('close')}}</Button>
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
            <Button size="large" shape="circle" icon="md-add" @click="isShowPortion = true">{{$t('insert')}}{{$t('portion_name')}}</Button>
            <Row v-for="(p,index) in portionList" :key="p.id">
              <Divider orientation="left">{{p.name}}</Divider>
              <Button size="large" shape="circle" icon="md-clipboard" @click="handleShowPortionUpdate(p)" style="margin-bottom: 5px;margin-left: 10px;">{{$t('edit')}}{{$t('portion_name')}}</Button>
              <Button type="primary" icon="md-add" @click="handleShowDetail(p)" style="margin-bottom: 5px;margin-left: 10px;">{{$t('insert')}}{{$t('detail')}}</Button>
              <Button type="info" icon="md-code-download" @click="handleSaveStatus(p, index)" style="margin-bottom: 5px;margin-left: 10px;">{{$t('save')}}{{$t('status')}}</Button>
              <Table border :columns="detailColumns" :data="detailData[index]" ref="table" ></Table>
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
            <FormItem :label="$t('phone')" prop="phone" >
              <Input v-model="formItem.phone" readonly/>
            </FormItem>
            <FormItem :label="$t('customer')" prop="customerId">
              <Select v-model="formItem.customerId" prop="customerId" @on-change="selectCustomer" filterable>
                <Option v-for="item in customerList" :value="item.id" :key="item.id">{{ item.name }}</Option>
              </Select>
            </FormItem>
            <FormItem :label="$t('cycle')" prop="cycle">
              <DatePicker v-model="formItem.cycle" :clearable="false" style="width:100%;" type="daterange" :editable="false" @on-change="handleChangeCycle"  show-week-numbers :placeholder="$t('input_fill.cycle')"  split-panels></DatePicker>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem :label="$t('yHContact')" prop="employeeId" >
              <!--<Input v-model="formItem.contact" style="width:400px;"/>-->
              <Select v-model="formItem.employeeId" prop="employeeId" @on-change="selectEmployee" filterable>
                <Option v-for="item in employeeList" :value="item.id" :key="item.id">{{ item.name }}</Option>
              </Select>
            </FormItem>
            <FormItem :label="$t('email')" prop="email">
              <Input v-model="formItem.email" readonly/>
            </FormItem>
            <FormItem :label="$t('address')" readonly>
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
            <Button type="primary" @click="handleSubmit('formProject')">{{$t('submit')}}</Button>
          </FormItem>
        </Row>
      </Form>
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
      :title="$t('sell')+$t('certificate')"
      v-model="isShowProjectUpload"
      width="90%"
      :mask-closable="false"
      @on-cancel="handleFileModal"
      :footer-hide="true">
      <div style="position: relative;">
        <Upload
          name="projectFile"
          accept="application/pdf"
          :format="['pdf']"
          :on-format-error="handleFormatError"
          :data=uploadData
          :on-success="handleUploadSuccess"
          :action=uploadProjectUrl>
          <div>
            <Button icon="ios-cloud-upload-outline">{{$t('clickHereToUploadFiles')}}</Button>
          </div>
        </Upload>
        <Button class="fileAddBtn" type="info" icon="md-add" @click="handleShowProjectRemark" ghost>提示记录</Button>
        <Button class="deleteBtn" type="error" icon="ios-trash" ghost @click="handleIsDelFile('project')">{{$t('delete')}}</Button>
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
          :format="['pdf']"
          :on-format-error="handleFormatError"
          :data=uploadData
          :on-success="handleDetailUploadSuccess"
          :action=uploadProjectDetailUrl>
          <div>
            <Button icon="ios-cloud-upload-outline">{{$t('clickHereToUploadFiles')}}</Button>
          </div>
        </Upload>
        <Button class="deleteBtn" type="error" icon="ios-trash" ghost @click="handleIsDelFile('detail')">{{$t('delete')}}</Button>
        <ul class="pdf-list">
          <li v-for="(item, index) of projectDetailFiles" :key="index" v-if="item.type == 'pdf'">
            <Checkbox class="cbxDel" v-model="delDetailFiles['del_'+item.id + '||' + item.code]">{{$t('delete')}}</Checkbox>
            <span @click="showPDF(item)"><pdf :src="item.url" ></pdf></span>
          </li>
        </ul>
      </div>
    </Modal>
    <Modal
      title="新增项目部分"
      v-model="isShowPortion"
      :mask-closable="false"
      width="50%"
      :footer-hide="true">
      <Form :model="formPortion" ref="formPortion" :rules="ruleInline" :label-width="70">
        <FormItem :label="$t('portion_name')" prop="name" >
          <Input v-model="formPortion.name" />
        </FormItem>
        <FormItem :label="$t('tax_rate')" prop="taxRate" >
          <Input v-model="formPortion.taxRate" />
        </FormItem>
        <FormItem :label="$t('preferentialPrice')" >
          <Input v-model="formPortion.preferentialPrice" />
        </FormItem>
        <!--<FormItem :label="$t('remark')" prop="remark" >-->
          <!--<Input type="textarea" :autosize="{minRows: 2,maxRows: 5}" v-model="formItem.remark" style="width:880px;"/>-->
        <!--</FormItem>-->
        <FormItem>
          <Button type="primary" @click="handleSubmitPortion('formPortion')">{{$t('submit')}}</Button>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import {
  insert,
  getDataPage,
  getData,
  getDataRestful,
  getDataByPrimaryKey,
  getProjectFileById,
  delProjectFileById,
  update,
  updateUrl
} from '@/api/data'
import {
  deepCopy,
  hasValue
} from '@/libs/tools'
import axios from '@/libs/api.request'
import 'viewerjs/dist/viewer.css'
import pdf from 'vue-pdf'
import moment from 'moment'
import calc from 'calculatorjs'

export default {
  components: {
    pdf
  },
  name: 'project',
  data () {
    return {
      sellStatusList: [
        {
          value: 1,
          label: this.$t('status_enum.complete')
        },
        {
          value: 0,
          label: this.$t('status_enum.notStarted')
        }
      ],
      purchaseStatusList: [
        {
          value: 1,
          label: this.$t('status_enum.complete')
        },
        {
          value: 2,
          label: this.$t('status_enum.partiallyComplete')
        },
        {
          value: 0,
          label: this.$t('status_enum.notStarted')
        }
      ],
      moduleName: 'project',
      showPdfUrl: '',
      page: 1,
      size: this.$pageSize,
      valueColl: ['2', '3', '4', '5'],
      portionList: [],
      remarkList: [],
      totalPrice: 0,
      customerList: [],
      complete: '#00EC00',
      partlyComplete: '#F9F900',
      notStarted: '#FF0000',
      employeeList: [],
      dataProject: [],
      totalProjectList: [],
      detailInvoiceList: {},
      detailPaymentList: {},
      totalProject: 0,
      isShowForm: false,
      isShowConfig: false,
      isShowPortion: false,
      isShowDetail: false,
      isShowPdf: false,
      isShowProjectUpload: false,
      isShowProjectDetailUpload: false,
      isShowProjectRemarkForm: false,
      isDelFile: false,
      loading: false,
      loadingProject: false,
      projectTax: 0,
      projectTotalExcludingTax: 0,
      projectTotalIncludingTax: 0,
      filesById: [],
      filesByCode: [],
      projectDelFlag: '',
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
          key: 'code'
        },
        {
          title: this.$t('status'),
          width: 130,
          key: 'status',
          render: (h, params) => {
            let row = params.row
            let saleInvoice = this.getStatusLevel(row.saleInvoice)
            let invoice = this.getStatusLevel(row.invoice)
            let collection = this.getStatusLevel(row.collection)
            let payment = this.getStatusLevel(row.payment)
            return h('div', [
              h('div', saleInvoice, '出票'),
              h('div', collection, '进款'),
              h('div', invoice, '出款'),
              h('div', payment, '进票')
            ])
          }
        },
        {
          title: this.$t('project_name'),
          align: 'center',
          key: 'name'
        },
        {
          title: this.$t('customer'),
          key: 'customerName'
        },
        {
          title: this.$t('yHContact'),
          key: 'employeeName'
        },
        {
          title: this.$t('phone'),
          key: 'phone'
        },
        {
          title: this.$t('address'),
          key: 'address'
        },
        {
          title: this.$t('startTime'),
          key: 'startTime',
          width: 100,
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
                    this.handleShowConfig(params.index)
                  }
                }
              }, this.$t('detail')),
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
                    this.handleUploadFile(params)
                  }
                }
              }, this.$t('certificate'))
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
            ])
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
          className: 'table-data-sell-show'
        },
        {
          title: this.$t('model'),
          key: 'model',
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
          title: this.$t('preTaxSubtotal'),
          width: 100,
          align: 'right',
          key: 'preTaxSubtotal',
          className: 'table-data-sell-show'
        },
        {
          title: this.$t('action'),
          key: 'action',
          width: 70,
          align: 'center',
          fixed: 'right',
          render: (h, params) => {
            let row = params.row
            if (hasValue(row.id)) {
              return h('div', [
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
                      this.handleShowDetailUpdate(params)
                    }
                  }
                }, this.$t('edit')),
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
                      this.handleDetailUploadFile(params)
                    }
                  }
                }, '凭证')
              ])
            }
          }
        },
        {
          title: this.$t('remark'),
          key: 'remark',
          tooltip: true,
          className: 'table-data-sell-show'
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
          title: this.$t('tax_rate'),
          width: 70,
          align: 'right',
          key: 'taxRate',
          className: 'table-data-purchase-show'
        },
        {
          title: this.$t('costSubtotal'),
          width: 85,
          align: 'right',
          key: 'costSubtotal',
          className: 'table-data-purchase-show'
        },
        {
          title: this.$t('afterTaxSubtotal'),
          width: 110,
          align: 'right',
          key: 'afterTaxSubtotal',
          className: 'table-data-purchase-show'
        },
        {
          title: this.$t('profit'),
          width: 100,
          align: 'right',
          key: 'profit',
          className: 'table-data-purchase-show'
        },
        {
          title: this.$t('status'),
          width: 99,
          align: 'center',
          className: 'table-data-purchase-show',
          render: (h, params) => {
            let row = params.row
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
            let invoice = Boolean(row.invoice)
            let payment = Boolean(row.payment)
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
                }, this.$t('moneyOut'))
              ])
            }
          }
        }
      ],
      // detailColumns: [
      //   {
      //     key: 'index',
      //     width: 60,
      //     align: 'center',
      //     title: this.$t('index')
      //   },
      //   {
      //     title: this.$t('product'),
      //     key: 'product'
      //   },
      //   {
      //     title: this.$t('model'),
      //     key: 'model'
      //   },
      //   {
      //     title: this.$t('number'),
      //     align: 'right',
      //     key: 'number'
      //   },
      //   {
      //     title: this.$t('price'),
      //     align: 'right',
      //     key: 'price'
      //   },
      //   {
      //     title: this.$t('taxUnitPrice'),
      //     align: 'right',
      //     key: 'taxUnitPrice'
      //   },
      //   {
      //     title: this.$t('preTaxSubtotal'),
      //     align: 'right',
      //     key: 'preTaxSubtotal'
      //   },
      //   {
      //     title: this.$t('tax_rate'),
      //     align: 'right',
      //     key: 'taxRate'
      //   },
      //   {
      //     title: this.$t('profit') + ' / ' + this.$t('taxPrice'),
      //     width: 125,
      //     align: 'right',
      //     fixed: 'right',
      //     key: 'taxPrice',
      //     className: 'table-data-only-show-column'
      //   },
      //   {
      //     title: this.$t('profitMargin') + ' / ' + this.$t('afterTaxSubtotal'),
      //     align: 'right',
      //     fixed: 'right',
      //     key: 'afterTaxSubtotal',
      //     className: 'table-data-only-show-column'
      //   },
      //   {
      //     title: this.$t('action'),
      //     key: 'action',
      //     width: 120,
      //     align: 'center',
      //     fixed: 'right',
      //     render: (h, params) => {
      //       if (hasValue(params.row.id)) {
      //         return h('div', [
      //           h('Button', {
      //             props: {
      //               type: 'primary',
      //               size: 'small'
      //             },
      //             style: {
      //               marginRight: '5px'
      //             },
      //             on: {
      //               click: () => {
      //                 this.handleShowDetailUpdate(params)
      //               }
      //             }
      //           }, this.$t('edit'))
      //         ])
      //       }
      //     }
      //   },
      //   {
      //     title: this.$t('remark'),
      //     key: 'remark',
      //     tooltip: true
      //   }
      // ],
      detailData: [],
      runColumns: [
        {
          type: 'index',
          width: 60,
          align: 'center',
          title: this.$t('index')
        }, {
          title: this.$t('detail'),
          key: 'detail'
        }, {
          title: '费用',
          key: 'total'
        }],
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
          message: this.$t('input_fill.number')
        }],
        price: [{
          required: true,
          message: this.$t('input_fill.price')
        }],
        remark: []
      },
      uploadData: {
        id: ''
      },
      delFiles: [],
      delDetailFiles: [],
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
        remark: ''
      },
      searchItem: {
        name: '',
        cycle: [],
        startTime: '',
        customerId: '',
        saleInvoice: '',
        invoice: '',
        collection: '',
        payment: ''
      },
      formPortion: {
        id: '',
        name: '',
        projectId: '',
        taxRate: 0
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
        remark2: ''
      },
      formRemark: {
        id: '',
        project_id: '',
        content: ''
      },
      projectFile: null,
      projectFiles: [],
      projectDetailFiles: []
    }
  },
  computed: {
    uploadProjectUrl: function () {
      return axios.baseUrl + 'project_file' + '/uploadFile'
    },
    uploadProjectDetailUrl: function () {
      return axios.baseUrl + 'project_detail_file' + '/uploadFile'
    }
  },
  methods: {
    copyProduct () {
      let me = this
      me.formDetail.product2 = me.formDetail.product
    },
    copyModel () {
      let me = this
      me.formDetail.model2 = me.formDetail.model
    },
    hanleNoCachePdfUrl (url) {
      return url + '?_d=' + new Date().getTime()
    },
    handleChangeCycle (value, type) {
      this.formItem.cycle = value
      this.formItem.startTime = value[0]
      this.formItem.endTime = value[1]
    },
    handleChangeStartDate (value, type) {
      this.searchItem.startTime = value
    },
    handleSubmit (form) {
      this.$refs[form].validate((valid) => {
        if (valid) {
          if (!hasValue(this.formItem.id)) {
            insert(this.moduleName, this.formItem).then(res => {
              if (res.data.success) {
                this.$Message.success(this.$t('success'))
                this.$refs[form].resetFields()
                this.isShowForm = false
                this.selectProject()
              } else {
                this.$Message.error(res.data.message)
              }
            })
          } else {
            update(this.moduleName, this.formItem).then(res => {
              if (res.data.success) {
                this.$Message.success(this.$t('success'))
                this.$refs[form].resetFields()
                this.isShowConfig = false
                this.selectProject()
              } else {
                this.$Message.error(res.data.message)
              }
            })
          }
        }
      })
    },
    handelSubmitProjectRemark (form) {
      this.$refs[form].validate((valid) => {
        if (valid) {
          if (!hasValue(this.formRemark.id)) {
            this.formRemark.projectId = this.uploadData.id
            insert('project_remark', this.formRemark).then(res => {
              if (res.data.success) {
                this.$Message.success(this.$t('success'))
                this.isShowProjectRemarkForm = false
                this.$refs[form].resetFields()
                this.selectProjectRemarkByProject()
              } else {
                this.$Message.error(res.data.message)
              }
            })
          }
        }
      })
    },
    handleSubmitPortion (form) {
      this.$refs[form].validate((valid) => {
        if (valid) {
          if (!hasValue(this.formPortion.id)) {
            this.formPortion.projectId = this.formItem.id
            insert('project_portion', this.formPortion).then(res => {
              if (res.data.success) {
                this.$Message.success(this.$t('success'))
                this.$refs[form].resetFields()
                this.isShowPortion = false
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
                this.selectPointerByProject()
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
    handleSubmitDetail (form) {
      this.$refs[form].validate((valid) => {
        if (valid) {
          if (!hasValue(this.formDetail.id)) {
            this.formDetail.portionId = this.formPortion.id
            insert('project_detail', this.formDetail).then(res => {
              if (res.data.success) {
                this.$Message.success(this.$t('success'))
                this.$refs[form].resetFields()
                this.isShowDetail = false
                this.selectPointerByProject()
              } else {
                this.$Message.error(res.data.message)
              }
            })
          } else {
            update('project_detail', this.formDetail).then(res => {
              if (res.data.success) {
                this.$Message.success(this.$t('success'))
                this.$refs[form].resetFields()
                this.isShowDetail = false
                this.selectPointerByProject()
              } else {
                this.$Message.error(res.data.message)
              }
            })
          }
        }
      })
    },
    handleShowProjectInsert () {
      this.isShowForm = true
      this.$refs['formProject'].resetFields()
      this.formItem.cycle = []
    },
    handleShowConfig (index) {
      let formDate = deepCopy(this.dataProject[index])
      this.formItem = formDate
      this.formItem.cycle = []
      this.formItem.cycle.push(moment(formDate.startTime).format('YYYY-MM-DD'))
      this.formItem.cycle.push(moment(formDate.endTime).format('YYYY-MM-DD'))
      this.formItem.saleInvoice = Boolean(this.formItem.saleInvoice)
      this.formItem.collection = Boolean(this.formItem.collection)
      this.isShowConfig = true
      this.selectEmployee(this.formItem.employeeId)
      this.selectCustomer(this.formItem.customerId)
      this.selectPointerByProject()
    },
    handleUpload () {
      this.projectFile = file
      return false
    },
    handleProjectFilter () {
      this.selectProjectByRecords(this.searchItem)
    },
    handleUploadFile (params) {
      this.isShowProjectUpload = true
      this.uploadData.id = params.row.id
      this.selectProjectFileById()
      this.selectProjectRemarkByProject()
    },
    handleDetailUploadFile (params) {
      this.isShowProjectDetailUpload = true
      this.uploadData.id = params.row.id
      this.selectProjectDetailFileById()
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
    handleShowForm (params) {
      this.isShowConfig = true
    },
    handleShowDetail (params) {
      this.isShowDetail = true
      this.$refs['formDetail'].resetFields()
      this.formPortion = params
    },
    handleSaveStatus (params, index) {
      let data = {
        invoice: this.detailInvoiceList[params.id],
        payment: this.detailPaymentList[params.id],
        projectId: this.formItem.id
      }
      console.info(index)
      console.info(this.detailData[index].length)
      console.info(this.detailInvoiceList[params.id])
      console.info(this.detailPaymentList[params.id])
      if (hasValue(this.detailInvoiceList[params.id]) && hasValue(this.detailPaymentList[params.id])) {
        let url = '/updateState'
        updateUrl('project_detail', data, url).then(res => {
          if (res.data.success) {
            this.$Message.success(this.$t('success'))
            this.selectProject()
          } else {
            this.$Message.error(res.data.message)
          }
        })
      } else {
        this.$Message.error('没有数据')
      }
    },
    handleChangeInvoiceStatus (value, row) {
      this.detailInvoiceList[row.portionId][row.id] = value * 1
    },
    handleChangePaymentStatus (value, row) {
      this.detailPaymentList[row.portionId][row.id] = value * 1
    },
    handleShowDetailUpdate (params) {
      let obj = {}
      obj.id = params.row.id
      getDataByPrimaryKey('project_detail', obj).then(res => {
        this.formDetail = res.data.result.data
      })
      this.isShowDetail = true
    },
    handleShowPortionUpdate (params) {
      this.isShowPortion = true
      this.formPortion = params
    },
    changePage (pageNumber) {
      this.page = pageNumber
      this.selectProject(this.detailData)
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
    getCustomer () {
      getData('customer').then(res => {
        this.customerList = res.data.result.data
      })
    },
    getEmployee () {
      getData('employee').then(res => {
        this.employeeList = res.data.result.data
      })
    },
    handlePortionCopy () {
      this.formDetail.product2 = this.formDetail.product
      this.formDetail.model2 = this.formDetail.model
      this.formDetail.number2 = this.formDetail.number
    },
    handleFormatError () {
      this.$Message.warning(this.$t('pdfFileUploadingOnlyIsSupported'))
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
    searchChange (date, value) {
      console.info(date)
      console.info(value)
    },
    selectCustomer (value) {
      for (let entity of this.customerList) {
        if (entity.id === value) {
          this.formItem.address = entity.address
          break
        }
      }
    },
    handleExport () {
      window.open(axios.baseUrl + '/project/exportExcel?id=' + this.formItem.id)
    },
    getDetailByPortionId (p_index, params, totals) {
      this.detailData = []
      let obj = {}
      obj.portionId = params.id
      getData('project_detail', obj).then(res => {
        let tempData = []
        let resData = res.data.result.data
        // 累计税前小计
        let sellTotal = 0
        // 累计非含税采购总计
        let purchaseTotal = 0
        // 累计含税采购总计
        let taxPriceTotal = 0
        // 累计采购税费
        let purchaseTaxTotal = 0
        resData.forEach((data, i) => {
          // 税前小计
          data.preTaxSubtotal = calc.mul(data.price, data.number)
          // 成本小计
          data.costSubtotal = calc.mul(data.price2, data.number2)
          // 样式名
          data.cellClassName = {}
          // 累计税前小计
          sellTotal = calc.add(sellTotal, data.preTaxSubtotal)
          // 成本含税小计
          data.afterTaxSubtotal = calc.mul(calc.add(calc.div(calc.mul(data.price2, data.taxRate), 100), data.price2), data.number2)
          // 累计非含税采购总计
          purchaseTotal = calc.add(purchaseTotal, data.costSubtotal)
          // 累计含税采购总计
          taxPriceTotal = calc.add(taxPriceTotal, calc.mul(calc.add(calc.div(calc.mul(data.price2, data.taxRate), 100), data.price2), data.number2))
          // 累计采购税费
          purchaseTaxTotal = calc.add(purchaseTaxTotal, calc.mul(calc.div(calc.mul(data.price2, data.taxRate), 100), data.number2))
          // 非含税利润
          data.profit = calc.sub(data.preTaxSubtotal, data.costSubtotal)
          // if ((i % 2) === 0) {
          //   sellTotal = numAdd(sellTotal, data.preTaxSubtotal)
          //   data.taxPrice = numSub(numMulti(data.price, data.number), numMulti(resData[i + 1].price, resData[i + 1].number))
          //   data.afterTaxSubtotal = numMulti(numDiv(data.taxPrice, numMulti(resData[i + 1].price, resData[i + 1].number)), 100).toFixed(2)
          //   data.index = index
          //   data.taxUnitPrice = numAdd(numDiv(numMulti(data.price, params.taxRate), 100), data.price)
          // } else {
          //   purchaseTotal = numAdd(purchaseTotal, data.preTaxSubtotal)
          //   data.taxPrice = numDiv(numMulti(data.preTaxSubtotal, data.taxRate), 100)
          //   taxPriceTotal = numAdd(taxPriceTotal, data.taxPrice)
          //   data.afterTaxSubtotal = numAdd(data.taxPrice, data.preTaxSubtotal)
          //   data.index = index
          //   data.taxUnitPrice = numAdd(numDiv(numMulti(data.price, data.taxRate), 100), data.price)
          //   let keys = deepCopy(data)
          //   for (let k in keys) {
          //     data.cellClassName[k] = 'table-data-only-show'
          //   }
          //   index++
          // }
          tempData.push(data)
        })

        let preTotalObj = {
          'cellClassName': {
            price: 'table-data-total',
            preTaxSubtotal: 'table-data-total',
            // taxRate: 'table-data-total',
            costSubtotal: 'table-data-total'
          },
          'price': this.$t('preTaxTotal'),
          'preTaxSubtotal': sellTotal,
          'taxPrice': this.$t('totalCostNotIncludingTax'),
          'costSubtotal': purchaseTotal
        }
        let taxPrice
        let sellAllTotal
        if (hasValue(params.preferentialPrice) && params.preferentialPrice !== 0) {
          totals[0] = calc.add(totals[0], params.preferentialPrice)
          taxPrice = calc.div(calc.mul(params.preferentialPrice, params.taxRate), 100)
          sellAllTotal = calc.add(params.preferentialPrice, taxPrice)
        } else {
          totals[0] = calc.add(totals[0], sellTotal)
          taxPrice = calc.div(calc.mul(sellTotal, params.taxRate), 100)
          sellAllTotal = calc.add(sellTotal, taxPrice)
        }
        totals[1] = calc.add(totals[1], taxPrice)
        totals[2] = calc.add(totals[2], sellAllTotal)
        let taxPriceObj = {
          'cellClassName': {
            price: 'table-data-total',
            preTaxSubtotal: 'table-data-total',
            afterTaxSubtotal: 'table-data-total'
          },
          'price': this.$t('tax_rate') + ' (' + params.taxRate + '%)',
          'preTaxSubtotal': taxPrice,
          // 'taxPrice': this.$t('totalCostTax'),
          'afterTaxSubtotal': purchaseTaxTotal
        }

        let totalObj = {
          'cellClassName': {
            price: 'table-data-total',
            preTaxSubtotal: 'table-data-total',
            // taxRate: 'table-data-total',
            afterTaxSubtotal: 'table-data-total'
          },
          'price': this.$t('afterTaxTotal'),
          'preTaxSubtotal': sellAllTotal,
          'taxPrice': this.$t('totalCostIncludingTax'),
          'afterTaxSubtotal': taxPriceTotal
        }
        let preferential = {
          'cellClassName': {
            price: 'table-data-total',
            preTaxSubtotal: 'table-data-total'
          },
          'price': this.$t('preferentialPrice'),
          'preTaxSubtotal': params.preferentialPrice
        }
        tempData.push(preTotalObj)
        if (hasValue(params.preferentialPrice) && params.preferentialPrice !== 0) {
          tempData.push(preferential)
        }
        tempData.push(taxPriceObj)
        tempData.push(totalObj)
        // 此处ajax异步访问秩序不一，需要用外层的部分ID作为索引下标
        // this.detailData.push(tempData)
        this.detailData[p_index] = tempData
        this.projectTotalStatistics(totals)
      })
    },
    projectTotalStatistics (totals) {
      let tempObj1 = {
        type: this.$t('projectTotalExcludingTax'),
        total: totals[0]
      }
      let tempObj2 = {
        type: this.$t('projectTax'),
        total: totals[1]
      }
      let tempObj3 = {
        type: this.$t('projectTotalIncludingTax'),
        total: totals[2]
      }
      this.totalProjectList = []
      this.totalProjectList.push(tempObj1)
      this.totalProjectList.push(tempObj2)
      this.totalProjectList.push(tempObj3)
    },
    selectProject () {
      this.selectProjectByRecords(null)
    },
    selectProjectByRecords (params) {
      let obj = {}
      if (hasValue(params)) {
        obj = params
      }
      obj.page = this.page
      obj.size = this.size
      this.loading = true
      getDataPage(this.moduleName, obj).then(res => {
        this.totalProject = res.data.result.total
        this.dataProject = res.data.result.data
        this.loadingProject = false
      })
    },
    selectPointerByProject () {
      let obj = {}
      obj.projectId = this.formItem.id
      getData('project_portion', obj).then(res => {
        let totals = [0, 0, 0]
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
    selectProjectRemarkByProject () {
      getDataRestful('project_remark', this.uploadData.id).then(res => {
        let tempArrays = []
        let tempItem = ''
        let results = res.data.result.data
        if (results.length > 0) {
          results.forEach(item => {
            tempItem = {}
            tempItem = deepCopy(item)
            tempItem.createTime = moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')
            tempArrays.push(tempItem)
          })
        }
        this.remarkList = tempArrays
      })
    },
    handleFileModal () {
      this.delFiles = []
      this.projectFiles = []
      this.delDetailFiles = []
      this.projectDetailFiles = []
    },
    handleShowProjectRemark () {
      this.isShowProjectRemarkForm = true
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
        this.isDelFile = true
      }
    },
    handleDeleteFile () {
      let flag = this.projectDelFlag
      let obj = {}
      if (this.filesById.length !== 0) {
        obj.ids = this.filesById.join(',')
        obj.codes = this.filesByCode.join(',')
        if (flag === 'project') {
          delProjectFileById('project_file', obj).then(res => {
            if (res.data.success) {
              this.projectFiles = []
              this.selectProjectFileById()
            } else {
              this.$Message.warning(res.data.message)
            }
          })
        } else if (flag === 'detail') {
          delProjectFileById('project_detail_file', obj).then(res => {
            if (res.data.success) {
              this.projectFiles = []
              this.selectProjectDetailFileById()
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
    handleUploadSuccess (response, file, fileList) {
      if (response.success) {
        this.selectProjectFileById()
      } else {
        this.$Message.warning(response.message)
      }
    },
    handleDetailUploadSuccess (response, file, fileList) {
      if (response.success) {
        this.selectProjectDetailFileById()
      } else {
        this.$Message.warning(response.message)
      }
    },
    showPDF (item) {
      let host = window.location.host
      let protocol = document.location.protocol
      // window.open(protocol + '//' + host + '/web/viewer.html?file=' + item.url)
      this.isShowPdf = true
      this.showPdfUrl = protocol + '//' + host + '/web/viewer.html?file=' + item.url
    }
  },
  mounted () {
    this.selectProject()
    this.getCustomer()
    this.getEmployee()
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
    height: 40px;
    font-weight: 700;
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
  .ivu-table .table-data-total {
    background-color: #f8f8f9;
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
