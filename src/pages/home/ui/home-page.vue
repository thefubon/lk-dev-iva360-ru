<script setup lang="ts">
import HomeDemoTanstackForm from './home-demo-tanstack-form.vue'
import HomeDemoTanstackTable from './home-demo-tanstack-table.vue'
import HomeDemoVeeForm from './home-demo-vee-form.vue'
</script>

<template>
  <main class="container mx-auto flex flex-col gap-10 px-4 py-16">
    <header class="flex flex-col gap-2">
      <h1 class="text-3xl font-semibold tracking-tight text-foreground">
        IVA 360
      </h1>
      <p class="text-muted-foreground text-lg leading-relaxed">
        Главная: слой <code class="rounded bg-muted px-1.5 py-0.5 text-sm">pages/home</code>,
        маршрут <code class="rounded bg-muted px-1.5 py-0.5 text-sm">app/routes/index.vue</code>.
        Ниже — рабочие примеры VeeValidate, TanStack Form и TanStack Table по документации shadcn-vue.
      </p>
    </header>

    <ClientOnly>
      <div class="grid gap-8 lg:grid-cols-2">
        <HomeDemoVeeForm />
        <HomeDemoTanstackForm />
        <HomeDemoTanstackTable class="lg:col-span-2" />
      </div>
      <template #fallback>
        <p class="text-muted-foreground text-sm">
          Загрузка демо форм и таблицы…
        </p>
      </template>
    </ClientOnly>
  </main>
</template>
