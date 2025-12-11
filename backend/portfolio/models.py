from django.db import models
from django.core.validators import URLValidator, MinLengthValidator
from django.core.exceptions import ValidationError
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _


def generate_unique_slug(model_cls, base_value, instance=None, slug_field="slug"):
    """
    Generate a unique slug for the given model class.
    Excludes the current instance by pk to avoid collisions on update.
    """
    base_slug = slugify(base_value) or "item"
    slug = base_slug
    counter = 1
    qs = model_cls.objects.all()
    if instance and instance.pk:
        qs = qs.exclude(pk=instance.pk)
    while qs.filter(**{slug_field: slug}).exists():
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug


class Project(models.Model):
    """Represents a portfolio project/work item."""
    
    CATEGORY_CHOICES = [
        ('web-dev', _('Web Development')),
        ('marketing', _('Marketing')),
        ('pet-project', _('Pet Project')),
    ]
    
    # Base fields
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    
    # Translation fields
    title_ru = models.CharField(max_length=200, blank=True, null=True)
    title_en = models.CharField(max_length=200, blank=True, null=True)
    description_ru = models.TextField(blank=True, null=True)
    description_en = models.TextField(blank=True, null=True)
    
    # Tags as JSON array (stored as text, parsed in serializer)
    tags = models.JSONField(default=list, blank=True)
    
    # Media and links
    featured_image = models.ImageField(upload_to='projects/', blank=True, null=True)
    demo_url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    
    # Metadata
    is_featured = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', '-created_date']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['created_date']),
            models.Index(fields=['is_featured']),
        ]
    
    def __str__(self):
        return self.title
    
    def clean(self):
        """Validate that at least title and description are provided."""
        if not self.title:
            raise ValidationError({'title': 'Title is required'})
        if not self.description:
            raise ValidationError({'description': 'Description is required'})

    def save(self, *args, **kwargs):
        if not self.slug and self.title:
            self.slug = generate_unique_slug(Project, self.title, instance=self)
        super().save(*args, **kwargs)


class ContactSubmission(models.Model):
    """Represents a contact form submission."""
    
    STATUS_CHOICES = [
        ('new', _('New')),
        ('read', _('Read')),
        ('replied', _('Replied')),
    ]
    
    name = models.CharField(max_length=100, validators=[MinLengthValidator(2)])
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    message = models.TextField(validators=[MinLengthValidator(10)])
    consent_given = models.BooleanField(default=False)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='new')
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['submitted_at']),
            models.Index(fields=['status']),
            models.Index(fields=['email']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.email} - {self.submitted_at.strftime('%Y-%m-%d')}"
    
    def clean(self):
        """Validate consent is given."""
        if not self.consent_given:
            raise ValidationError({'consent_given': 'Consent must be given to submit this form'})


class Service(models.Model):
    """Represents a service offering."""
    
    CATEGORY_CHOICES = [
        ('full-site', _('Full Site Development')),
        ('development', _('Development')),
        ('marketing', _('Marketing')),
    ]
    
    # Base fields
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    
    # Translation fields
    name_ru = models.CharField(max_length=200, blank=True, null=True)
    name_en = models.CharField(max_length=200, blank=True, null=True)
    description_ru = models.TextField(blank=True, null=True)
    description_en = models.TextField(blank=True, null=True)
    
    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    
    # Metadata
    is_featured = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', '-created_date']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['is_featured']),
            models.Index(fields=['order']),
        ]
    
    def __str__(self):
        return self.name
    
    def clean(self):
        """Validate price is positive if provided."""
        if self.price is not None and self.price < 0:
            raise ValidationError({'price': 'Price must be positive'})

    def save(self, *args, **kwargs):
        if not self.slug and self.name:
            self.slug = generate_unique_slug(Service, self.name, instance=self)
        super().save(*args, **kwargs)


class StandardPage(models.Model):
    """Static pages like privacy policy or terms."""

    slug = models.SlugField(max_length=150, unique=True)
    title = models.CharField(max_length=255)
    title_ru = models.CharField(max_length=255, blank=True, null=True)
    title_en = models.CharField(max_length=255, blank=True, null=True)
    content = models.TextField()
    content_ru = models.TextField(blank=True, null=True)
    content_en = models.TextField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Standard Page")
        verbose_name_plural = _("Standard Pages")
        ordering = ["slug"]

    def __str__(self):
        return self.title or self.slug


class UIBlock(models.Model):
    """Key-value text blocks for UI sections."""

    SECTION_CHOICES = (
        ("HOMEPAGE", _("Homepage")),
        ("FOOTER", _("Footer")),
        ("GLOBAL", _("Global")),
    )

    section = models.CharField(max_length=100, choices=SECTION_CHOICES, db_index=True)
    key = models.CharField(max_length=150)
    description = models.CharField(max_length=255, blank=True, help_text=_("Where this block is used"))
    content = models.TextField()
    content_ru = models.TextField(blank=True, null=True)
    content_en = models.TextField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("section", "key")
        verbose_name = _("UI Block")
        verbose_name_plural = _("UI Blocks")
        ordering = ["section", "key"]

    def __str__(self):
        return f"{self.section} - {self.key}"
