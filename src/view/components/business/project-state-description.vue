<template>
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
            <div class="statusShape" style="background: #FF0000"/>
            <div class="statusShape" style="background: #F9F900"/>
            <div class="statusShape" style="background: #00EC00"/>
            <div style="float:left">依次为【{{$t('status_enum.complete')}}|{{$t('status_enum.partiallyComplete')}}|{{$t('status_enum.notStarted')}}】</div>
          </td>
        </tr>
        <tr>
          <td>状态位置说明↓</td>
          <td>依次为【{{$t('invoiceOut')}}|{{$t('moneyIn')}}|{{$t('invoiceTo')}}|{{$t('moneyOut')}}】</td>
        </tr>
        </tbody>
      </table>
    </div>
  </Poptip>
</template>
<script>
export default {
  name: 'project-state-description'
}
</script>
<style scoped>
  .statusShape {
    border: 1px #a7b0b9 solid;
    text-align: center;
    margin-right: 2px;
    float: left;
    width: 20px;
    height: 85px;
    font-weight: 600;
    border-radius: 7px;
  }
</style>
