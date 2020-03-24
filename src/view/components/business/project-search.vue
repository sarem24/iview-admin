<template>
  <Form inline>
    <FormItem >
      <Input v-model="searchItem.name" clearable style="width:250px" :placeholder="$t('search_hint.project')">
        <Icon type="ios-photos" slot="prepend"></Icon>
      </Input>
    </FormItem>
    <FormItem>
      <Select v-model="searchItem.customerId" prop="customerId"  prefix="md-home" :placeholder="$t('search_hint.customer')" clearable filterable>
        <Option v-for="item in customerList" :value="item.id" :key="item.id">{{ item.name }}</Option>
      </Select>
    </FormItem>
    <FormItem v-if="displayFlag && !viewSeller">
      <Select v-model="searchItem.employeeId" prop="customerId"  prefix="md-home" :placeholder="$t('search_hint.employee')" clearable filterable>
        <Option v-for="item in employeeList" :value="item.id" :key="item.id">{{ item.name }}</Option>
      </Select>
    </FormItem>
    <FormItem>
      <DatePicker type="date" :editable="false" @on-change="handleChangeStartDate" split-panels :placeholder="$t('search_hint.startDate')" :on-change="searchChange" ></DatePicker>
    </FormItem>
    <FormItem>
      <Button type="info" icon="ios-search" @click="handleProjectFilter" :disabled="isSearch">{{$t('search')}}</Button>
    </FormItem>
    <FormItem>
      <Button type="info" icon="ios-refresh" @click="handleRefreshInfo">{{$t('refresh')}}</Button>
    </FormItem>
    <br/>
    <FormItem v-if="displayFlag" :label="$t('invoiceOut')">
      <Select v-model="searchItem.saleInvoice" clearable  style="width:200px">
        <Option v-for="item in orderStatusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
    </FormItem>
    <FormItem v-if="displayFlag" :label="$t('moneyIn')">
      <Select v-model="searchItem.collection" clearable  style="width:200px">
        <Option v-for="item in orderStatusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
    </FormItem>
    <FormItem v-if="displayFlag" :label="$t('invoiceTo')">
      <Select v-model="searchItem.invoice" clearable  style="width:200px">
        <Option v-for="item in orderStatusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
    </FormItem>
    <FormItem v-if="displayFlag" :label="$t('moneyOut')">
      <Select v-model="searchItem.payment" clearable  style="width:200px">
        <Option v-for="item in orderStatusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
    </FormItem>
<!--    <FormItem v-if="!displayFlag" :label="$t('status')">-->
<!--      <Select v-model="searchItem.status" clearable  style="width:250px">-->
<!--        <Option v-for="item in statusList" :value="item.value" :key="item.value">{{ item.label }}</Option>-->
<!--      </Select>-->
<!--    </FormItem>-->
  </Form>
</template>
<script>
import {
  hasOneOf
} from '@/libs/tools'
export default {
  name: 'project-search',
  props: {
    searchItem: {
      name: '',
      status: '',
      cycle: Array,
      startTime: '',
      customerId: '',
      employeeId: '',
      saleInvoice: '',
      invoice: '',
      collection: '',
      payment: ''
    },
    type: String,
    isSearch: Boolean,
    customerList: Array,
    employeeList: Array
  },
  data () {
    return {
      orderStatusList: [
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
      statusList: [
        {
          value: 'update',
          label: this.$t('project_status.update')
        },
        {
          value: 'review',
          label: this.$t('project_status.review')
        },
        {
          value: 'withdraw',
          label: this.$t('project_status.withdraw')
        },
        {
          value: 'pass',
          label: this.$t('project_status.pass')
        }
      ],
      displayFlag: false
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
    displayType () {
      switch (this.type) {
        case 'project':
          this.displayFlag = false
          break
        case 'execute':
          this.displayFlag = true
          break
        default:
          this.displayFlag = false
      }
    },
    handleProjectFilter () {
      this.$emit('search')
    },
    handleRefreshInfo () {
      this.$emit('refresh')
    },
    handleChangeStartDate (value, type) {
      this.searchItem.startTime = value
    },
    searchChange (date, value) {
      console.info(date)
      console.info(value)
    }
  },
  mounted () {
    this.displayType()
  }
}
</script>
