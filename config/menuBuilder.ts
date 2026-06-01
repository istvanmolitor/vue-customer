import { MenuBuilder, type MenuItemConfig } from '@menu/index'
import { Users } from 'lucide-vue-next'

/**
 * Customer Menu Builder
 * Builds the customer management menu structure
 */
export class CustomerMenuBuilder extends MenuBuilder {
  build(menu: MenuItemConfig, menuName: string): MenuItemConfig {
    if (menuName === 'admin') {
      return this.buildMainMenu(menu)
    }
    return menu
  }

  /**
   * Build main menu items
   */
  private buildMainMenu(menu: MenuItemConfig): MenuItemConfig {
    const customerSection: MenuItemConfig = {
      id: 'customer-management',
      title: 'Ügyfelek',
      icon: Users,
      order: 35,
      permission: 'customer',
      children: [
        {
          id: 'customer-list',
          title: 'Ügyfelek',
          path: '/admin/customers',
          order: 1,
          permission: 'customer',
        },
        {
          id: 'customer-group-list',
          title: 'Ügyfélcsoportok',
          path: '/admin/customer-groups',
          order: 2,
          permission: 'customer',
        },
      ],
    }

    this.addMenuItem(menu, customerSection)

    return menu
  }
}

// Export singleton instance
export const customerMenuBuilder = new CustomerMenuBuilder()

