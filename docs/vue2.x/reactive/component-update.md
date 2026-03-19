# 扈�ｻｶ譖ｴ譁ｰ

蝨ｨ扈�ｻｶ蛹也ｫ�闃ゑｼ梧�莉ｬ莉狗ｻ堺ｺ� Vue 逧�ｻ�ｻｶ蛹門ｮ樒鴫霑�ｨ具ｼ御ｸ崎ｿ��莉ｬ蜿ｪ隶ｲ莠� Vue 扈�ｻｶ逧��蟒ｺ霑�ｨ具ｼ悟ｹｶ豐｡譛画ｶ牙所蛻ｰ扈�ｻｶ謨ｰ謐ｮ蜿醍函蜿伜喧�梧峩譁ｰ扈�ｻｶ逧�ｿ�ｨ九り碁夊ｿ��莉ｬ霑吩ｸ遶�蟇ｹ謨ｰ謐ｮ蜩榊ｺ泌ｼ丞次逅�噪蛻�梵�御ｺ�ｧ｣蛻ｰ蠖捺焚謐ｮ蜿醍函蜿伜喧逧�慮蛟呻ｼ御ｼ夊ｧｦ蜿第ｸｲ譟?`watcher` 逧�屓隹��謨ｰ�瑚ｿ幄梧鴬陦檎ｻ�ｻｶ逧�峩譁ｰ霑�ｨ具ｼ梧磁荳区擂謌台ｻｬ譚･隸ｦ扈��譫占ｿ吩ｸ霑�ｨ九?

```js
updateComponent = () => {
  vm._update(vm._render(), hydrating)
}
new Watcher(vm, updateComponent, noop, {
  before () {
    if (vm._isMounted) {
      callHook(vm, 'beforeUpdate')
    }
  }
}, true /* isRenderWatcher */)
```

扈�ｻｶ逧�峩譁ｰ霑俶弍隹�畑莠� `vm._update` 譁ｹ豕包ｼ梧�莉ｬ蜀榊屓鬘ｾ荳荳玖ｿ吩ｸｪ譁ｹ豕包ｼ悟ｮ�噪螳壻ｹ牙�?`src/core/instance/lifecycle.js` 荳ｭ��

```js
Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
  const vm: Component = this
  // ...
  const prevVnode = vm._vnode
  if (!prevVnode) {
     // initial render
    vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
  } else {
    // updates
    vm.$el = vm.__patch__(prevVnode, vnode)
  }
  // ...
}
```

扈�ｻｶ譖ｴ譁ｰ逧�ｿ�ｨ具ｼ御ｼ壽鴬陦?`vm.$el = vm.__patch__(prevVnode, vnode)`�悟ｮ�ｻ咲┯莨夊ｰ��?`patch` 蜃ｽ謨ｰ�悟惠 `src/core/vdom/patch.js` 荳ｭ螳壻ｹ会ｼ�

