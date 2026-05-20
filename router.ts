import type { RouteRecordRaw } from 'vue-router';
import CustomerListView from './views/CustomerListView.vue';
import CustomerFormView from './views/CustomerFormView.vue';
import CustomerGroupListView from './views/CustomerGroupListView.vue';
import CustomerGroupFormView from './views/CustomerGroupFormView.vue';

export const customerRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/customers',
    name: 'customer.customers',
    component: CustomerListView,
  },
  {
    path: '/admin/customers/create',
    name: 'customer.customers.create',
    component: CustomerFormView,
  },
  {
    path: '/admin/customers/:id/edit',
    name: 'customer.customers.edit',
    component: CustomerFormView,
  },
  {
    path: '/admin/customer-groups',
    name: 'customer.groups',
    component: CustomerGroupListView,
  },
  {
    path: '/admin/customer-groups/create',
    name: 'customer.groups.create',
    component: CustomerGroupFormView,
  },
  {
    path: '/admin/customer-groups/:id/edit',
    name: 'customer.groups.edit',
    component: CustomerGroupFormView,
  },
];

