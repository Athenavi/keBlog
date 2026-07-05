from django.contrib import admin
from .models import User, Sequence, UOM, UOMConversion, Partner, Role, StatusLog


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'employee_id', 'department', 'email', 'phone', 'is_active')
    search_fields = ('username', 'employee_id', 'email', 'phone')


@admin.register(Sequence)
class SequenceAdmin(admin.ModelAdmin):
    list_display = ('prefix', 'year', 'month', 'day', 'last_number')


@admin.register(UOM)
class UOMAdmin(admin.ModelAdmin):
    list_display = ('name', 'short_name', 'category')


@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'type', 'contact_person', 'phone', 'is_active')
    list_filter = ('type', 'is_active')
    search_fields = ('code', 'name', 'contact_person')


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'is_system')


@admin.register(StatusLog)
class StatusLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'from_status', 'to_status', 'operator', 'created_at')
    readonly_fields = ('action', 'from_status', 'to_status', 'operator', 'created_at')