```js
return function patch (oldVnode, vnode, hydrating, removeOnly) {
  if (isUndef(vnode)) {
    if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
    return
  }

  let isInitialPatch = false
  const insertedVnodeQueue = []

  if (isUndef(oldVnode)) {
    // empty mount (likely as component), create new root element
    isInitialPatch = true
    createElm(vnode, insertedVnodeQueue)
  } else {
    const isRealElement = isDef(oldVnode.nodeType)
    if (!isRealElement && sameVnode(oldVnode, vnode)) {
      // patch existing root node
      patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly)
    } else {
      if (isRealElement) {
         // ...
      }

      // replacing existing element
      const oldElm = oldVnode.elm
      const parentElm = nodeOps.parentNode(oldElm)

      // create new node
      createElm(
        vnode,
        insertedVnodeQueue,
        // extremely rare edge case: do not insert if old element is in a
        // leaving transition. Only happens when combining transition +
        // keep-alive + HOCs. (#4590)
        oldElm._leaveCb ? null : parentElm,
        nodeOps.nextSibling(oldElm)
      )

      // update parent placeholder node element, recursively
      if (isDef(vnode.parent)) {
        let ancestor = vnode.parent
        const patchable = isPatchable(vnode)
        while (ancestor) {
          for (let i = 0; i < cbs.destroy.length; ++i) {
            cbs.destroy[i](ancestor)
          }
          ancestor.elm = vnode.elm
          if (patchable) {
            for (let i = 0; i < cbs.create.length; ++i) {
              cbs.create[i](emptyNode, ancestor)
            }
            // #6513
            // invoke insert hooks that may have been merged by create hooks.
            // e.g. for directives that uses the "inserted" hook.
            const insert = ancestor.data.hook.insert
            if (insert.merged) {
              // start at index 1 to avoid re-invoking component mounted hook
              for (let i = 1; i < insert.fns.length; i++) {
                insert.fns[i]()
              }
            }
          } else {
            registerRef(ancestor)
          }
          ancestor = ancestor.parent
        }
      }

      // destroy old node
      if (isDef(parentElm)) {
        removeVnodes(parentElm, [oldVnode], 0, 0)
      } else if (isDef(oldVnode.tag)) {
        invokeDestroyHook(oldVnode)
      }
    }
  }

  invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
  return vnode.elm
}
```
霑咎㈹謇ｧ陦� `patch` 逧�ｻ霎大柱鬥匁ｬ｡貂ｲ譟捺弍荳堺ｸ譬ｷ逧�ｼ悟屏荳?`oldVnode` 荳堺ｸｺ遨ｺ�悟ｹｶ荳泌ｮ�柱 `vnode` 驛ｽ譏ｯ VNode 邀ｻ蝙具ｼ梧磁荳区擂莨夐夊ｿ� `sameVNode(oldVnode, vnode)` 蛻､譁ｭ螳�ｻｬ譏ｯ蜷ｦ譏ｯ逶ｸ蜷檎噪 VNode 譚･蜀ｳ螳夊ｵｰ荳榊酔逧�峩譁ｰ騾ｻ霎托ｼ?

```js
function sameVnode (a, b) {
  return (
    a.key === b.key && (
      (
        a.tag === b.tag &&
        a.isComment === b.isComment &&
        isDef(a.data) === isDef(b.data) &&
        sameInputType(a, b)
      ) || (
        isTrue(a.isAsyncPlaceholder) &&
        a.asyncFactory === b.asyncFactory &&
        isUndef(b.asyncFactory.error)
      )
    )
  )
}
```
`sameVnode` 逧�ｻ霎鷹撼蟶ｸ邂蜊包ｼ悟ｦよ棡荳､荳ｪ `vnode` 逧?`key` 荳咲嶌遲会ｼ悟�譏ｯ荳榊酔逧�ｼ帛凄蛻咏ｻｧ扈ｭ蛻､譁ｭ蟇ｹ莠主酔豁･扈�ｻｶ�悟�蛻､譁ｭ `isComment`縲～data`縲～input` 邀ｻ蝙狗ｭ画弍蜷ｦ逶ｸ蜷鯉ｼ悟ｯｹ莠主ｼよｭ･扈�ｻｶ�悟�蛻､譁ｭ `asyncFactory` 譏ｯ蜷ｦ逶ｸ蜷後?

謇莉･譬ｹ謐ｮ譁ｰ譌?`vnode` 譏ｯ蜷ｦ荳?`sameVnode`�御ｼ夊ｵｰ蛻ｰ荳榊酔逧�峩譁ｰ騾ｻ霎托ｼ梧�莉ｬ蜈域擂隸ｴ荳荳倶ｸ榊酔逧�ュ蜀ｵ縲?

## 譁ｰ譌ｧ闃らせ荳榊酔

螯よ棡譁ｰ譌ｧ `vnode` 荳榊酔�碁ぅ荵域峩譁ｰ逧�ｻ霎鷹撼蟶ｸ邂蜊包ｼ悟ｮ�悽雍ｨ荳頑弍隕∵崛謐｢蟾ｲ蟄伜惠逧�鰍轤ｹ�悟､ｧ閾ｴ蛻�ｸ?3 豁?

- 蛻帛ｻｺ譁ｰ闃ら�?

```js
const oldElm = oldVnode.elm
const parentElm = nodeOps.parentNode(oldElm)
// create new node
createElm(
  vnode,
  insertedVnodeQueue,
  // extremely rare edge case: do not insert if old element is in a
  // leaving transition. Only happens when combining  transition +
  // keep-alive + HOCs. (#4590)
  oldElm._leaveCb ? null : parentElm,
  nodeOps.nextSibling(oldElm)
)
```

