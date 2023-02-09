import { EventCenterForMicroApp } from './data'

// 记录addEventListener、removeEventListener原生方法
const rawWindowAddEventListener = window.addEventListener
const rawWindowRemoveEventListener = window.removeEventListener

function effect(microWindow) {
  const eventListenerMap = new Map()

  microWindow.addEventListener = function (type, listener, options) {
    const listenerList = eventListenerMap.get(type)

    if (listenerList) {
      listenerList.add(listener)
    } else {
      eventListenerMap.set(type, new Set([ listener ]))
    }

    return rawWindowAddEventListener.call(window, type, listener, options)
  }

  microWindow.removeEventListener = function (type, listener, options) {
    const listenerList = eventListenerMap.get(type)

    if (listenerList?.size && listenerList.has(listener)) {
      listenerList.delete(listener)
    }

    return rawWindowRemoveEventListener.call(window, type, listener, options);
  }

  return () => {
    console.log('需要卸载的全局事件', eventListenerMap)

    if (eventListenerMap.size) {
      eventListenerMap.forEach((listenerList, type) => {
        if (listenerList.size) {
          for (const listener of listenerList) {
            rawWindowRemoveEventListener.call(window, type, listener)
          }
        }
      })
    }
  }
}

export default class Sandbox {
  active = false // 沙箱是否在运行
  microWindow = {} // // 代理的对象
  injectedKeys = new Set() // 新添加的属性，在卸载时清空

  constructor(appName) {
    this.releaseEffect = effect(this.microWindow)
    this.microWindow.microApp = new EventCenterForMicroApp(appName)

    this.proxyWindow = new Proxy(this.microWindow, {
      get: (target, key) => {
        if (Reflect.has(target, key)) {
          return Reflect.get(target, key)
        }

        const rawValue = Reflect.get(window, key)

        // 如果兜底的值为函数，则需要绑定window对象，如：console、alert等
        if (typeof rawValue === 'function') {
          const valueStr = rawValue.toString()
          // 排除构造函数，function 构造函数大写开头，用 A-Z 判断
          if (!/^function\s+[A-Z]/.test(valueStr) && !/^class\s+/.test(valueStr)) {
            return rawValue.bind(window)
          }
        }

        return rawValue
      },
      set: (target, key, value) => {
        if (this.active) {
          Reflect.set(target, key, value)
          this.injectedKeys.add(key)
        }

        return true
      },
      deleteProperty(target, key) {
        // 当前key存在于代理对象上时才满足删除条件
        if (target.hasOwnProperty(key)) {
          return Reflect.deleteProperty(target, key)
        }
        return true
      }
    })
  }

  // 启动
  start() {
    if (!this.active) {
      this.active = true
    }
  }

  // 停止
  stop() {
    if (this.active) {
      this.active = false

      this.injectedKeys.forEach((key) => {
        Reflect.deleteProperty(this.microWindow, key)
      })
      this.injectedKeys.clear()
      this.releaseEffect()
      // 清空所有绑定函数
      this.microWindow.microApp.clearDataListener()
    }
  }

  bindScope(code) {
    window.proxyWindow = this.proxyWindow

    return `;(function(window, self){with(window){;${ code }\n}}).call(window.proxyWindow, window.proxyWindow, window.proxyWindow);`
  }
}
