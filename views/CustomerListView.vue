<script setup lang="ts">
import { AdminLayout, toastService } from '@admin'
import CreateButton from '@admin/components/ui/button/CreateButton.vue'
import DeleteButton from '@admin/components/ui/button/DeleteButton.vue'
import EditButton from '@admin/components/ui/button/EditButton.vue'
import DataTable, { type Column, type PaginationMeta } from '@admin/components/ui/dataTable/DataTable.vue'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { customerApi } from '../services/customerApi'
import type { Customer } from '../types'

const router = useRouter()
const customers = ref<Customer[]>([])
const isLoading = ref(false)
const pagination = ref<PaginationMeta>({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
})

const columns: Column<Customer>[] = [
  { key: 'id', label: 'ID', sortable: true, width: '80px' },
  { key: 'name', label: 'Név', sortable: true },
  { key: 'internal_name', label: 'Belső név', sortable: true },
  { key: 'tax_number', label: 'Adószám', sortable: true },
  { key: 'customer_group', label: 'Csoport', sortable: false },
  { key: 'type', label: 'Típus', sortable: false, width: '180px' },
]

const fetchCustomers = async (params: {
  search?: string
  sort?: string
  direction?: 'asc' | 'desc'
  page?: number
}) => {
  try {
    isLoading.value = true
    const response = await customerApi.list(params)
    customers.value = response.data ?? []
    pagination.value = response.meta
  } catch (error) {
    console.error('Hiba az ügyfelek betöltésekor:', error)
    toastService.error('Hiba történt az ügyfelek betöltése során.')
  } finally {
    isLoading.value = false
  }
}

const deleteCustomer = async (id: number): Promise<void> => {
  try {
    await customerApi.delete(id)
    toastService.success('Ügyfél sikeresen törölve!')
    await fetchCustomers({ page: Number(pagination.value.current_page) })
  } catch (error) {
    console.error('Hiba az ügyfél törlésekor:', error)
    toastService.error('Hiba történt a törlés során.')
  }
}

const editCustomer = (id: number): void => {
  router.push(`/admin/customers/${id}/edit`)
}

onMounted(() => {
  fetchCustomers({
    page: 1,
    sort: 'name',
    direction: 'asc',
  })
})
</script>

<template>
  <AdminLayout pageTitle="Ügyfelek">
    <DataTable
      :columns="columns"
      :data="customers"
      :loading="isLoading"
      :pagination="pagination"
      :searchable="true"
      search-placeholder="Keresés név, belső név vagy adószám alapján..."
      default-sort="name"
      default-direction="asc"
      @fetch="fetchCustomers"
    >
      <template #actions>
        <CreateButton to="/admin/customers/create">
          Új ügyfél
        </CreateButton>
      </template>

      <template #cell-customer_group="{ row }">
        {{ row.customer_group?.name || '-' }}
      </template>

      <template #cell-type="{ row }">
        <div class="flex items-center gap-1">
          <span v-if="row.is_buyer" class="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
            Vevő
          </span>
          <span v-if="row.is_seller" class="rounded bg-green-100 px-2 py-1 text-xs text-green-800">
            Eladó
          </span>
          <span v-if="!row.is_buyer && !row.is_seller" class="text-xs text-muted-foreground">
            -
          </span>
        </div>
      </template>

      <template #row-actions="{ row }">
        <EditButton @click="editCustomer(row.id)" />
        <DeleteButton @confirm="deleteCustomer(row.id)" />
      </template>

      <template #empty>
        Nincs megjeleníthető ügyfél.
      </template>
    </DataTable>
  </AdminLayout>
</template>