莉･蠖灘燕譌ｧ闃らせ荳ｺ蜿り�鰍轤ｹ�悟�蟒ｺ譁ｰ逧�鰍轤ｹ�悟ｹｶ謠貞�蛻?DOM 荳ｭ�形createElm` 逧�ｻ霎第�莉ｬ荵句燕蛻�梵霑�?

- 譖ｴ譁ｰ辷ｶ逧�頃菴咲ｬｦ闃ら�?

```js
// update parent placeholder node element, recursively
if (isDef(vnode.parent)) {
  let ancestor = vnode.parent
  const patchable = isPatchable(vnode)
  while (ancestor) {
    for (let i = 0; i < cbs.destroy.length; ++i) {
      cbs.destroy[i](ancestor)
    }
    ancestor.elm = vnode.elm
    if (patchable) {
      for (let i = 0; i < cbs.create.length; ++i) {
        cbs.create[i](emptyNode, ancestor)
      }
      // #6513
      // invoke insert hooks that may have been merged by create hooks.
      // e.g. for directives that uses the "inserted" hook.
      const insert = ancestor.data.hook.insert
      if (insert.merged) {
        // start at index 1 to avoid re-invoking component mounted hook
        for (let i = 1; i < insert.fns.length; i++) {
          insert.fns[i]()
        }
      }
    } else {
      registerRef(ancestor)
    }
    ancestor = ancestor.parent
  }
}
```
謌台ｻｬ蜿ｪ蜈ｳ豕ｨ荳ｻ隕�ｻ霎大叉蜿ｯ�梧伽蛻ｰ蠖灘�?`vnode` 逧�宛逧�頃菴咲ｬｦ闃らせ�悟�謇ｧ陦悟推荳ｪ `module` 逧?`destroy` 逧�朝蟄仙�謨ｰ�悟ｦよ棡蠖灘燕蜊�菴咲ｬｦ譏ｯ荳荳ｪ蜿ｯ謖りｽｽ逧�鰍轤ｹ�悟�謇ｧ陦?`module` 逧?`create` 髓ｩ蟄仙�謨ｰ縲ょｯｹ莠手ｿ吩ｺ幃朝蟄仙�謨ｰ逧�ｽ懃畑�悟惠荵句錘逧�ｫ�闃ゆｼ夊ｯｦ扈�ｻ狗ｻ阪?

- 蛻�髯､譌ｧ闃ら�?

```js
// destroy old node
if (isDef(parentElm)) {
  removeVnodes(parentElm, [oldVnode], 0, 0)
} else if (isDef(oldVnode.tag)) {
  invokeDestroyHook(oldVnode)
}
```
謚?`oldVnode` 莉主ｽ灘�?DOM 譬台ｸｭ蛻�髯､�悟ｦよ棡辷ｶ闃らせ蟄伜惠�悟�謇ｧ陦� `removeVnodes` 譁ｹ豕包ｼ?

```js
function removeVnodes (parentElm, vnodes, startIdx, endIdx) {
  for (; startIdx <= endIdx; ++startIdx) {
    const ch = vnodes[startIdx]
    if (isDef(ch)) {
      if (isDef(ch.tag)) {
        removeAndInvokeRemoveHook(ch)
        invokeDestroyHook(ch)
      } else { // Text node
        removeNode(ch.elm)
      }
    }
  }
}

function removeAndInvokeRemoveHook (vnode, rm) {
  if (isDef(rm) || isDef(vnode.data)) {
    let i
    const listeners = cbs.remove.length + 1
    if (isDef(rm)) {
      // we have a recursively passed down rm callback
      // increase the listeners count
      rm.listeners += listeners
    } else {
      // directly removing
      rm = createRmCb(vnode.elm, listeners)
    }
    // recursively invoke hooks on child component root node
    if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
      removeAndInvokeRemoveHook(i, rm)
    }
    for (i = 0; i < cbs.remove.length; ++i) {
      cbs.remove[i](vnode, rm)
    }
    if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
      i(vnode, rm)
    } else {
      rm()
    }
  } else {
    removeNode(vnode.elm)
  }
}

