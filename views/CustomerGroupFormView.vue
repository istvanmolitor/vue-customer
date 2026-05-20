<script setup lang="ts">
import {
  AdminLayout,
  BackButton,
  FormButtons,
  Input,
  InputError,
  Label,
  Textarea,
  toastService,
} from '@admin'
import Card from '@admin/components/ui/Card.vue'
import CardContent from '@admin/components/ui/CardContent.vue'
import CardDescription from '@admin/components/ui/CardDescription.vue'
import CardFooter from '@admin/components/ui/CardFooter.vue'
import CardHeader from '@admin/components/ui/CardHeader.vue'
import CardTitle from '@admin/components/ui/CardTitle.vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { customerGroupApi } from '../services/customerGroupApi'

interface CustomerGroupFormData {
  name: string
  description: string
}

const router = useRouter()
const route = useRoute()
const isLoading = ref(false)
const isSaving = ref(false)
const errors = ref<Record<string, string[]>>({})

const form = reactive<CustomerGroupFormData>({
  name: '',
  description: '',
})

const isEditing = computed(() => Boolean(route.params.id))
const groupId = computed(() => Number(route.params.id))

const fetchGroup = async (): Promise<void> => {
  if (!isEditing.value) {
    return
  }

  try {
    isLoading.value = true
    const response = await customerGroupApi.edit(groupId.value)
    const group = response.data
    form.name = group.name ?? ''
    form.description = group.description ?? ''
  } catch (error) {
    console.error('Hiba az ügyfélcsoport betöltésekor:', error)
    toastService.error('Hiba történt az adatok betöltése során.')
    router.push('/admin/customer-groups')
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async (): Promise<void> => {
  try {
    isSaving.value = true
    errors.value = {}

    if (isEditing.value) {
      await customerGroupApi.update(groupId.value, { ...form })
      toastService.success('Ügyfélcsoport sikeresen frissítve!')
    } else {
      const response = await customerGroupApi.store({ ...form })
      toastService.success('Ügyfélcsoport sikeresen létrehozva!')

      const createdGroupId = response?.data?.id
      if (createdGroupId) {
        await router.push(`/admin/customer-groups/${createdGroupId}/edit`)
        return
      }
    }

    await router.push('/admin/customer-groups')
  } catch (error: any) {
    console.error('Hiba az ügyfélcsoport mentésekor:', error)
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors ?? {}
      toastService.error('Kérjük, javítsd a hibaüzeneteket.')
    } else {
      toastService.error('Hiba történt a mentés során.')
    }
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  fetchGroup()
})
</script>

<template>
  <AdminLayout :page-title="isEditing ? 'Ügyfélcsoport szerkesztése' : 'Új ügyfélcsoport'">
    <div class="mb-4 flex items-center justify-between space-y-2">
      <BackButton to="/admin/customer-groups" />
    </div>

    <div v-if="isLoading" class="flex justify-center py-8">
      Betöltés...
    </div>

    <Card v-else>
      <CardHeader>
        <CardTitle>Ügyfélcsoport adatok</CardTitle>
        <CardDescription>
          Add meg az ügyfélcsoport adatait.
        </CardDescription>
      </CardHeader>

      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="name">Név</Label>
          <Input id="name" v-model="form.name" placeholder="Nagykereskedő partnerek" />
          <InputError :message="errors.name" />
        </div>

        <div class="space-y-2">
          <Label for="description">Leírás</Label>
          <Textarea id="description" v-model="form.description" />
          <InputError :message="errors.description" />
        </div>
      </CardContent>

      <CardFooter>
        <FormButtons
          :is-saving="isSaving"
          :save-label="isEditing ? 'Frissítés' : 'Létrehozás'"
          @save="handleSubmit"
          @cancel="router.push('/admin/customer-groups')"
        />
      </CardFooter>
    </Card>
  </AdminLayout>
</template>

