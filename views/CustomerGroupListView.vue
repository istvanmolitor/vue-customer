<script setup lang="ts">
import { AdminLayout, toastService } from '@admin'
import CreateButton from '@admin/components/ui/button/CreateButton.vue'
import DeleteButton from '@admin/components/ui/button/DeleteButton.vue'
import EditButton from '@admin/components/ui/button/EditButton.vue'
import DataTable, { type Column, type PaginationMeta } from '@admin/components/ui/dataTable/DataTable.vue'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { customerGroupApi } from '../services/customerGroupApi'
import type { CustomerGroup } from '../types'

const router = useRouter()
const groups = ref<CustomerGroup[]>([])
const isLoading = ref(false)
const pagination = ref<PaginationMeta>({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
})

const columns: Column<CustomerGroup>[] = [
  { key: 'name', label: 'Név', sortable: true },
  { key: 'description', label: 'Leírás', sortable: true },
]

const fetchGroups = async (params: {
  search?: string
  sort?: string
  direction?: 'asc' | 'desc'
  page?: number
}) => {
  try {
    isLoading.value = true
    const response = await customerGroupApi.list(params)
    groups.value = response.data ?? []
    pagination.value = response.meta
  } catch (error) {
    console.error('Hiba az ügyfélcsoportok betöltésekor:', error)
    toastService.error('Hiba történt az ügyfélcsoportok betöltése során.')
  } finally {
    isLoading.value = false
  }
}

const deleteGroup = async (id: number): Promise<void> => {
  try {
    await customerGroupApi.delete(id)
    toastService.success('Ügyfélcsoport sikeresen törölve!')
    await fetchGroups({ page: Number(pagination.value.current_page) })
  } catch (error) {
    console.error('Hiba az ügyfélcsoport törlésekor:', error)
    toastService.error('Hiba történt a törlés során.')
  }
}

const editGroup = (id: number): void => {
  router.push(`/admin/customer-groups/${id}/edit`)
}

onMounted(() => {
  fetchGroups({
    page: 1,
    sort: 'name',
    direction: 'asc',
  })
})
</script>

<template>
  <AdminLayout pageTitle="Ügyfélcsoportok">
    <DataTable
      :columns="columns"
      :data="groups"
      :loading="isLoading"
      :pagination="pagination"
      :searchable="true"
      search-placeholder="Keresés név vagy leírás alapján..."
      default-sort="name"
      default-direction="asc"
      @fetch="fetchGroups"
    >
      <template #actions>
        <CreateButton to="/admin/customer-groups/create">
          Új ügyfélcsoport
        </CreateButton>
      </template>

      <template #cell-description="{ row }">
        {{ row.description || '-' }}
      </template>

      <template #row-actions="{ row }">
        <EditButton @click="editGroup(row.id)" />
        <DeleteButton @confirm="deleteGroup(row.id)" />
      </template>

      <template #empty>
        Nincs megjeleníthető ügyfélcsoport.
      </template>
    </DataTable>
  </AdminLayout>
</template>

