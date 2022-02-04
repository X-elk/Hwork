import { login, logout, getInfo } from '@/api/acl/user'
// import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter, constantRoutes, allAsyncRoutes, anyRoute } from '@/router'
import router from '@/router'

// const getDefaultState = () => {
//   return {
//     token: getToken(),
//     name: '',
//     avatar: ''
//   }
// }

// 根据用户信息里的route里面的路由name字符串数组，找出路由配置里名称一样的路由配置
function filterRouters(allRoutes, routesName) {
  let allFilter = allRoutes.filter(item => {
    // 一级路由
    if (routesName.indexOf(item.name) !== -1) {
      // 二级路由
      if (item.children && item.children.length) {
        item.children = filterRouters(item.children, routesName)
      }
      return true
    }
  })
  return allFilter
}

const state = {
  token: localStorage.getItem('token_key'),
  name: '',
  avatar: '',
  buttons: [],
  roles: [],
  routes: []
}
const mutations = {
  RESET_STATE: (state) => {
    state.token = ''
    state.name = ''
    state.avatar = ''
    state.buttons = []
    state.roles = []
    state.routes = []
  },

  //登录
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  //
  SET_USERINFO: (state, userInfo) => {
    state.avatar = userInfo.avatar
    state.name = userInfo.name
    state.buttons = userInfo.buttons
    state.roles = userInfo.roles
  },
  // 添加动态路由，及保存侧边栏遍历数据
  SET_ROUTES: (state, routes) => {
    state.routes = constantRoutes.concat(routes)
    router.addRoutes([...routes, anyRoute])

  }
}

const actions = {
  // 登录
  async login({ commit }, userInfo) {
    const { username, password } = userInfo
    const result = await login({ username, password })
    if (result.code === 20000 || result.code === 200) {
      commit('SET_TOKEN', result.data.token)
      localStorage.setItem('token_key', result.data.token)
      return 'ok'
    } else {
      return Promise.reject(new Error('flied'))
    }

  },

  // get user info
  async getInfo({ commit, state }) {
    const result = await getInfo(state.token)
    if (result.code === 20000 || result.code === 200) {
      commit('SET_USERINFO', result.data)
      // console.log(result.data)
      commit('SET_ROUTES', filterRouters(allAsyncRoutes, result.data.routes))
      // 注意这里返回的是什么，多次出现错误
      return 'ok'
    } else {
      return Promise.reject(new Error('flied'))
    }
  },

  // 退出登录
  async logout({ commit, state, dispatch }) {
    const result = await logout(state.token)
    if (result.code === 20000 || result.code === 200) {
      //当用户退出登录的时候清除本地token,路由,及当前数据
      dispatch('resetToken')
      resetRouter()
      return 'ok'
    } else {
      return Promise.reject(new Error('flied'))
    }
  },

  // remove token
  async resetToken({ commit }) {
    localStorage.removeItem('token_key')
    commit('RESET_STATE')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

