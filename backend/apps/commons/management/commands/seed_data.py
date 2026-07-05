"""
Seed data management command.
Creates default admin user, roles, UOMs, warehouses, sample partners and products.
Run: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from apps.commons.models import User, Role, UOM, Partner

# ── Default data definitions ──────────────────────────

DEFAULT_UOMS = [
    {'name': '件', 'short_name': '件', 'category': 'quantity'},
    {'name': '个', 'short_name': '个', 'category': 'quantity'},
    {'name': '箱', 'short_name': '箱', 'category': 'quantity'},
    {'name': '打', 'short_name': '打', 'category': 'quantity'},
    {'name': '千克', 'short_name': 'kg', 'category': 'weight'},
    {'name': '克', 'short_name': 'g', 'category': 'weight'},
    {'name': '吨', 'short_name': 't', 'category': 'weight'},
    {'name': '米', 'short_name': 'm', 'category': 'length'},
    {'name': '升', 'short_name': 'L', 'category': 'volume'},
]

DEFAULT_ROLES = [
    {'code': 'admin', 'name': '系统管理员', 'is_system': True},
    {'code': 'purchaser', 'name': '采购员', 'is_system': False},
    {'code': 'warehouser', 'name': '库管员', 'is_system': False},
    {'code': 'salesperson', 'name': '销售员', 'is_system': False},
    {'code': 'finance_ro', 'name': '财务(只读)', 'is_system': False},
]

DEFAULT_PARTNERS = [
    {'code': 'SUP001', 'name': '华为技术有限公司', 'type': 'supplier', 'contact_person': '张三',
     'phone': '13800138001'},
    {'code': 'SUP002', 'name': '深圳华强电子', 'type': 'supplier', 'contact_person': '李四', 'phone': '13800138002'},
    {'code': 'SUP003', 'name': '广州白云供应链', 'type': 'supplier', 'contact_person': '王五', 'phone': '13800138003'},
    {'code': 'CUS001', 'name': '北京创新科技有限公司', 'type': 'customer', 'contact_person': '赵六',
     'phone': '13900139001'},
    {'code': 'CUS002', 'name': '上海数码贸易有限公司', 'type': 'customer', 'contact_person': '钱七',
     'phone': '13900139002'},
    {'code': 'BOTH001', 'name': '深圳跨境电商公司', 'type': 'both', 'contact_person': '孙八', 'phone': '13900139003'},
]

DEFAULT_PRODUCTS = [
    {'code': 'P001', 'name': '智能笔记本电脑 Pro', 'spec': 'i7/16GB/512GB', 'category': '电子产品',
     'purchase_price': 4500, 'sale_price': 5999, 'uom_name': '件'},
    {'code': 'P002', 'name': '机械键盘 K8', 'spec': '87键/青轴', 'category': '外设', 'purchase_price': 180,
     'sale_price': 299, 'uom_name': '件'},
    {'code': 'P003', 'name': '无线鼠标 M3', 'spec': '蓝牙5.0/充电', 'category': '外设', 'purchase_price': 65,
     'sale_price': 129, 'uom_name': '个'},
    {'code': 'P004', 'name': '27寸4K显示器', 'spec': 'IPS/Type-C', 'category': '电子产品', 'purchase_price': 1200,
     'sale_price': 1999, 'uom_name': '台'},
    {'code': 'P005', 'name': 'USB-C 扩展坞', 'spec': '7合1/4K60Hz', 'category': '外设', 'purchase_price': 95,
     'sale_price': 189, 'uom_name': '个'},
    {'code': 'P006', 'name': 'A4复印纸(500张)', 'spec': '70g/500张/包', 'category': '办公耗材', 'purchase_price': 22,
     'sale_price': 35, 'uom_name': '箱'},
    {'code': 'P007', 'name': '中性笔(12支装)', 'spec': '0.5mm/黑色', 'category': '办公耗材', 'purchase_price': 8,
     'sale_price': 15, 'uom_name': '打'},
]


class Command(BaseCommand):
    help = '初始化种子数据：默认用户、角色、单位、仓库、合作伙伴、示例商品'

    def handle(self, *args, **options):
        self.stdout.write('=' * 50)
        self.stdout.write('开始初始化种子数据...')
        self.stdout.write('=' * 50)

        self._create_uoms()
        self._create_roles()
        self._create_admin_user()
        self._create_default_warehouse()
        self._create_partners()
        self._create_products()

        self.stdout.write(self.style.SUCCESS('\n✅ 种子数据初始化完成!'))
        self.stdout.write(f'   管理员: admin / admin123')
        self.stdout.write('=' * 50)

    def _create_uoms(self):
        created = 0
        for data in DEFAULT_UOMS:
            _, is_new = UOM.objects.get_or_create(
                name=data['name'],
                defaults=data,
            )
            if is_new:
                created += 1
        self.stdout.write(f'  📦 计量单位: 创建 {created} 个')

    def _create_roles(self):
        for data in DEFAULT_ROLES:
            role, created = Role.objects.get_or_create(
                code=data['code'],
                defaults={'name': data['name'], 'is_system': data['is_system']},
            )
            if created:
                self._assign_model_permissions(role)
                self.stdout.write(f'  👤 角色: 创建 {role.name}')
            else:
                self.stdout.write(f'  👤 角色: 已存在 {role.name}')

    @staticmethod
    def _assign_model_permissions(role):
        """Assign all available permissions to a role."""
        for ct in ContentType.objects.all():
            perms = Permission.objects.filter(content_type=ct)
            role.permissions.add(*perms)

    def _create_admin_user(self):
        if User.objects.filter(username='admin').exists():
            self.stdout.write('  👤 管理员: 已存在 (admin / admin123)')
            return

        admin_role = Role.objects.get(code='admin')
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@erp.local',
            password='admin123',
            employee_id='ADMIN001',
            department='管理部',
        )
        admin.roles.add(admin_role)
        self.stdout.write('  👤 管理员: 创建完成 (admin / admin123)')

    def _create_default_warehouse(self):
        from apps.inventory.models import Warehouse, Location
        wh, created = Warehouse.objects.get_or_create(
            code='WH01',
            defaults={'name': '主仓库', 'address': '深圳市南山区科技园'},
        )
        if created:
            Location.objects.get_or_create(warehouse=wh, code='A-01-01', defaults={'name': 'A区-01货架'})
            Location.objects.get_or_create(warehouse=wh, code='A-01-02', defaults={'name': 'A区-02货架'})
            Location.objects.get_or_create(warehouse=wh, code='B-01-01', defaults={'name': 'B区-01货架'})
            self.stdout.write(f'  🏭 仓库: 创建 {wh.name} (+3 货位)')
        else:
            self.stdout.write(f'  🏭 仓库: 已存在 {wh.name}')

    def _create_partners(self):
        admin = User.objects.filter(is_superuser=True).first()
        created = 0
        for data in DEFAULT_PARTNERS:
            _, is_new = Partner.objects.get_or_create(
                code=data['code'],
                defaults={**data, 'created_by': admin, 'updated_by': admin},
            )
            if is_new:
                created += 1
        self.stdout.write(f'  🤝 合作伙伴: 创建 {created} 个')

    def _create_products(self):
        from apps.inventory.models import Product
        admin = User.objects.filter(is_superuser=True).first()
        created = 0
        for data in DEFAULT_PRODUCTS:
            try:
                uom = UOM.objects.get(name=data['uom_name'])
            except UOM.DoesNotExist:
                uom = UOM.objects.first()
            _, is_new = Product.objects.get_or_create(
                code=data['code'],
                defaults={
                    'name': data['name'],
                    'spec': data.get('spec', ''),
                    'category': data['category'],
                    'uom': uom,
                    'purchase_price': data['purchase_price'],
                    'sale_price': data['sale_price'],
                    'created_by': admin,
                    'updated_by': admin,
                },
            )
            if is_new:
                created += 1
        self.stdout.write(f'  📦 商品: 创建 {created} 个')
