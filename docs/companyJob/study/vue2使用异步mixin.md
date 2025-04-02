# vue2使用异步mixin

创建一个高阶组件,在其中异步加载mixin并应用到原始组件:

```javascript
export function withAsyncMixin(component) {
  return {
    data() {
      return {
        asyncMixin: null
      }
    },
    async created() {
      const { default: myMixin } = await import('./myMixin.js');
      this.asyncMixin = myMixin;
    },
    render(h) {
      const ComponentWithMixin = {
        mixins: [this.asyncMixin].filter(Boolean),
        extends: component
      };
      return h(ComponentWithMixin);
    }
  }
}

// 使用
import MyComponent from './MyComponent.vue';
export default withAsyncMixin(MyComponent);
```