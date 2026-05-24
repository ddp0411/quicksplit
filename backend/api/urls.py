from django.urls import path
from api import views

urlpatterns = [
    # Auth
    path("auth/register", views.RegisterView.as_view(), name="auth-register"),
    path("auth/login", views.LoginView.as_view(), name="auth-login"),
    path("auth/me", views.MeView.as_view(), name="auth-me"),

    # OCR
    path("ocr/upload", views.OCRUploadView.as_view(), name="ocr-upload"),
    path("ocr/validate", views.OCRValidateView.as_view(), name="ocr-validate"),

    # Original QuickSplit splits (OCR → UPI flow)
    path("splits/create", views.SplitCreateView.as_view(), name="split-create"),
    path("splits/history", views.SplitHistoryView.as_view(), name="split-history"),
    path("splits/<uuid:split_id>", views.SplitDetailView.as_view(), name="split-detail"),
    path(
        "splits/<uuid:split_id>/participants/<uuid:participant_id>/paid",
        views.MarkParticipantPaidView.as_view(),
        name="split-participant-paid",
    ),

    # Dataset
    path("dataset/submit", views.DatasetSubmitView.as_view(), name="dataset-submit"),
    path("dataset/stats", views.DatasetStatsView.as_view(), name="dataset-stats"),

    # Friends (Splitwise-style)
    path("friends/", views.FriendListView.as_view(), name="friend-list"),
    path("friends/requests/", views.FriendRequestListView.as_view(), name="friend-requests"),
    path("friends/requests/<int:friendship_id>/<str:action>/", views.FriendRequestActionView.as_view(), name="friend-action"),
    path("friends/<uuid:user_id>/", views.FriendDetailView.as_view(), name="friend-detail"),

    # Users
    path("users/search/", views.SearchUsersView.as_view(), name="user-search"),

    # Groups
    path("groups/", views.GroupListView.as_view(), name="group-list"),
    path("groups/<uuid:group_id>/", views.GroupDetailView.as_view(), name="group-detail"),
    path("groups/<uuid:group_id>/members/", views.GroupMemberView.as_view(), name="group-member-add"),
    path("groups/<uuid:group_id>/members/<uuid:user_id>/", views.GroupMemberView.as_view(), name="group-member-remove"),
    path("groups/<uuid:group_id>/balances/", views.GroupBalanceView.as_view(), name="group-balances"),

    # Expenses
    path("expenses/", views.ExpenseListView.as_view(), name="expense-list"),
    path("expenses/<uuid:expense_id>/", views.ExpenseDetailView.as_view(), name="expense-detail"),
    path("expenses/<uuid:expense_id>/comments/", views.ExpenseCommentView.as_view(), name="expense-comments"),

    # Balances
    path("balances/", views.OverallBalanceView.as_view(), name="balances"),

    # Settlements
    path("settlements/", views.SettlementListView.as_view(), name="settlement-list"),

    # Activity
    path("activity/", views.ActivityFeedView.as_view(), name="activity"),
]