function invokeDestroyHook (vnode) {
  let i, j
  const data = vnode.data
  if (isDef(data)) {
    if (isDef(i = data.hook) && isDef(i = i.destroy)) i(vnode)
    for (i = 0; i < cbs.destroy.length; ++i) cbs.destroy[i](vnode)
  }
  if (isDef(i = vnode.children)) {
    for (j = 0; j < vnode.children.length; ++j) {
      invokeDestroyHook(vnode.children[j])
    }
  }
}
```

蛻�髯､闃らせ騾ｻ霎大ｾ育ｮ蜊包ｼ悟ｰｱ譏ｯ驕榊紙蠕�唖髯､逧� `vnodes` 蛛壼唖髯､�悟�荳ｭ `removeAndInvokeRemoveHook`  逧�ｽ懃畑譏ｯ莉?DOM 荳ｭ遘ｻ髯､闃らせ蟷ｶ謇ｧ陦� `module` 逧?`remove` 髓ｩ蟄仙�謨ｰ�悟ｹｶ蟇ｹ螳�噪蟄占鰍轤ｹ騾貞ｽ定ｰ�畑 `removeAndInvokeRemoveHook` 蜃ｽ謨ｰ�嫣invokeDestroyHook` 譏ｯ謇ｧ陦?`module` 逧?`destory` 髓ｩ蟄仙�謨ｰ莉･蜿� `vnode` 逧?`destory` 髓ｩ蟄仙�謨ｰ�悟ｹｶ蟇ｹ螳�噪蟄� `vnode` 騾貞ｽ定ｰ�畑 `invokeDestroyHook` 蜃ｽ謨ｰ�嫣removeNode` 蟆ｱ譏ｯ隹�畑蟷ｳ蜿ｰ逧?DOM API 蜴ｻ謚顔悄豁｣逧?DOM 闃らせ遘ｻ髯､縲?

蝨ｨ荵句燕莉狗ｻ咲ｻ�ｻｶ逕溷多蜻ｨ譛溽噪譌ｶ蛟呎署蛻?`beforeDestroy & destroyed` 霑吩ｸ､荳ｪ逕溷多蜻ｨ譛滄朝蟄仙�謨ｰ�悟ｮ�ｻｬ蟆ｱ譏ｯ蝨ｨ謇ｧ陦?`invokeDestroyHook` 霑�ｨ倶ｸｭ�梧鴬陦御ｺ?`vnode` 逧?`destory` 髓ｩ蟄仙�謨ｰ�悟ｮ�噪螳壻ｹ牙惠 `src/core/vdom/create-component.js` 荳ｭ��

```js
const componentVNodeHooks = {
  destroy (vnode: MountedComponentVNode) {
    const { componentInstance } = vnode
    if (!componentInstance._isDestroyed) {
      if (!vnode.data.keepAlive) {
        componentInstance.$destroy()
      } else {
        deactivateChildComponent(componentInstance, true /* direct */)
      }
    }
  }
}
```

蠖鍋ｻ�ｻｶ蟷ｶ荳肴弍 `keepAlive` 逧�慮蛟呻ｼ御ｼ壽鴬陦?`componentInstance.$destroy()` 譁ｹ豕包ｼ檎┯蜷主ｰｱ莨壽鴬陦?`beforeDestroy & destroyed` 荳､荳ｪ髓ｩ蟄仙�謨ｰ縲?

## 譁ｰ譌ｧ闃らせ逶ｸ蜷�

蟇ｹ莠取眠譌ｧ闃らせ荳榊酔逧�ュ蜀ｵ�瑚ｿ咏ｧ榊�蟒ｺ譁ｰ闃ら�?-> 譖ｴ譁ｰ蜊�菴咲ｬｦ闃ら�?-> 蛻�髯､譌ｧ闃らせ逧�ｻ霎第弍蠕亥ｮｹ譏鍋炊隗｣逧�りｿ俶怏荳遘咲ｻ�ｻ?`vnode` 逧�峩譁ｰ諠��譏ｯ譁ｰ譌ｧ闃らせ逶ｸ蜷鯉ｼ悟ｮ�ｼ夊ｰ��?`patchVNode` 譁ｹ豕包ｼ悟ｮ�噪螳壻ｹ牙惠 `src/core/vdom/patch.js` 荳ｭ��

```js
function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {
  if (oldVnode === vnode) {
    return
  }

  const elm = vnode.elm = oldVnode.elm

  if (isTrue(oldVnode.isAsyncPlaceholder)) {
    if (isDef(vnode.asyncFactory.resolved)) {
      hydrate(oldVnode.elm, vnode, insertedVnodeQueue)
    } else {
      vnode.isAsyncPlaceholder = true
    }
    return
  }

  // reuse element for static trees.
  // note we only do this if the vnode is cloned -
  // if the new node is not cloned it means the render functions have been
  // reset by the hot-reload-api and we need to do a proper re-render.
  if (isTrue(vnode.isStatic) &&
    isTrue(oldVnode.isStatic) &&
    vnode.key === oldVnode.key &&
    (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
  ) {
    vnode.componentInstance = oldVnode.componentInstance
    return
  }

  let i
  const data = vnode.data
  if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
    i(oldVnode, vnode)
  }

  const oldCh = oldVnode.children
  const ch = vnode.children
  if (isDef(data) && isPatchable(vnode)) {
    for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
    if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
  }
  if (isUndef(vnode.text)) {
    if (isDef(oldCh) && isDef(ch)) {
      if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
    } else if (isDef(ch)) {
      if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
      addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
    } else if (isDef(oldCh)) {
      removeVnodes(elm, oldCh, 0, oldCh.length - 1)
    } else if (isDef(oldVnode.text)) {
      nodeOps.setTextContent(elm, '')
    }
  } else if (oldVnode.text !== vnode.text) {
    nodeOps.setTextContent(elm, vnode.text)
  }
  if (isDef(data)) {
    if (isDef(i = data.hook) && isDef(i = i.postpatch)) i(oldVnode, vnode)
  }
}
```
`patchVnode` 逧�ｽ懃畑蟆ｱ譏ｯ謚頑眠逧� `vnode` `patch` 蛻ｰ譌ｧ逧?`vnode` 荳奇ｼ瑚ｿ咎㈹謌台ｻｬ蜿ｪ蜈ｳ豕ｨ蜈ｳ髞ｮ逧��ｸ蠢�ｻ霎托ｼ梧�謚雁ｮ�究謌仙屁豁･鬪､��

- 謇ｧ陦� `prepatch` 髓ｩ蟄仙�謨ｰ

```js
let i
const data = vnode.data
if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
  i(oldVnode, vnode)
}
```

蠖捺峩譁ｰ逧� `vnode` 譏ｯ荳荳ｪ扈�ｻ?`vnode` 逧�慮蛟呻ｼ御ｼ壽鴬陦?`prepatch` 逧�婿豕包ｼ悟ｮ�噪螳壻ｹ牙�?`src/core/vdom/create-component.js` 荳ｭ��

```js
const componentVNodeHooks = {
  prepatch (oldVnode: MountedComponentVNode, vnode: MountedComponentVNode) {
    const options = vnode.componentOptions
    const child = vnode.componentInstance = oldVnode.componentInstance
    updateChildComponent(
      child,
      options.propsData, // updated props
      options.listeners, // updated listeners
      vnode, // new parent vnode
      options.children // new children
    )
  }
}
```

`prepatch` 譁ｹ豕募ｰｱ譏ｯ諡ｿ蛻ｰ譁ｰ逧� `vnode` 逧�ｻ�ｻｶ驟咲ｽｮ莉･蜿顔ｻ�ｻｶ螳樔ｾ具ｼ悟悉謇ｧ陦?`updateChildComponent` 譁ｹ豕包ｼ悟ｮ�噪螳壻ｹ牙惠 `src/core/instance/lifecycle.js` 荳ｭ��

```js
export function updateChildComponent (
  vm: Component,
  propsData: ?Object,
  listeners: ?Object,
  parentVnode: MountedComponentVNode,
  renderChildren: ?Array<VNode>
) {
  if (process.env.NODE_ENV !== 'production') {
    isUpdatingChildComponent = true
  }

  // determine whether component has slot children
  // we need to do this before overwriting $options._renderChildren
  const hasChildren = !!(
    renderChildren ||               // has new static slots
    vm.$options._renderChildren ||  // has old static slots
    parentVnode.data.scopedSlots || // has new scoped slots
    vm.$scopedSlots !== emptyObject // has old scoped slots
  )

  vm.$options._parentVnode = parentVnode
  vm.$vnode = parentVnode // update vm's placeholder node without re-render

  if (vm._vnode) { // update child tree's parent
    vm._vnode.parent = parentVnode
  }
  vm.$options._renderChildren = renderChildren

  // update $attrs and $listeners hash
  // these are also reactive so they may trigger child update if the child
  // used them during render
  vm.$attrs = parentVnode.data.attrs || emptyObject
  vm.$listeners = listeners || emptyObject

  // update props
  if (propsData && vm.$options.props) {
    toggleObserving(false)
    const props = vm._props
    const propKeys = vm.$options._propKeys || []
    for (let i = 0; i < propKeys.length; i++) {
      const key = propKeys[i]
      const propOptions: any = vm.$options.props // wtf flow?
      props[key] = validateProp(key, propOptions, propsData, vm)
    }
    toggleObserving(true)
    // keep a copy of raw propsData
    vm.$options.propsData = propsData
  }

  // update listeners
  listeners = listeners || emptyObject
  const oldListeners = vm.$options._parentListeners
  vm.$options._parentListeners = listeners
  updateComponentListeners(vm, listeners, oldListeners)

  // resolve slots + force update if has children
  if (hasChildren) {
    vm.$slots = resolveSlots(renderChildren, parentVnode.context)
    vm.$forceUpdate()
  }

  if (process.env.NODE_ENV !== 'production') {
    isUpdatingChildComponent = false
  }
}
```

`updateChildComponent` 逧�ｻ霎台ｹ滄撼蟶ｸ邂蜊包ｼ檎罰莠取峩譁ｰ莠?`vnode`�碁ぅ荵?`vnode` 蟇ｹ蠎皮噪螳樔ｾ?`vm` 逧�ｸ邉ｻ蛻怜ｱ樊ｧ荵滉ｼ壼書逕溷序蛹厄ｼ悟桁諡ｬ蜊�菴咲ｬ?`vm.$vnode` 逧�峩譁ｰ縲～slot` 逧�峩譁ｰ�形listeners` 逧�峩譁ｰ�形props` 逧�峩譁ｰ遲臥ｭ峨?

