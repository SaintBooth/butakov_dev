from django.urls import path
from .views import (
    ProjectListView,
    ContactSubmissionCreateView,
    ServiceListView,
    HealthCheckView,
    StandardPageDetailView,
    UIBlockListView,
)

app_name = 'portfolio'

urlpatterns = [
    path('projects/', ProjectListView.as_view(), name='project-list'),
    path('contact/', ContactSubmissionCreateView.as_view(), name='contact-create'),
    path('services/', ServiceListView.as_view(), name='service-list'),
    path('pages/<slug:slug>/', StandardPageDetailView.as_view(), name='standard-page-detail'),
    path('blocks/', UIBlockListView.as_view(), name='ui-block-list'),
    path('health/', HealthCheckView.as_view(), name='health-check'),
]

