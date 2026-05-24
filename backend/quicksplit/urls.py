from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView


def root(_request):
    return JsonResponse({"name": "QuickSplit API", "version": "1.0.0", "status": "running"})


def health(_request):
    return JsonResponse({"status": "healthy"})


urlpatterns = [
    path("", root),
    path("health", health),
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/v1/", include("api.urls")),
]
