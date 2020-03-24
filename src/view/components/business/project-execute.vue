<template>
  <div>
    <projectSearch
      :search-item="searchItem"
      :customer-list="customerList"
      :employee-list="employeeList"
      :is-search="isSearch"
      :type="type"
      @search="handleProjectFilter"
      @refresh="handleRefreshInfo">
    </projectSearch>
    <projectStateDes/>
    <project-list
      ref="projectList"
      :is-search="isSearch"
      :loading-project="loadingProject"
      :customer-list="customerList"
      :totalProject="totalProject"
      :dataProject="dataProject"
      :type="type"
      @handleGetDataPage="handleGetDataPage"
      @handleLoadEmployee="handleLoadEmployee"
      @handleLoadingProject="handleLoadingProject">
    </project-list>
  </div>
</template>

<script>
import {
  getData,
  getDataPage

} from '@/api/data'
import {
  hasOneOf
} from '@/libs/tools'

import projectSearch from './project-search.vue'
import projectStateDes from './project-state-description.vue'
import projectList from './project-list.vue'

export default {
  components: {
    projectSearch,
    projectStateDes,
    projectList
  },
  name: 'project-execute',
  data () {
    return {
      type: 'execute',
      moduleName: 'execute_project',
      totalProject: 0,
      dataProject: [],
      isSearch: false,
      loadingProject: true,
      searchItem: {
        name: '',
        status: '',
        cycle: [],
        startTime: '',
        customerId: '',
        employeeId: '',
        saleInvoice: '',
        invoice: '',
        collection: '',
        payment: ''
      },
      customerList: [],
      employeeList: [],
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
    handleLoadEmployee (value) {
      console.info(value)
      this.employeeList = value
    },
    handleProjectFilter () {
      this.loadingProject = true
      this.isSearch = true
      this.$refs.projectList.selectProjectByRecords(this.searchItem)
    },
    handleRefreshInfo () {
      this.getCustomer()
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
  }
}
</script>

<style scoped>

</style>
