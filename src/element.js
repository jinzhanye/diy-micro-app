import CreateApp, { appInstanceMap } from './app'

class MyElement extends HTMLElement {
  // 声明需要监听的属性名，只有这些属性变化时才会触发attributeChangedCallback
  static get observedAttributes () {
    return ['name', 'url']
  }

  constructor() {
    super();
  }

  connectedCallback() {
    // 元素被插入到DOM时执行，此时去加载子应用的静态资源并渲染
    console.log('micro-app is connected')

    // 创建微应用实例
    const app = new CreateApp({
      name: this.name,
      url: this.url,
      container: this,
    })

    // 记入缓存，用于后续功能
    appInstanceMap.set(this.name, app)
  }

  disconnectedCallback () {
    const app = appInstanceMap.get(this.name)

    // 元素从DOM中删除时执行，此时进行一些卸载操作
    console.log('micro-app has disconnected')
    app.unmount(this.hasAttribute('destory'))
  }

  attributeChangedCallback (attrName, oldVal, newVal) {
    // 元素属性发生变化时执行，可以获取name、url等属性的值
    console.log(`attribute ${attrName}: ${newVal}`)

    // 分别记录name及url的值
    if (attrName === 'name' && !this.name && newVal) {
      this.name = newVal
    } else if (attrName === 'url' && !this.url && newVal) {
      this.url = newVal
    }
  }
}

export function defineElement () {
  // 如果已经定义过，则忽略
  if (!window.customElements.get('micro-app')) {
    window.customElements.define('micro-app', MyElement)
  }
}

