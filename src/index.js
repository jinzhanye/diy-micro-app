import { defineElement } from './element';
import { EventCenterForBaseApp } from './data'

const BaseAppData = new EventCenterForBaseApp()

const rawSetAttribute = Element.prototype.setAttribute

Element.prototype.setAttribute = function setAttribute (key, value) {
  // 目标为 micro-app 标签且属性名称为 data 时进行处理
  if (/^micro-app/i.test(this.tagName) && key === 'data') {
    if (toString.call(value) === '[object Object]') {
      // 克隆一个新的对象
      const cloneValue = {}
      Object.getOwnPropertyNames(value).forEach((propertyKey) => {
        // 过滤vue框架注入的数据
        if (!(typeof propertyKey === 'string' && propertyKey.indexOf('__') === 0)) {
          cloneValue[propertyKey] = value[propertyKey]
        }
      })
      // 发送数据
      BaseAppData.setData(this.getAttribute('name'), cloneValue)
    }
  } else {
    rawSetAttribute.call(this, key, value)
  }
}

const DiyMicroApp = {
  start() {
    defineElement()
  }
}

export default DiyMicroApp
