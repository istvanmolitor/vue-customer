<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { toastService } from '@admin'
import { customerApi } from '../services/customerApi'
import type { Customer } from '../types'

interface Props {
  modelValue?: number | null
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  placeholder: 'Válassz ügyfelet',
  searchPlaceholder: 'Keresés...',
  emptyMessage: 'Nincs találat.',
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const search = ref('')
const isOpen = ref(false)
const isLoading = ref(true)
const customers = ref<Customer[]>([])

const displayedCustomers = computed(() => {
  if (!search.value) {
    return customers.value
  }

  const query = search.value.toLowerCase()

  return customers.value.filter(customer => {
    return (
      String(customer.name ?? '').toLowerCase().includes(query) ||
      String(customer.internal_name ?? '').toLowerCase().includes(query) ||
      String(customer.tax_number ?? '').toLowerCase().includes(query)
    )
  })
})

const selectedCustomer = computed(() => {
  return customers.value.find(customer => customer.id === props.modelValue)
})

const selectedLabel = computed(() => {
  if (!selectedCustomer.value) {
    return 'Nincs kiválasztva'
  }

  if (selectedCustomer.value.internal_name) {
    return `${selectedCustomer.value.name} (${selectedCustomer.value.internal_name})`
  }

  return selectedCustomer.value.name
})

const fetchCustomers = async (): Promise<void> => {
  try {
    isLoading.value = true
    const response = await customerApi.list({
      page: 1,
      per_page: 999,
      sort: 'name',
      direction: 'asc',
    })
    customers.value = response.data ?? []
  } catch (error) {
    console.error('Hiba az ugyfelek betoltese kozben:', error)
    toastService.error('Hiba tortent az ugyfelek betoltese soran.')
  } finally {
    isLoading.value = false
  }
}

const selectCustomer = (customer: Customer): void => {
  emit('update:modelValue', customer.id)
  isOpen.value = false
  search.value = ''
}

onMounted(() => {
  fetchCustomers()
})
</script>

<template>
  <div class="relative">
    <button
      type="button"
      :id="props.id"
      :disabled="disabled || isLoading"
      class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      @click="isOpen = !isOpen"
    >
      <span :class="modelValue ? 'text-foreground' : 'text-muted-foreground'">
        {{ modelValue ? selectedLabel : placeholder }}
      </span>
      <svg class="ml-2 h-4 w-4 shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div
      v-if="isOpen && !isLoading"
      class="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md"
    >
      <div class="p-2">
        <input
          v-model="search"
          type="text"
          autofocus
          class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          :placeholder="searchPlaceholder"
        />
      </div>
      <div class="max-h-96 overflow-y-auto p-1">
        <div v-if="displayedCustomers.length === 0" class="px-3 py-2 text-sm text-muted-foreground">
          {{ emptyMessage }}
        </div>
        <button
          v-for="customer in displayedCustomers"
          :key="customer.id"
          type="button"
          class="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          :class="{ 'bg-accent text-accent-foreground': modelValue === customer.id }"
          @click="selectCustomer(customer)"
          @keydown.enter="selectCustomer(customer)"
        >
          <span class="truncate text-left">
            {{ customer.name }}
            <span v-if="customer.internal_name" class="text-muted-foreground">({{ customer.internal_name }})</span>
          </span>
          <svg
            v-if="modelValue === customer.id"
            class="h-4 w-4 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </div>

    <div v-if="isOpen && !isLoading" class="fixed inset-0 z-40" @click="isOpen = false" />
  </div>
</template>
