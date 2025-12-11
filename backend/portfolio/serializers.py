from rest_framework import serializers
from .models import Project, ContactSubmission, Service, StandardPage, UIBlock


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for Project model."""
    
    class Meta:
        model = Project
        fields = [
            'id', 'slug', 'title', 'title_ru', 'title_en',
            'description', 'description_ru', 'description_en',
            'category', 'tags', 'featured_image', 'demo_url',
            'github_url', 'is_featured', 'created_date', 'updated_date'
        ]
        read_only_fields = ['id', 'slug', 'created_date', 'updated_date']
    
    def to_representation(self, instance):
        """Return appropriate language fields based on lang query parameter."""
        representation = super().to_representation(instance)
        request = self.context.get('request')
        
        if request:
            lang = request.query_params.get('lang', 'ru')
            
            # Use language-specific fields if available
            if lang == 'en':
                representation['title'] = representation.get('title_en') or representation.get('title')
                representation['description'] = representation.get('description_en') or representation.get('description')
            elif lang == 'ru':
                representation['title'] = representation.get('title_ru') or representation.get('title')
                representation['description'] = representation.get('description_ru') or representation.get('description')
        
        return representation


class ContactSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for ContactSubmission model."""
    
    class Meta:
        model = ContactSubmission
        fields = ['id', 'name', 'email', 'phone', 'message', 'consent_given', 'submitted_at', 'status']
        read_only_fields = ['id', 'submitted_at', 'status']
    
    def validate_consent_given(self, value):
        """Ensure consent is given."""
        if not value:
            raise serializers.ValidationError("You must provide consent to submit this form.")
        return value
    
    def validate(self, data):
        """Additional validation."""
        if not data.get('consent_given'):
            raise serializers.ValidationError({"consent_given": "Consent must be given to submit this form."})
        return data


class ServiceSerializer(serializers.ModelSerializer):
    """Serializer for Service model."""
    
    class Meta:
        model = Service
        fields = [
            'id', 'slug', 'name', 'name_ru', 'name_en',
            'description', 'description_ru', 'description_en',
            'price', 'category', 'is_featured', 'created_date'
        ]
        read_only_fields = ['id', 'slug', 'created_date']
    
    def to_representation(self, instance):
        """Return appropriate language fields based on lang query parameter."""
        representation = super().to_representation(instance)
        request = self.context.get('request')
        
        if request:
            lang = request.query_params.get('lang', 'ru')
            
            # Use language-specific fields if available
            if lang == 'en':
                representation['name'] = representation.get('name_en') or representation.get('name')
                representation['description'] = representation.get('description_en') or representation.get('description')
            elif lang == 'ru':
                representation['name'] = representation.get('name_ru') or representation.get('name')
                representation['description'] = representation.get('description_ru') or representation.get('description')
        
        return representation


class StandardPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = StandardPage
        fields = ['slug', 'title', 'title_ru', 'title_en', 'content', 'content_ru', 'content_en', 'updated_at']
        read_only_fields = fields

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        if request:
            lang = request.query_params.get("lang", "ru")
            if lang == "en":
                data["title"] = data.get("title_en") or data.get("title")
                data["content"] = data.get("content_en") or data.get("content")
            else:
                data["title"] = data.get("title_ru") or data.get("title")
                data["content"] = data.get("content_ru") or data.get("content")
        return {"slug": data.get("slug"), "title": data.get("title"), "content": data.get("content")}


class UIBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = UIBlock
        fields = ['section', 'key', 'description', 'content', 'content_ru', 'content_en', 'updated_at']
        read_only_fields = fields

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        if request:
            lang = request.query_params.get("lang")
            if lang == "en":
                data["content"] = data.get("content_en") or data.get("content")
            elif lang == "ru":
                data["content"] = data.get("content_ru") or data.get("content")
        return {
            "section": data.get("section"),
            "key": data.get("key"),
            "description": data.get("description"),
            "content": data.get("content"),
        }

