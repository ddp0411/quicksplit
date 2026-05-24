from django.urls import path

from api import views

urlpatterns = [
    path("auth/register", views.RegisterView.as_view(), name="auth-register"),
    path("auth/login", views.LoginView.as_view(), name="auth-login"),
    path("auth/me", views.MeView.as_view(), name="auth-me"),
    path("ocr/upload", views.OCRUploadView.as_view(), name="ocr-upload"),
    path("ocr/validate", views.OCRValidateView.as_view(), name="ocr-validate"),
    path("splits/create", views.SplitCreateView.as_view(), name="split-create"),
    path("splits/history", views.SplitHistoryView.as_view(), name="split-history"),
    path("splits/<uuid:split_id>", views.SplitDetailView.as_view(), name="split-detail"),
    path(
        "splits/<uuid:split_id>/participants/<uuid:participant_id>/paid",
        views.MarkParticipantPaidView.as_view(),
        name="split-participant-paid",
    ),
    path("dataset/submit", views.DatasetSubmitView.as_view(), name="dataset-submit"),
    path("dataset/stats", views.DatasetStatsView.as_view(), name="dataset-stats"),
]
