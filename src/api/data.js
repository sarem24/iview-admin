import axios from '@/libs/api.request'
import { hasValue } from '../libs/tools'

export const getTableData = () => {
  return axios.request({
    url: 'get_table_data',
    method: 'get'
  })
}

export const getDragList = () => {
  return axios.request({
    url: 'get_drag_list',
    method: 'get'
  })
}

export const errorReq = () => {
  return axios.request({
    url: 'error_url',
    method: 'post'
  })
}

export const saveErrorLogger = info => {
  return axios.request({
    url: 'save_error_logger',
    data: info,
    method: 'post'
  })
}

export const uploadImg = formData => {
  return axios.request({
    url: 'image/upload',
    data: formData
  })
}

export const getOrgData = () => {
  return axios.request({
    url: 'get_org_data',
    method: 'get'
  })
}

export const getTreeSelectData = () => {
  return axios.request({
    url: 'get_tree_select_data',
    method: 'get'
  })
}

export const insert = (module, info) => {
  return axios.request({
    url: module + '/insert',
    data: info,
    method: 'post'
  })
}

export const update = (module, info) => {
  return axios.request({
    url: module + '/update',
    data: info,
    method: 'put'
  })
}

export const updateUrl = (module, info, url) => {
  return axios.request({
    url: module + url,
    data: info,
    contentType: 'application/x-www-form-urlencoded',
    method: 'post'
  })
}

export const getDataPage = (module, info) => {
  return axios.request({
    url: module + '/selectPage',
    params: info,
    method: 'get'
  })
}

export const getData = (module, info) => {
  return axios.request({
    url: module + '/select',
    params: info,
    method: 'get'
  })
}

export const getDataRestful = (module, info) => {
  let url = module + '/select'
  if (hasValue(info)) {
    url += '/' + info
  }
  return axios.request({
    url: url,
    method: 'get'
  })
}

export const getDataByPrimaryKey = (module, info) => {
  return axios.request({
    url: module + '/selectByPrimaryKey',
    params: info,
    method: 'get'
  })
}

export const getProjectFileById = (module, info) => {
  return axios.request({
    url: module + '/select',
    params: info,
    method: 'get'
  })
}

export const delProjectFileById = (module, info) => {
  return axios.request({
    url: module + '/deleteFile',
    params: info,
    method: 'delete'
  })
}
