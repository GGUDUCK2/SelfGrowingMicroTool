import type { SchemaProject, Table, Relation } from '$lib/types/schema-forge';
import { nanoid } from 'nanoid';

// Helper to create IDs
const id = () => nanoid();

export const TEMPLATES: { id: string; name: string; description: string; factory: () => SchemaProject }[] = [
    {
        id: 'saas-starter',
        name: 'SaaS Starter',
        description: 'A complete foundation for a SaaS app with Users, Subscriptions, and Workspaces.',
        factory: () => {
            const usersId = id();
            const subscriptionsId = id();
            const workspacesId = id();
            const membersId = id();

            return {
                name: 'SaaS Platform',
                tables: [
                    {
                        id: usersId,
                        name: 'users',
                        columns: [
                            { id: id(), name: 'id', type: 'int', isPk: true, isAutoIncrement: true, isNullable: false, isUnique: true },
                            { id: id(), name: 'email', type: 'varchar', length: 255, isPk: false, isAutoIncrement: false, isNullable: false, isUnique: true },
                            { id: id(), name: 'password_hash', type: 'varchar', length: 255, isPk: false, isAutoIncrement: false, isNullable: false, isUnique: false },
                            { id: id(), name: 'full_name', type: 'varchar', length: 100, isPk: false, isAutoIncrement: false, isNullable: true, isUnique: false },
                            { id: id(), name: 'created_at', type: 'timestamp', isPk: false, isAutoIncrement: false, isNullable: false, isUnique: false, defaultValue: 'CURRENT_TIMESTAMP' },
                            { id: id(), name: 'is_active', type: 'boolean', isPk: false, isAutoIncrement: false, isNullable: false, isUnique: false, defaultValue: 'true' }
                        ],
                        comment: 'Registered users of the platform'
                    },
                    {
                        id: subscriptionsId,
                        name: 'subscriptions',
                        columns: [
                            { id: id(), name: 'id', type: 'int', isPk: true, isAutoIncrement: true, isNullable: false, isUnique: true },
                            { id: id(), name: 'user_id', type: 'int', isPk: false, isAutoIncrement: false, isNullable: false, isUnique: false },
                            { id: id(), name: 'plan', type: 'varchar', length: 50, isPk: false, isAutoIncrement: false, isNullable: false, isUnique: false },
                            { id: id(), name: 'status', type: 'varchar', length: 20, isPk: false, isAutoIncrement: false, isNullable: false, isUnique: false, defaultValue: "'active'" },
                            { id: id(), name: 'current_period_end', type: 'datetime', isPk: false, isAutoIncrement: false, isNullable: false, isUnique: false }
                        ]
                    },
                    {
                        id: workspacesId,
                        name: 'workspaces',
                        columns: [
                            { id: id(), name: 'id', type: 'int', isPk: true, isAutoIncrement: true, isNullable: false, isUnique: true },
                            { id: id(), name: 'name', type: 'varchar', length: 100, isPk: false, isAutoIncrement: false, isNullable: false, isUnique: false },
                            { id: id(), name: 'slug', type: 'varchar', length: 100, isPk: false, isAutoIncrement: false, isNullable: false, isUnique: true },
                            { id: id(), name: 'owner_id', type: 'int', isPk: false, isAutoIncrement: false, isNullable: false, isUnique: false }
                        ]
                    },
                    {
                        id: membersId,
                        name: 'workspace_members',
                        columns: [
                             { id: id(), name: 'workspace_id', type: 'int', isPk: true, isAutoIncrement: false, isNullable: false, isUnique: false },
                             { id: id(), name: 'user_id', type: 'int', isPk: true, isAutoIncrement: false, isNullable: false, isUnique: false },
                             { id: id(), name: 'role', type: 'varchar', length: 20, isPk: false, isAutoIncrement: false, isNullable: false, isUnique: false, defaultValue: "'member'" }
                        ]
                    }
                ],
                relations: [
                    { id: id(), fromTableId: subscriptionsId, fromColumnId: 'user_id', toTableId: usersId, toColumnId: 'id', type: '1:n' },
                    { id: id(), fromTableId: workspacesId, fromColumnId: 'owner_id', toTableId: usersId, toColumnId: 'id', type: '1:n' },
                    { id: id(), fromTableId: membersId, fromColumnId: 'workspace_id', toTableId: workspacesId, toColumnId: 'id', type: '1:n' },
                    { id: id(), fromTableId: membersId, fromColumnId: 'user_id', toTableId: usersId, toColumnId: 'id', type: '1:n' }
                ],
                createdAt: new Date(),
                updatedAt: new Date()
            };
        }
    },
    {
        id: 'ecommerce',
        name: 'E-commerce Store',
        description: 'Standard online store schema with Products, Orders, and Customers.',
        factory: () => {
             const productsId = id();
             const categoriesId = id();
             const ordersId = id();
             const orderItemsId = id();

             return {
                name: 'Online Store',
                tables: [
                    {
                        id: productsId,
                        name: 'products',
                        columns: [
                            { id: id(), name: 'id', type: 'int', isPk: true, isAutoIncrement: true, isNullable: false, isUnique: true },
                            { id: id(), name: 'name', type: 'varchar', length: 255, isPk: false, isAutoIncrement: false, isNullable: false, isUnique: false },
                            { id: id(), name: 'sku', type: 'varchar', length: 50, isPk: false, isAutoIncrement: false, isNullable: false, isUnique: true },
                            { id: id(), name: 'price', type: 'decimal', isPk: false, isAutoIncrement: false, isNullable: false, isUnique: false },
                            { id: id(), name: 'category_id', type: 'int', isPk: false, isAutoIncrement: false, isNullable: true, isUnique: false }
                        ]
                    },
                    {
                        id: categoriesId,
                        name: 'categories',
                        columns: [
                            { id: id(), name: 'id', type: 'int', isPk: true, isAutoIncrement: true, isNullable: false, isUnique: true },
                            { id: id(), name: 'name', type: 'varchar', length: 100, isPk: false, isAutoIncrement: false, isNullable: false, isUnique: false }
                        ]
                    },
                    {
                        id: ordersId,
                        name: 'orders',
                        columns: [
                            { id: id(), name: 'id', type: 'uuid', isPk: true, isAutoIncrement: false, isNullable: false, isUnique: true },
                            { id: id(), name: 'total_amount', type: 'decimal', isPk: false, isAutoIncrement: false, isNullable: false, isUnique: false },
                            { id: id(), name: 'status', type: 'varchar', length: 20, isPk: false, isAutoIncrement: false, isNullable: false, isUnique: false },
                            { id: id(), name: 'created_at', type: 'timestamp', isPk: false, isAutoIncrement: false, isNullable: false, isUnique: false }
                        ]
                    },
                    {
                        id: orderItemsId,
                        name: 'order_items',
                        columns: [
                            { id: id(), name: 'id', type: 'int', isPk: true, isAutoIncrement: true, isNullable: false, isUnique: true },
                            { id: id(), name: 'order_id', type: 'uuid', isPk: false, isAutoIncrement: false, isNullable: false, isUnique: false },
                            { id: id(), name: 'product_id', type: 'int', isPk: false, isAutoIncrement: false, isNullable: false, isUnique: false },
                            { id: id(), name: 'quantity', type: 'int', isPk: false, isAutoIncrement: false, isNullable: false, isUnique: false },
                            { id: id(), name: 'unit_price', type: 'decimal', isPk: false, isAutoIncrement: false, isNullable: false, isUnique: false }
                        ]
                    }
                ],
                relations: [
                    { id: id(), fromTableId: productsId, fromColumnId: 'category_id', toTableId: categoriesId, toColumnId: 'id', type: '1:n' },
                    { id: id(), fromTableId: orderItemsId, fromColumnId: 'order_id', toTableId: ordersId, toColumnId: 'id', type: '1:n' },
                    { id: id(), fromTableId: orderItemsId, fromColumnId: 'product_id', toTableId: productsId, toColumnId: 'id', type: '1:n' }
                ],
                createdAt: new Date(),
                updatedAt: new Date()
             };
        }
    }
];
