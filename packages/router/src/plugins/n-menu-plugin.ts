import type { MenuOption } from 'naive-ui'
import type { VNodeChild } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import type { ProRouterPlugin } from '../plugin'
import { Icon } from '@iconify/vue'
import { mapTree } from 'pro-composables'
import { computed, h } from 'vue'
import { normalizeRouteName } from '../utils/normalize-route-name'

declare module 'vue-router' {
  interface RouteMeta {
    /**
     * 菜单标题
     */
    title?: string
    /**
     * 菜单图标
     */
    icon?: string
    /**
     * 是否不在菜单中显示
     * @default false
     */
    hideInMenu?: boolean
    /**
     * 菜单排序，越小越靠前
     */
    order?: number
  }

  interface Router {
    /**
     * 根据路由数据构建菜单
     */
    buildMenus: () => MenuOption[]
  }
}

type MaybePromise<T> = T | Promise<T>

interface NMenuPluginOptions {
  service: () => MaybePromise<{
    routes: Omit<RouteRecordRaw, 'component'>[]
    resolveIcon?: (icon: string) => VNodeChild
  }>
}

export function nMenuPlugin({ service }: NMenuPluginOptions): ProRouterPlugin {
  return ({ router, onUnmount }) => {
    router.beforeResolve(async () => {
      const {
        routes,
        resolveIcon,
      } = await service()

      if (!router.buildMenus) {
        const routeNameToPathMap = computed(() => {
          return router
            .getRoutes()
            .reduce<Map<string, string>>((p, { name, path }) => {
              p.set(normalizeRouteName(name), path)
              return p
            }, new Map())
        })

        const finalMenus = computed(() => {
          return mapTree(sortRoutesByMetaOrder([...routes]), ({
            name,
            meta,
            children = [],
          }) => {
            const {
              icon,
              title,
              hideInMenu = false,
            } = meta
            const normalizedName = normalizeRouteName(name)
            const menu: MenuOption = {
              show: !hideInMenu,
              label: title ?? normalizedName,
              key: routeNameToPathMap.value.get(normalizedName),
            }
            if (icon) {
              menu.icon = () => {
                return resolveIcon
                  ? resolveIcon(icon)
                  : builtinResolveIcon(icon)
              }
            }
            if (children.length > 0) {
              menu.children = sortRoutesByMetaOrder(children) as any
            }
            return menu
          }, 'children')
        })

        router.buildMenus = () => {
          return finalMenus.value
        }

        onUnmount(() => {
          delete router.buildMenus
        })
      }
    })
  }
}

function builtinResolveIcon(icon: string) {
  return h(Icon, {
    icon,
    width: 18,
    height: 18,
  })
}

function sortRoutesByMetaOrder(routes: Omit<RouteRecordRaw, 'component'>[]) {
  return routes.sort((a, b) => {
    return (a.meta.order ?? Number.MAX_SAFE_INTEGER) - (b.meta.order ?? Number.MAX_SAFE_INTEGER)
  })
}
