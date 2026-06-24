<script setup lang="ts">
import { AdminLayout, BackButton, FormButtons, InputError, Label, Textarea, toastService, LoadingSpinner } from '@admin'
import InputField from '@admin/components/ui/InputField.vue'
import { AddressInput } from '@address'
import { UserSelecton } from '@user'
import Checkbox from '@admin/components/ui/Checkbox.vue'
import Card from '@admin/components/ui/Card.vue'
import CardContent from '@admin/components/ui/CardContent.vue'
import CardDescription from '@admin/components/ui/CardDescription.vue'
import CardFooter from '@admin/components/ui/CardFooter.vue'
import CardHeader from '@admin/components/ui/CardHeader.vue'
import CardTitle from '@admin/components/ui/CardTitle.vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { customerApi } from '../services/customerApi'
import type { CustomerAddress, CustomerGroup } from '../types'

interface CustomerFormData {
  name: string
  internal_name: string
  tax_number: string
  description: string
  customer_group_id: number | null
  user_id: number | null
  currency_id: number | null
  language_id: number | null
  is_buyer: boolean
  is_seller: boolean
  invoice_address: CustomerAddress
  shipping_address: CustomerAddress
}

interface SelectOption {
  id: number
  name: string
}

const router = useRouter()
const route = useRoute()
const isLoading = ref(true)
const isSaving = ref(false)
const errors = ref<Record<string, string[]>>({})

const customerGroups = ref<CustomerGroup[]>([])
const currencies = ref<SelectOption[]>([])
const languages = ref<SelectOption[]>([])

const createEmptyAddress = (): CustomerAddress => ({
  name: '',
  country_id: null,
  zip_code: '',
  city: '',
  address: '',
})

const getAddressErrors = (prefix: 'invoice_address' | 'shipping_address'): Record<string, string[]> => {
  const entries = Object.entries(errors.value)
    .filter(([key]) => key.startsWith(`${prefix}.`))
    .map(([key, value]) => [key.replace(`${prefix}.`, ''), value] as const)

  return Object.fromEntries(entries)
}

const invoiceAddressErrors = computed(() => getAddressErrors('invoice_address'))
const shippingAddressErrors = computed(() => getAddressErrors('shipping_address'))

const form = reactive<CustomerFormData>({
  name: '',
  internal_name: '',
  tax_number: '',
  description: '',
  customer_group_id: null,
  user_id: null,
  currency_id: null,
  language_id: null,
  is_buyer: true,
  is_seller: false,
  invoice_address: createEmptyAddress(),
  shipping_address: createEmptyAddress(),
})

const isEditing = computed(() => Boolean(route.params.id))
const customerId = computed(() => Number(route.params.id))

const mapNameDictionaryToOptions = (items: Record<string, string>): SelectOption[] => {
  return Object.entries(items).map(([id, name]) => ({
    id: Number(id),
    name,
  }))
}

const fetchFormData = async (): Promise<void> => {
  try {
    isLoading.value = true

    if (isEditing.value) {
      const response = await customerApi.edit(customerId.value)
      const customer = response.data

      form.name = customer.name ?? ''
      form.internal_name = customer.internal_name ?? ''
      form.tax_number = customer.tax_number ?? ''
      form.description = customer.description ?? ''
      form.customer_group_id = customer.customer_group_id ?? null
      form.user_id = customer.user_id ?? null
      form.currency_id = customer.currency_id ?? null
      form.language_id = customer.language_id ?? null
      form.is_buyer = Boolean(customer.is_buyer)
      form.is_seller = Boolean(customer.is_seller)
      form.invoice_address = {
        ...createEmptyAddress(),
        ...(customer.invoice_address ?? {}),
      }
      form.shipping_address = {
        ...createEmptyAddress(),
        ...(customer.shipping_address ?? {}),
      }

      customerGroups.value = response.customer_groups ?? []
      currencies.value = mapNameDictionaryToOptions(response.currencies ?? {})
      languages.value = mapNameDictionaryToOptions(response.languages ?? {})
    } else {
      const response = await customerApi.create()
      customerGroups.value = response.customer_groups ?? []
      currencies.value = mapNameDictionaryToOptions(response.currencies ?? {})
      languages.value = mapNameDictionaryToOptions(response.languages ?? {})
      form.user_id = null
      form.invoice_address = createEmptyAddress()
      form.shipping_address = createEmptyAddress()
    }
  } catch (error) {
    console.error('Hiba az ügyfél adatainak betöltésekor:', error)
    toastService.error('Hiba történt az adatok betöltése során.')
    router.push('/admin/customers')
  } finally {
    isLoading.value = false
  }
}

