from django.contrib import admin
from .models import Project, ContactSubmission, Service, StandardPage, UIBlock


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'is_featured', 'order', 'created_date']
    list_filter = ['category', 'is_featured', 'created_date']
    search_fields = ['title', 'title_ru', 'title_en', 'description']
    list_editable = ['is_featured', 'order']
    ordering = ['order', '-created_date']


@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'status', 'submitted_at']
    list_filter = ['status', 'submitted_at', 'consent_given']
    search_fields = ['name', 'email', 'message']
    readonly_fields = ['submitted_at', 'ip_address']
    ordering = ['-submitted_at']
    
    def has_add_permission(self, request):
        """Disable manual creation of submissions (only via API)."""
        return False


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'is_featured', 'order', 'created_date']
    list_filter = ['category', 'is_featured', 'created_date']
    search_fields = ['name', 'name_ru', 'name_en', 'description']
    list_editable = ['is_featured', 'order']
    ordering = ['order', '-created_date']


@admin.register(StandardPage)
class StandardPageAdmin(admin.ModelAdmin):
    list_display = ['slug', 'title', 'title_ru', 'title_en', 'updated_at']
    search_fields = ['slug', 'title', 'title_ru', 'title_en']
    prepopulated_fields = {"slug": ("title",)}


@admin.register(UIBlock)
class UIBlockAdmin(admin.ModelAdmin):
    list_display = ['section', 'key', 'description', 'updated_at']
    list_filter = ['section']
    search_fields = ['section', 'key', 'description', 'content', 'content_ru', 'content_en']
    fieldsets = (
        (None, {"fields": ("section", "key", "description")}),
        ("Content", {"fields": ("content", "content_ru", "content_en")}),
    )
