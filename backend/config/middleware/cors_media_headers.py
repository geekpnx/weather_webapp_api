class MediaCORSHeadersMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Allow both media requests AND upload API endpoints
        if request.path.startswith('/media/') or request.path.startswith('/api/'):
            response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, OPTIONS' 
            response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Cross-Origin-Resource-Policy'] = 'cross-origin'
        
        return response