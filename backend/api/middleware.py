import logging
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)

class CORSMiddleware(MiddlewareMixin):
    """
    Middleware to ensure CORS headers are properly set for all responses.
    This is a fallback in case the django-cors-headers middleware doesn't work.
    """
    
    def process_request(self, request):
        # Add CORS headers to the request
        request.META['HTTP_ACCESS_CONTROL_ALLOW_ORIGIN'] = '*'
    
    def process_response(self, request, response):
        # Add CORS headers to the response
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        response["Access-Control-Allow-Credentials"] = "true"
        
        # Handle preflight requests
        if request.method == "OPTIONS":
            response.status_code = 200
            response["Access-Control-Max-Age"] = "86400"  # 24 hours
        
        return response 