- 謇ｧ陦� `update` 髓ｩ蟄仙�謨ｰ

```js
if (isDef(data) && isPatchable(vnode)) {
  for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
  if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
}
```

蝗槫芦 `patchVNode` 蜃ｽ謨ｰ�悟惠謇ｧ陦悟ｮ梧眠逧?`vnode` 逧?`prepatch` 髓ｩ蟄仙�謨ｰ�御ｼ壽鴬陦梧園譛?`module` 逧?`update` 髓ｩ蟄仙�謨ｰ莉･蜿顔畑謌ｷ閾ｪ螳壻ｹ?`update` 髓ｩ蟄仙�謨ｰ�悟ｯｹ莠?`module` 逧�朝蟄仙�謨ｰ�御ｹ句錘謌台ｻｬ莨壽怏蜈ｷ菴鍋噪遶�闃る宙蟇ｹ荳莠帛�菴鍋噪 case 蛻�梵縲?

- 螳梧� `patch` 霑�ｨ�

```js
const oldCh = oldVnode.children
const ch = vnode.children
if (isDef(data) && isPatchable(vnode)) {
  for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
  if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
}
if (isUndef(vnode.text)) {
  if (isDef(oldCh) && isDef(ch)) {
    if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
  } else if (isDef(ch)) {
    if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
    addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
  } else if (isDef(oldCh)) {
    removeVnodes(elm, oldCh, 0, oldCh.length - 1)
  } else if (isDef(oldVnode.text)) {
    nodeOps.setTextContent(elm, '')
  }
} else if (oldVnode.text !== vnode.text) {
  nodeOps.setTextContent(elm, vnode.text)
}
```

