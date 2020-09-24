<template>
  <div>
    <projectSearch
      :search-item="searchItem"
      :customer-list="customerList"
      :is-search="isSearch"
      :type="type"
      @search="handleProjectFilter"
      @refresh="handleRefreshInfo">
    </projectSearch>
    <Button size="large" shape="circle" icon="md-add" @click="handleShowProjectInsert">{{$t('insert')}}</Button>
    <projectStateDes/>
    <project-list
      ref="projectList"
      :is-search="isSearch"
      :loading-project="loadingProject"
      :customer-list="customerList"
      :totalProject="totalProject"
      :dataProject="dataProject"
      :type="type"
      @handleUpdateSearchButton="handleUpdateSearchButton"
      @handleGetDataPage="handleGetDataPage"
      @handleLoadingProject="handleLoadingProject">
    </project-list>
  </div>
</template>

<script>
import {
  getDataPage,
  getData
} from '@/api/data'
import {
  hasOneOf
} from '@/libs/tools'
import 'viewerjs/dist/viewer.css'
import projectSearch from './project-search.vue'
import projectStateDes from './project-state-description.vue'
import projectList from './project-list.vue'

export default {
  name: 'pending_project',
  components: {
    projectSearch,
    projectStateDes,
    projectList
  },
  data () {
    return {
      moduleName: 'project',
      type: 'project',

      totalProject: 0,
      dataProject: [],

      totalPrice: 0,
      customerList: [],
      isShowForm: false,
      isShowConfig: false,
      isShowPortion: false,
      isShowDetail: false,
      isShowPdf: false,
      isShowProjectUpload: false,
      isShowProjectDetailUpload: false,
      isShowProjectRemarkForm: false,
      isSearch: false,

      loadingProject: true,
      projectTax: 0,
      // projectTotalExcludingTax: 0,
      // projectTotalIncludingTax: 0,
      // projectFit: 0,

      searchItem: {
        name: '',
        cycle: [],
        startTime: '',
        customerId: '',
        saleInvoice: '',
        invoice: '',
        collection: '',
        payment: ''
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
    handleLoadingProject (value) {
      this.loadingProject = value
    },
    handleShowProjectInsert () {
      this.$refs.projectList.handleShowProjectInsert()
    },
    handleProjectFilter () {
      this.loadingProject = true
      this.isSearch = true
      this.$refs.projectList.selectProjectByRecords(this.searchItem)
    },
    handleUpdateSearchButton (value) {
      this.isSearch = value
    },
    handleRefreshInfo () {
      this.getCustomer()
    },
    handleShowForm (params) {
      this.isShowConfig = true
    },
    handleGetDataPage (obj) {
      getDataPage(this.moduleName, obj).then(res => {
        this.totalProject = res.data.result.total
        this.dataProject = res.data.result.data
        this.loadingProject = false
        this.isSearch = false
      })
    },
    getCustomer () {
      getData('customer').then(res => {
        this.customerList = res.data.result.data
      })
    }
  },
  created () {
    this.handleRefreshInfo()
    // this.$refs.projectList.selectProject(null)
    // this.$refs.projectList.selectProject()
  }
}
</script>
<style scoped>

</style>