const parseNullableNumber = (value: string | number | null): number | null => {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

const handleSubmit = async (): Promise<void> => {
  try {
    isSaving.value = true
    errors.value = {}

    const payload: CustomerFormData = {
      ...form,
      customer_group_id: parseNullableNumber(form.customer_group_id),
      user_id: parseNullableNumber(form.user_id),
      currency_id: parseNullableNumber(form.currency_id),
      language_id: parseNullableNumber(form.language_id),
      invoice_address: {
        ...form.invoice_address,
        country_id: parseNullableNumber(form.invoice_address.country_id),
      },
      shipping_address: {
        ...form.shipping_address,
        country_id: parseNullableNumber(form.shipping_address.country_id),
      },
    }

    if (isEditing.value) {
      await customerApi.update(customerId.value, payload)
      toastService.success('Ügyfél sikeresen frissítve!')
    } else {
      const response = await customerApi.store(payload)
      toastService.success('Ügyfél sikeresen létrehozva!')

      const createdCustomerId = response?.data?.id
      if (createdCustomerId) {
        await router.push(`/admin/customers/${createdCustomerId}/edit`)
        return
      }
    }

    await router.push('/admin/customers')
  } catch (error: any) {
    console.error('Hiba az ügyfél mentésekor:', error)
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
  fetchFormData()
})
</script>

<template>
  <AdminLayout :page-title="isEditing ? 'Ügyfél szerkesztése' : 'Új ügyfél'">
    <div class="mb-4 flex items-center justify-between space-y-2">
      <BackButton to="/admin/customers" />
    </div>

    <div v-if="isLoading" class="flex justify-center py-8"><LoadingSpinner label="Betöltés..." /></div>

    <Card v-else>
      <CardHeader>
        <CardTitle>Ügyfél adatok</CardTitle>
        <CardDescription>
          Add meg az ügyfél alapadatait és beállításait.
        </CardDescription>
      </CardHeader>

      <CardContent class="space-y-4">
        <InputField id="name" label="Név" v-model="form.name" placeholder="Minta Kft." :errors="errors.name" />

        <InputField id="internal_name" label="Belső név" v-model="form.internal_name" placeholder="minta_kft" :errors="errors.internal_name" />

        <InputField id="tax_number" label="Adószám" v-model="form.tax_number" placeholder="12345678-1-42" :errors="errors.tax_number" />

        <div class="space-y-2">
          <Label for="description">Leírás</Label>
          <Textarea id="description" v-model="form.description" />
          <InputError :message="errors.description" />
        </div>

        <div class="space-y-2">
          <Label for="customer_group_id">Ügyfélcsoport</Label>
          <select
            id="customer_group_id"
            v-model="form.customer_group_id"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option :value="null">Nincs kiválasztva</option>
            <option v-for="group in customerGroups" :key="group.id" :value="group.id">
              {{ group.name }}
            </option>
          </select>
          <InputError :message="errors.customer_group_id" />
        </div>

        <div class="space-y-2">
          <Label for="user_id">Felhasznalo</Label>
          <UserSelecton id="user_id" v-model="form.user_id" />
          <InputError :message="errors.user_id" />
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label for="currency_id">Pénznem</Label>
            <select
              id="currency_id"
              v-model="form.currency_id"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option :value="null">Nincs kiválasztva</option>
              <option v-for="currency in currencies" :key="currency.id" :value="currency.id">
                {{ currency.name }}
              </option>
            </select>
            <InputError :message="errors.currency_id" />
          </div>

          <div class="space-y-2">
            <Label for="language_id">Nyelv</Label>
            <select
              id="language_id"
              v-model="form.language_id"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option :value="null">Nincs kiválasztva</option>
              <option v-for="language in languages" :key="language.id" :value="language.id">
                {{ language.name }}
              </option>
            </select>
            <InputError :message="errors.language_id" />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <AddressInput
            v-model="form.invoice_address"
            title="Szamlazasi cim"
            :errors="invoiceAddressErrors"
          />
          <AddressInput
            v-model="form.shipping_address"
            title="Szallitasi cim"
            :errors="shippingAddressErrors"
          />
        </div>

        <div class="flex items-center gap-2">
          <Checkbox id="is_buyer" v-model="form.is_buyer" />
          <Label for="is_buyer">Vevő</Label>
        </div>

        <div class="flex items-center gap-2">
          <Checkbox id="is_seller" v-model="form.is_seller" />
          <Label for="is_seller">Eladó</Label>
        </div>
      </CardContent>

      <CardFooter>
        <FormButtons
          :is-saving="isSaving"
          :save-label="isEditing ? 'Frissítés' : 'Létrehozás'"
          @save="handleSubmit"
          @cancel="router.push('/admin/customers')"
        />
      </CardFooter>
    </Card>
  </AdminLayout>
</template>


