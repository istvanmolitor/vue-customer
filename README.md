# Vue Customer Package

Admin interface for managing customers and customer groups using Vue 3 and TypeScript.

## Features

- List customers with pagination and search
- Create, edit, and delete customers
- Manage customer groups
- Customer attributes: name, internal name, tax number, currency, language, etc.
- Support for buyer/seller types

## Views

- **CustomerListView**: Displays all customers with search and pagination
- **CustomerFormView**: Create or edit a single customer
- **CustomerGroupListView**: Displays all customer groups
- **CustomerGroupFormView**: Create or edit a single customer group

## Services

- **customerApi**: API service for customer operations
- **customerGroupApi**: API service for customer group operations

## Routes

The package exports routes that can be included in the main router:

```typescript
import { customerRoutes } from '@molitor/vue-customer/router';
router.addRoutes(customerRoutes);
```

## Types

All TypeScript types are exported from `types/index.ts`:

- `Customer`
- `CustomerGroup`
- `CustomerListMeta`
- `CustomerGroupListMeta`

## API Endpoints

All endpoints are located under `/api/admin/customer`:

- `GET /api/admin/customer/customers` - List customers
- `POST /api/admin/customer/customers` - Create customer
- `GET /api/admin/customer/customers/:id` - Get customer
- `PUT /api/admin/customer/customers/:id` - Update customer
- `DELETE /api/admin/customer/customers/:id` - Delete customer
- `GET /api/admin/customer/customer-groups` - List customer groups
- `POST /api/admin/customer/customer-groups` - Create customer group
- `GET /api/admin/customer/customer-groups/:id` - Get customer group
- `PUT /api/admin/customer/customer-groups/:id` - Update customer group
- `DELETE /api/admin/customer/customer-groups/:id` - Delete customer group

