import axios from 'axios'

/**
 * 通用API调用函数
 * @param {string} cmd - API命令
 * @param {Object} params - 请求参数
 * @param {boolean} usePost - 是否使用POST请求
 * @returns {Promise} - API响应结果
 */
export async function callAPI(cmd, params = {}, usePost = false) {
  const baseURL = localStorage.getItem('serverAddress')
  if (!baseURL) {
    throw new Error('请先在首页保存服务器地址')
  }

  const authKey = localStorage.getItem('serverAuthKey')
  const headers = {}
  if (authKey) {
    headers.Authorization = authKey
  }

  // 构建请求参数
  const requestParams = { cmd, ...params }

  try {
    let response
    if (usePost) {
      response = await axios.post(`${baseURL}/cdq/api`, requestParams, { headers })
    } else {
      const urlParams = new URLSearchParams(requestParams)
      response = await axios.get(`${baseURL}/cdq/api?${urlParams.toString()}`, { headers })
    }

    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message)
  }
}

/**
 * 账户管理API
 */
export const accountAPI = {
  // 注册新账户
  login: (name) => callAPI('account', { name, type: 'login' }),
  
  // 封禁账户
  ban: (name, banMsg) => callAPI('account', { name, type: 'ban', banMsg }),
  
  // 解封账户
  unban: (name) => callAPI('account', { name, type: 'unban' }),
  
  // 获取账户详情
  get: (name) => callAPI('account', { name, type: 'get' }),
}

/**
 * 角色管理API
 */
export const characterAPI = {
  // 设置角色属性
  set: (uid, id, options = {}) => {
    const params = { uid, id }
    if (options.starGrade !== undefined) params.starGrade = options.starGrade
    if (options.level !== undefined) params.level = options.level
    if (options.favorRank !== undefined) params.favorRank = options.favorRank
    if (options.max !== undefined) params.max = options.max
    return callAPI('character', params)
  },
}

/**
 * 物品分发API
 */
export const itemAPI = {
  // 给予单个物品
  give: (uid, id, t, num) => callAPI('g', { uid, id, t, num }),
  
  // 给予全部物品
  giveAll: (uid, t, num = 1) => callAPI('ga', { uid, t, num }),
}

/**
 * 邮件API
 */
export const mailAPI = {
  // 发送游戏邮件
  sendGameMail: (params) => callAPI('gameMail', params),
  
  // 发送系统邮件
  sendSystemMail: (header, body, usernames) => callAPI('mail', { header, body, usernames }),
}

/**
 * 验证码API
 */
export const emailCodeAPI = {
  // 设置验证码
  set: (account, code) => callAPI('emailCode', { account, type: 'set', code }),
  
  // 获取验证码
  get: (account) => callAPI('emailCode', { account, type: 'get' }),
  
  // 删除验证码
  delete: (account) => callAPI('emailCode', { account, type: 'del' }),
}

/**
 * 玩家设置API
 */
export const playerAPI = {
  // 获取玩家数据
  getPlayer: (uid, json = 0, basis = 0) => callAPI('gp', { uid, json, basis }),
  
  // 设置玩家属性
  setSetting: (uid, type, sub1) => callAPI('set', { uid, type, sub1 }),
}

/**
 * 系统状态API
 */
export const systemAPI = {
  // 获取服务器状态
  ping: () => callAPI('ping'),
}
