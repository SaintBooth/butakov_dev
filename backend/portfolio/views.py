from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import AnonRateThrottle
from django.db.models import Q
from .models import Project, ContactSubmission, Service, StandardPage, UIBlock
from .serializers import ProjectSerializer, ContactSubmissionSerializer, ServiceSerializer, StandardPageSerializer, UIBlockSerializer


class ProjectListView(APIView):
    """List and filter projects."""
    
    def get(self, request):
        """Get list of projects with optional filtering."""
        queryset = Project.objects.all()
        
        # Filter by category
        category = request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by featured (order by most recently updated per FR-011)
        featured = request.query_params.get('featured', None)
        if featured == 'true':
            queryset = queryset.filter(is_featured=True).order_by('-updated_date')
        
        # Pagination
        page_size = int(request.query_params.get('page_size', 10))
        page = int(request.query_params.get('page', 1))
        
        # Limit page_size to max 100
        page_size = min(page_size, 100)
        
        start = (page - 1) * page_size
        end = start + page_size
        
        total_count = queryset.count()
        projects = queryset[start:end]
        
        serializer = ProjectSerializer(projects, many=True, context={'request': request})
        
        return Response({
            'count': total_count,
            'next': f"{request.build_absolute_uri()}?page={page + 1}" if end < total_count else None,
            'previous': f"{request.build_absolute_uri()}?page={page - 1}" if page > 1 else None,
            'results': serializer.data
        })


class ContactSubmissionCreateView(APIView):
    """Create a new contact submission."""
    
    throttle_classes = [AnonRateThrottle]  # Rate limiting: 5 requests per hour
    
    def get(self, request):
        """Return API usage information."""
        return Response({
            'message': 'Contact form API endpoint',
            'method': 'POST',
            'required_fields': {
                'name': 'string (2-100 characters)',
                'email': 'string (valid email)',
                'phone': 'string (optional, max 20 characters)',
                'message': 'string (min 10 characters)',
                'consent_given': 'boolean (must be true)'
            },
            'example': {
                'name': 'John Doe',
                'email': 'john@example.com',
                'phone': '+79001234567',
                'message': 'I am interested in your services.',
                'consent_given': True
            }
        }, status=status.HTTP_200_OK)
    
    def post(self, request):
        """Create contact submission and send Telegram notification."""
        serializer = ContactSubmissionSerializer(data=request.data)
        
        if serializer.is_valid():
            # Get IP address from request
            ip_address = self.get_client_ip(request)
            
            # Create submission
            submission = serializer.save(
                ip_address=ip_address,
                status='new'
            )
            
            # Send Telegram notification (async via signal)
            # Signal will handle this automatically
            
            return Response({
                'id': submission.id,
                'status': 'success',
                'message': 'Thank you for your submission! We\'ll get back to you soon.'
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'status': 'error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def get_client_ip(self, request):
        """Get client IP address from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class ServiceListView(APIView):
    """List services."""
    
    def get(self, request):
        """Get list of services with optional filtering."""
        queryset = Service.objects.all()
        
        # Filter by category
        category = request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by featured
        featured = request.query_params.get('featured', None)
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)
        
        serializer = ServiceSerializer(queryset, many=True, context={'request': request})
        
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })


class HealthCheckView(APIView):
    """Health check endpoint for Docker."""
    
    def get(self, request):
        return Response({'status': 'ok'}, status=status.HTTP_200_OK)


class StandardPageDetailView(APIView):
    """Fetch a translated standard page by slug."""

    def get(self, request, slug):
        try:
            page = StandardPage.objects.get(slug=slug)
        except StandardPage.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = StandardPageSerializer(page, context={"request": request})
        return Response(serializer.data)


class UIBlockListView(APIView):
    """Fetch UI blocks for a given section."""

    def get(self, request):
        section = request.query_params.get("section")
        qs = UIBlock.objects.all()
        if section:
            qs = qs.filter(section=section)

        serializer = UIBlockSerializer(qs, many=True, context={"request": request})
        # Build key-value payload
        payload = {item["key"]: item["content"] for item in serializer.data}
        return Response(payload)