螯よ棡 `vnode` 譏ｯ荳ｪ譁�悽闃らせ荳疲眠譌ｧ譁�悽荳咲嶌蜷鯉ｼ悟�逶ｴ謗･譖ｿ謐｢譁�悽蜀�ｮｹ縲ょｦよ棡荳肴弍譁�悽闃らせ�悟�蛻､譁ｭ螳�ｻｬ逧�ｭ占鰍轤ｹ�悟ｹｶ蛻�ｺ��遘肴ュ蜀ｵ螟�炊��

1. `oldCh` 荳?`ch` 驛ｽ蟄伜惠荳比ｸ咲嶌蜷梧慮�御ｽｿ逕?`updateChildren` 蜃ｽ謨ｰ譚･譖ｴ譁ｰ蟄占鰍轤ｹ�瑚ｿ吩ｸｪ蜷朱擇驥咲せ隶ｲ縲?

2.螯よ棡蜿ｪ譛� `ch` 蟄伜惠�瑚｡ｨ遉ｺ譌ｧ闃らせ荳埼怙隕∽ｺ�ょｦよ棡譌ｧ逧�鰍轤ｹ譏ｯ譁�悽闃らせ蛻吝�蟆�鰍轤ｹ逧�枚譛ｬ貂�勁�檎┯蜷朱夊ｿ� `addVnodes` 蟆?`ch` 謇ｹ驥乗薯蜈･蛻ｰ譁ｰ闃らせ `elm` 荳九?
                    
