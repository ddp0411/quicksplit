from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, SplitGroup, GroupMember, Expense, ExpenseShare,
    Settlement, Comment, Friendship, Split, Participant, DatasetEntry, GroupMessage
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'name', 'username', 'is_staff', 'is_superuser', 'created_at')
    list_filter = ('is_staff', 'is_superuser', 'is_active')
    search_fields = ('email', 'name', 'username')
    ordering = ('-created_at',)
    readonly_fields = ('id', 'created_at', 'updated_at')
    fieldsets = (
        (None, {'fields': ('id', 'username', 'email', 'password')}),
        ('Personal', {'fields': ('name', 'avatar_color', 'upi_id')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'name', 'password1', 'password2'),
        }),
    )


class GroupMemberInline(admin.TabularInline):
    model = GroupMember
    extra = 0
    readonly_fields = ('joined_at',)


@admin.register(SplitGroup)
class SplitGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'created_by', 'member_count', 'is_active', 'created_at')
    list_filter = ('category', 'is_active')
    search_fields = ('name', 'created_by__email', 'created_by__name')
    readonly_fields = ('id', 'created_at', 'updated_at')
    inlines = [GroupMemberInline]

    def member_count(self, obj):
        return obj.members.count()
    member_count.short_description = 'Members'


@admin.register(GroupMember)
class GroupMemberAdmin(admin.ModelAdmin):
    list_display = ('user', 'group', 'role', 'joined_at')
    list_filter = ('role',)
    search_fields = ('user__email', 'user__name', 'group__name')
    readonly_fields = ('joined_at',)


class ExpenseShareInline(admin.TabularInline):
    model = ExpenseShare
    extra = 0
    readonly_fields = ('settled_at',)


class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('description', 'amount', 'currency', 'category', 'paid_by', 'group', 'date', 'created_at')
    list_filter = ('category', 'split_type', 'currency', 'is_recurring')
    search_fields = ('description', 'paid_by__email', 'paid_by__name', 'group__name')
    readonly_fields = ('id', 'created_at', 'updated_at')
    date_hierarchy = 'date'
    inlines = [ExpenseShareInline, CommentInline]


@admin.register(ExpenseShare)
class ExpenseShareAdmin(admin.ModelAdmin):
    list_display = ('expense', 'user', 'amount_owed', 'is_settled', 'settled_at')
    list_filter = ('is_settled',)
    search_fields = ('expense__description', 'user__email', 'user__name')
    readonly_fields = ('settled_at',)


@admin.register(Settlement)
class SettlementAdmin(admin.ModelAdmin):
    list_display = ('from_user', 'to_user', 'amount', 'currency', 'group', 'created_at')
    list_filter = ('currency',)
    search_fields = ('from_user__email', 'to_user__email', 'group__name', 'upi_transaction_id')
    readonly_fields = ('id', 'created_at')
    date_hierarchy = 'created_at'


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'expense', 'content_preview', 'created_at')
    search_fields = ('user__email', 'expense__description', 'content')
    readonly_fields = ('created_at', 'updated_at')

    def content_preview(self, obj):
        return obj.content[:60] + '…' if len(obj.content) > 60 else obj.content
    content_preview.short_description = 'Content'


@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    list_display = ('requester', 'addressee', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('requester__email', 'addressee__email')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Split)
class SplitAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_amount', 'split_type', 'created_at')
    list_filter = ('split_type',)
    search_fields = ('user__email', 'user__name')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    list_display = ('name', 'split', 'amount', 'payment_status', 'upi_id', 'paid_at')
    list_filter = ('payment_status',)
    search_fields = ('name', 'upi_id')
    readonly_fields = ('id', 'created_at')


@admin.register(DatasetEntry)
class DatasetEntryAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'detected_total', 'actual_total', 'confidence', 'is_verified', 'created_at')
    list_filter = ('is_verified',)
    search_fields = ('user__email', 'ocr_text')
    readonly_fields = ('id', 'image_hash', 'created_at')
    date_hierarchy = 'created_at'


@admin.register(GroupMessage)
class GroupMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'group', 'user', 'content_preview', 'created_at')
    search_fields = ('user__email', 'group__name', 'content')
    readonly_fields = ('id', 'created_at')
    date_hierarchy = 'created_at'

    def content_preview(self, obj):
        return obj.content[:60] + '…' if len(obj.content) > 60 else obj.content
    content_preview.short_description = 'Message'
