/**
 * Hugeicons для Vue/Nuxt.
 *
 * Установлены пакеты `@hugeicons/vue` (рендер) и `@hugeicons/core-free-icons` (5100+ free-иконок).
 * Иконки импортируются по имени — tree-shaking сохраняет размер бандла.
 *
 * @example Базовое использование (компонент автo-регистрируется Nuxt из `shared/ui`)
 * ```vue
 * <script setup lang="ts">
 * import { SearchIcon } from '@hugeicons/core-free-icons'
 * </script>
 *
 * <template>
 *   <HugeIcon :icon="SearchIcon" class="text-primary" :size="20" />
 * </template>
 * ```
 *
 * @example Переключение иконки по состоянию
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue'
 * import { SunIcon, Moon02Icon } from '@hugeicons/core-free-icons'
 *
 * const isDark = ref(false)
 * </script>
 *
 * <template>
 *   <button type="button" @click="isDark = !isDark">
 *     <HugeIcon :icon="SunIcon" :alt-icon="Moon02Icon" :show-alt="isDark" />
 *   </button>
 * </template>
 * ```
 *
 * @example Прямой рендер без обёртки
 * ```vue
 * <script setup lang="ts">
 * import { HugeiconsIcon } from '@hugeicons/vue'
 * import { Notification03Icon } from '@hugeicons/core-free-icons'
 * </script>
 *
 * <template>
 *   <HugeiconsIcon :icon="Notification03Icon" :size="32" color="#6366f1" />
 * </template>
 * ```
 *
 * Pro: для 51000+ иконок и 10 стилей нужна лицензия и приватный registry `https://npm.hugeicons.com/`.
 * @see https://hugeicons.com/docs/integrations/vue
 */
export { default as HugeIcon } from './HugeIcon.vue'
export { HugeiconsIcon, type IconArray } from '@hugeicons/vue'