3.螯よ棡蜿ｪ譛� `oldCh` 蟄伜惠�瑚｡ｨ遉ｺ譖ｴ譁ｰ逧�弍遨ｺ闃らせ�悟�髴隕∝ｰ�立逧�鰍轤ｹ騾夊ｿ� `removeVnodes` 蜈ｨ驛ｨ貂�勁縲?
          
4.蠖灘宵譛画立闃らせ譏ｯ譁�悽闃らせ逧�慮蛟呻ｼ悟�貂�勁蜈ｶ闃らせ譁�悽蜀�ｮｹ縲?

- 謇ｧ陦� `postpatch` 髓ｩ蟄仙�謨ｰ

```js
if (isDef(data)) {
  if (isDef(i = data.hook) && isDef(i = i.postpatch)) i(oldVnode, vnode)
}
```
蜀肴鴬陦悟ｮ� `patch` 霑�ｨ句錘�御ｼ壽鴬陦?`postpatch` 髓ｩ蟄仙�謨ｰ�悟ｮ�弍扈�ｻｶ閾ｪ螳壻ｹ臥噪髓ｩ蟄仙�謨ｰ�梧怏蛻呎鴬陦後?

驍｣荵亥惠謨ｴ荳?`pathVnode` 霑�ｨ倶ｸｭ�梧怙螟肴揩逧�ｰｱ譏?`updateChildren` 譁ｹ豕穂ｺ�ｼ御ｸ矩擇謌台ｻｬ譚･蜊慕峡莉狗ｻ榊ｮ�?

## updateChildren

```js
function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
  let oldStartIdx = 0
  let newStartIdx = 0
  let oldEndIdx = oldCh.length - 1
  let oldStartVnode = oldCh[0]
  let oldEndVnode = oldCh[oldEndIdx]
  let newEndIdx = newCh.length - 1
  let newStartVnode = newCh[0]
  let newEndVnode = newCh[newEndIdx]
  let oldKeyToIdx, idxInOld, vnodeToMove, refElm

  // removeOnly is a special flag used only by <transition-group>
  // to ensure removed elements stay in correct relative positions
  // during leaving transitions
  const canMove = !removeOnly

  if (process.env.NODE_ENV !== 'production') {
    checkDuplicateKeys(newCh)
  }

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (isUndef(oldStartVnode)) {
      oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
    } else if (isUndef(oldEndVnode)) {
      oldEndVnode = oldCh[--oldEndIdx]
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
      oldStartVnode = oldCh[++oldStartIdx]
      newStartVnode = newCh[++newStartIdx]
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue)
      oldEndVnode = oldCh[--oldEndIdx]
      newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
      patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue)
      canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
      oldStartVnode = oldCh[++oldStartIdx]
      newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
      patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
      canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
      oldEndVnode = oldCh[--oldEndIdx]
      newStartVnode = newCh[++newStartIdx]
    } else {
      if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
      idxInOld = isDef(newStartVnode.key)
        ? oldKeyToIdx[newStartVnode.key]
        : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
      if (isUndef(idxInOld)) { // New element
        createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
      } else {
        vnodeToMove = oldCh[idxInOld]
        if (sameVnode(vnodeToMove, newStartVnode)) {
          patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue)
          oldCh[idxInOld] = undefined
          canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
        } else {
          // same key but different element. treat as new element
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
        }
      }
      newStartVnode = newCh[++newStartIdx]
    }
  }
  if (oldStartIdx > oldEndIdx) {
    refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
    addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
  } else if (newStartIdx > newEndIdx) {
    removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
  }
}
```

