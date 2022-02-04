// import Cookies from 'js-cookie'
// 插件,可以方便的使用cookies
// 我们不用
// 从本地获取token
export function getToken() {
  // 我们的token是保存在本地中的
  return localStorage.getItem('token_key')
}
// 调用添加到本地token
export function setToken(token) {
  return localStorage.setItem('token_key', token)
}
// 调用清除本地token
export function removeToken() {
  return localStorage.removeItem('token_key')
}