`updateChildren` 逧�ｻ霎第ｯ碑ｾ�､肴揩�檎峩謗･隸ｻ貅千�∵ｯ碑ｾ�勗豸ｩ�梧�莉ｬ蜿ｯ莉･騾夊ｿ�ｸ荳ｪ蜈ｷ菴鍋噪遉ｺ萓区擂蛻�梵螳�?

```js
<template>
  <div id="app">
    <div>
      <ul>
        <li v-for="item in items" :key="item.id">{{ item.val }}</li>
      </ul>
    </div>
    <button @click="change">change</button>
  </div>
</template>

<script>
  export default {
    name: 'App',
    data() {
      return {
        items: [
          {id: 0, val: 'A'},
          {id: 1, val: 'B'},
          {id: 2, val: 'C'},
          {id: 3, val: 'D'}
        ]
      }
    },
    methods: {
      change() {
        this.items.reverse().push({id: 4, val: 'E'})
      }
    }
  }
</script>
```

蠖捺�莉ｬ轤ｹ蜃?`change` 謖蛾聴蜴ｻ謾ｹ蜿俶焚謐ｮ�梧怙扈井ｼ壽鴬陦悟�?`updateChildren` 蜴ｻ譖ｴ譁?`li` 驛ｨ蛻�噪蛻苓｡ｨ謨ｰ謐ｮ�梧�莉ｬ騾夊ｿ�崟逧�婿蠑乗擂謠剰ｿｰ荳荳句ｮ�噪譖ｴ譁ｰ霑�ｨ具ｼ�

隨ｬ荳豁･��
<img src="/assets/update-children-1.png">

隨ｬ莠梧ｭ･��
<img src="/assets/update-children-2.png">

隨ｬ荳画ｭ･��
<img src="/assets/update-children-3.png">

隨ｬ蝗帶ｭ･��
<img src="/assets/update-children-4.png">

隨ｬ莠疲ｭ･��
<img src="/assets/update-children-5.png">

隨ｬ蜈ｭ豁･��
<img src="/assets/update-children-6.png">

## 諤ｻ扈�

扈�ｻｶ譖ｴ譁ｰ逧�ｿ�ｨ区�ｸ蠢�ｰｱ譏ｯ譁ｰ譌?vnode diff�悟ｯｹ譁ｰ譌ｧ闃らせ逶ｸ蜷御ｻ･蜿贋ｸ榊酔逧�ュ蜀ｵ蛻�悪蛛壻ｸ榊酔逧�､�炊縲よ眠譌ｧ闃らせ荳榊酔逧�峩譁ｰ豬∫ｨ区弍蛻帛ｻｺ譁ｰ闃らせ->譖ｴ譁ｰ辷ｶ蜊�菴咲ｬｦ闃らせ->蛻�髯､譌ｧ闃らせ�幄梧眠譌ｧ闃らせ逶ｸ蜷檎噪譖ｴ譁ｰ豬∫ｨ区弍蜴ｻ闔ｷ蜿門ｮ�ｻｬ逧?children�梧�ｹ謐ｮ荳榊酔諠��蛛壻ｸ榊酔逧�峩譁ｰ騾ｻ霎代よ怙螟肴揩逧�ュ蜀ｵ譏ｯ譁ｰ譌ｧ闃らせ逶ｸ蜷御ｸ泌ｮ�ｻｬ驛ｽ蟄伜惠蟄占鰍轤ｹ�碁ぅ荵井ｼ壽鴬陦?`updateChildren` 騾ｻ霎托ｼ瑚ｿ吝摎蜆ｿ蜿ｯ莉･蛟溷勧逕ｻ蝗ｾ逧�婿蠑城�蜷育炊隗｣縲?

